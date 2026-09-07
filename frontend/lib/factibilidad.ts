export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export interface PrecioHorario { fecha: string; hora: number; precio: number }
export interface DatoAnual {
  fecha: string;
  hora: number;
  mesIndex: number;
  irradiancia: number;
  precio: number;
  generacion: number;
  ingreso: number;
}
export interface DatoMensual { mes: string; mesIndex: number; generacion: number; ingreso: number }
export interface DatoDiario { dia: number; generacion: number; ingreso: number }

export function unirDatosAnuales(
  solar: Record<string, number | string>[], precios: PrecioHorario[],
  year: number, capacidad: number, eficiencia: number,
): DatoAnual[] {
  // La eficiencia es un factor de 0 a 1, nunca un porcentaje de 0 a 100.
  if (!Number.isFinite(eficiencia) || eficiencia < 0 || eficiencia > 1) {
    throw new Error("La eficiencia debe ser un factor entre 0 y 1 (0.8 = 80%).");
  }
  // CENACE publica horas 1–24; se admiten también tablas normalizadas a 0–23.
  const base = precios.some((p) => p.hora === 0) ? 0 : 1;
  const porHora = new Map<string, number>();
  for (const p of precios) {
    const hora = p.hora - base;
    if (!Number.isInteger(hora) || hora < 0 || hora > 23 || !Number.isFinite(p.precio)) continue;
    const key = `${p.fecha.slice(0, 10)} ${String(hora).padStart(2, "0")}`;
    // Una copia idéntica no representa otra hora de generación ni otro ingreso.
    const anterior = porHora.get(key);
    if (anterior !== undefined) {
      if (anterior === p.precio) continue;
      throw new Error(
        `Precios MDA distintos para la misma fecha y hora: ${key} (hora de origen ${p.hora}): ${anterior} y ${p.precio} MXN/MWh. Revisa cuál corresponde al nodo.`,
      );
    }
    porHora.set(key, p.precio);
  }
  const datos = new Map<string, DatoAnual>();
  for (const row of solar) {
    const datetime = String(row.datetime).replace("T", " ");
    const fecha = datetime.slice(0, 10);
    const hora = Number(datetime.slice(11, 13));
    const key = `${fecha} ${String(hora).padStart(2, "0")}`;
    const irradiancia = row.ALLSKY_SFC_SW_DWN;
    const precio = porHora.get(key);
    if (Number(fecha.slice(0, 4)) !== year || !Number.isInteger(hora) || hora < 0 || hora > 23) continue;
    if (typeof irradiancia !== "number" || !Number.isFinite(irradiancia) || irradiancia < 0 || precio === undefined) continue;
    // El backend ya convierte el dato horario de NASA a kWh/m².
    const generacion = irradiancia * capacidad * eficiencia;
    const ingreso = generacion * precio / 1000;
    if (datos.has(key)) throw new Error(`Irradiancia duplicada: ${key}.`);
    datos.set(key, { fecha, hora, mesIndex: Number(fecha.slice(5, 7)) - 1, irradiancia, precio, generacion, ingreso });
  }
  return [...datos.values()].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora - b.hora);
}

export function agruparMeses(datos: DatoAnual[]): DatoMensual[] {
  const meses = MESES.map((mes, mesIndex) => ({ mes, mesIndex, generacion: 0, ingreso: 0 }));
  for (const row of datos) {
    meses[row.mesIndex].generacion += row.generacion;
    meses[row.mesIndex].ingreso += row.ingreso;
  }
  return meses;
}

export function agruparDias(datos: DatoAnual[], mes: number | null, year: number): DatoDiario[] {
  if (mes === null || !Number.isFinite(year)) return [];
  const dias = Array.from({ length: new Date(Date.UTC(year, mes + 1, 0)).getUTCDate() }, (_, i) => ({ dia: i + 1, generacion: 0, ingreso: 0 }));
  for (const row of datos) {
    if (row.mesIndex !== mes) continue;
    const dia = dias[Number(row.fecha.slice(8, 10)) - 1];
    dia.generacion += row.generacion;
    dia.ingreso += row.ingreso;
  }
  return dias;
}

export function calcularSeparacion(lat: number, alturaPanel: number, tiltAnual: number): { H: number; d: number } {
  const declinacion = -23.45;
  const anguloHorario = 37.5; // Parámetro solicitado para el escenario de diseño.
  const latRad = lat * Math.PI / 180;
  const decRad = declinacion * Math.PI / 180;
  const haRad = anguloHorario * Math.PI / 180;
  const sinH = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const H = Math.asin(Math.max(-1, Math.min(1, sinH))) * 180 / Math.PI;
  const HRad = H * Math.PI / 180;
  const betaRad = tiltAnual * Math.PI / 180;
  const d = alturaPanel * Math.sin(HRad + betaRad) / Math.sin(HRad);
  return { H, d };
}
