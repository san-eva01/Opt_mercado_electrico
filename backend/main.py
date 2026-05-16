"""
Backend - API de Irradiancia Solar (NASA POWER)
Endpoint principal: POST /api/solar-data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse          
from pydantic import BaseModel
import pandas as pd
import httpx
import io
from datetime import date
# reportlab 
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import cm

# Inicialización
app = FastAPI(
    title="Solar Irradiance API",
    description="Consulta datos de irradiancia solar desde NASA POWER",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # En producción reemplaza "*" con tu dominio de Vercel
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Modelos de datos
# ─────────────────────────────────────────────
class SolarRequest(BaseModel):
    lat: float          # Latitud del punto seleccionado en el mapa
    lon: float          # Longitud del punto seleccionado en el mapa
    start: str          # Fecha inicio en formato YYYYMMDD
    end: str            # Fecha fin en formato YYYYMMDD


class SolarResponse(BaseModel):
    preview: list[dict]     # Primeras filas del DataFrame como lista de dicts
    total_rows: int          # Total de registros obtenidos
    columns: list[str]       # Nombres de columnas limpias
    lat: float
    lon: float
    start: str
    end: str

# modelos de datos para el reporte
class DatoFactibilidad(BaseModel):
    hora: str
    generacion: float
    ingreso: float
    irradiancia: float
    precio: float

class ReporteRequest(BaseModel):
    capacidad: float
    eficiencia: float
    tipoCambio: float
    semana: dict
    datosFactibilidad: list[DatoFactibilidad]
    calculos: dict
    nodo: str
    mercado: str
    lat: float
    lon: float

# ─────────────────────────────────────────────
# Utilidades
# ─────────────────────────────────────────────
NASA_BASE_URL = "https://power.larc.nasa.gov/api/temporal/hourly/point"

def build_nasa_url(lat: float, lon: float, start: str, end: str) -> str:
    """Construye la URL de la API de NASA POWER con los parámetros dados."""
    params = {
        "parameters": "ALLSKY_SFC_SW_DWN",
        "community": "RE",
        "longitude": lon,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "CSV",
        "header": "false",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{NASA_BASE_URL}?{query}"


def fetch_and_process(url: str) -> pd.DataFrame:
    """
    Descarga el CSV desde NASA POWER y lo procesa con pandas:
    - Convierte YEAR, MO, DY, HR en un índice datetime
    - Elimina columnas innecesarias
    - Reemplaza valores -999 (sin dato) por NaN
    """
    response = httpx.get(url, timeout=60)
    response.raise_for_status()

    raw_text = response.text

    # NASA incluye líneas de cabecera con metadatos; el CSV real empieza
    # cuando aparece la línea con "YEAR,MO,DY,HR,..."
    lines = raw_text.splitlines()
    header_idx = next(
        (i for i, line in enumerate(lines) if line.startswith("YEAR")), None
    )
    if header_idx is None:
        raise ValueError("No se encontró el encabezado CSV en la respuesta de NASA POWER.")

    csv_clean = "\n".join(lines[header_idx:])
    df = pd.read_csv(io.StringIO(csv_clean))

    # Crear columna datetime y usarla como índice
    df["datetime"] = pd.to_datetime(
        df[["YEAR", "MO", "DY", "HR"]].rename(
            columns={"YEAR": "year", "MO": "month", "DY": "day", "HR": "hour"}
        )
    )
    df.set_index("datetime", inplace=True)

    # Eliminar columnas de tiempo individuales (ya están en el índice)
    df.drop(columns=["YEAR", "MO", "DY", "HR"], inplace=True, errors="ignore")
    
#pasa a kiloWatt ya que estan en W/m2, y es mas comun en kW/m2
    df["ALLSKY_SFC_SW_DWN"] = df["ALLSKY_SFC_SW_DWN"] / 1000
    # Reemplazar valores centinela de NASA (-999) por NaN
    df.replace(-999.0, float("nan"), inplace=True)

    return df


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@app.get("/")
def root():
    """Health check."""
    return {"status": "ok", "message": "Solar Irradiance API funcionando correctamente."}


@app.post("/api/solar-data", response_model=SolarResponse)
async def get_solar_data(req: SolarRequest):
    """
    Recibe coordenadas y rango de fechas.
    Consulta NASA POWER, procesa los datos y devuelve una vista previa.
    """
    # Validar que las fechas tengan el formato correcto
    try:
        date(int(req.start[:4]), int(req.start[4:6]), int(req.start[6:]))
        date(int(req.end[:4]), int(req.end[4:6]), int(req.end[6:]))
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha inválido. Usa YYYYMMDD."
        )

    # Validar coordenadas dentro de México (rango aproximado)
    if not (-118.5 <= req.lon <= -86.5 and 14.5 <= req.lat <= 32.7):
        raise HTTPException(
            status_code=400,
            detail="Las coordenadas deben estar dentro del territorio mexicano."
        )

    url = build_nasa_url(req.lat, req.lon, req.start, req.end)

    try:
        df = fetch_and_process(url)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar NASA POWER: {e.response.status_code}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Preparar respuesta: índice datetime como string para serialización JSON
    df_preview = df.copy()
    df_preview.index = df_preview.index.strftime("%Y-%m-%d %H:%M")

    return SolarResponse(
        preview=df_preview.reset_index().to_dict(orient="records"),
        total_rows=len(df),
        columns=["datetime"] + df.columns.tolist(),
        lat=req.lat,
        lon=req.lon,
        start=req.start,
        end=req.end,
    )
    
    
@app.post("/api/reporte-pdf")
async def generar_reporte_pdf(req: ReporteRequest):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elements = []

    # ── Título ──
    elements.append(Paragraph("Reporte de Factibilidad Fotovoltaica", styles["Title"]))
    elements.append(Spacer(1, 0.5*cm))

    # ── Parámetros del sistema ──
    elements.append(Paragraph("Parámetros del sistema", styles["Heading2"]))
    elements.append(Spacer(1, 0.3*cm))

    params = [
        ["Nodo", req.nodo],
        ["Mercado", req.mercado],
        ["Ubicación", f"{req.lat}°N, {req.lon}°W"],
        ["Semana analizada", f"{req.semana['inicio']} al {req.semana['fin']}"],
        ["Capacidad instalada", f"{req.capacidad} kW"],
        ["Eficiencia", f"{req.eficiencia} %"],
        ["Tipo de cambio", f"${req.tipoCambio:.2f} MXN/USD"],
    ]

    t = Table(params, colWidths=[6*cm, 10*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FEF3C7")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.8*cm))

    # ── Tabla de generación e ingreso ──
    elements.append(Paragraph("Generación e ingreso pronosticado por hora", styles["Heading2"]))
    elements.append(Spacer(1, 0.3*cm))

    tabla_datos = [["Hora", "Irradiancia (kW·h/m²)", "Generación (kWh)", "Precio ($/MWh)", "Ingreso ($)"]]
    for d in req.datosFactibilidad:
        tabla_datos.append([
            d.hora,
            f"{d.irradiancia:.4f}",
            f"{d.generacion:.4f}",
            f"{d.precio:.2f}",
            f"${d.ingreso:.4f}",
        ])

    t2 = Table(tabla_datos, colWidths=[2.5*cm, 4*cm, 3.5*cm, 3.5*cm, 3*cm])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F59E0B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 0.8*cm))

    # ── Inversión y retorno ──
    elements.append(Paragraph("Análisis de inversión y retorno", styles["Heading2"]))
    elements.append(Spacer(1, 0.3*cm))

    inversion = [
        ["Inversión estimada (USD)", f"${req.calculos['inversionUSD']}"],
        ["Inversión estimada (MXN)", f"${req.calculos['inversionMXN']}"],
        ["Ingreso anual estimado", f"${req.calculos['ingresoAnual']}"],
        ["Años de retorno de inversión", f"{req.calculos['anosRetorno']} años"],
    ]

    t3 = Table(inversion, colWidths=[9*cm, 7*cm])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FEF3C7")),
        ("BACKGROUND", (1, 3), (1, 3), colors.HexColor("#FEF3C7")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(t3)

    # ── Generar PDF ──
    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reporte_{req.nodo}.pdf"}
    )