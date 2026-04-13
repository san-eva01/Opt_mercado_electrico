# ☀️ Solar POWER — Irradiancia Solar México

Aplicación web para consultar datos de irradiancia solar desde **NASA POWER API**.

```
proyecto/
├── backend/      → FastAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   └── Procfile
└── frontend/     → Next.js (TypeScript + Tailwind)
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── globals.css
    ├── package.json
    └── ...config files
```

---

## 🚀 Ejecución local

### 1. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

Docs interactivos en: http://localhost:8000/docs

---

### 2. Frontend (Next.js)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Iniciar en modo desarrollo
npm run dev
```

Abre: http://localhost:3000

---

## ☁️ Deploy en producción

### Backend → Railway

1. Crea cuenta en https://railway.app
2. Nuevo proyecto → "Deploy from GitHub repo"
3. Selecciona la carpeta `backend/` (o sube solo esa carpeta)
4. Railway detecta el `Procfile` automáticamente
5. Copia la URL pública que Railway te asigna (ej: `https://solar-api.railway.app`)

### Frontend → Vercel

1. Crea cuenta en https://vercel.com
2. "New Project" → importa tu repo de GitHub
3. En "Root Directory" selecciona `frontend/`
4. Agrega variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL de Railway del paso anterior
5. Deploy 🚀

---

## 🔌 Endpoint del backend

### `POST /api/solar-data`

**Body (JSON):**
```json
{
  "lat": 19.4326,
  "lon": -99.1332,
  "start": "20240101",
  "end": "20240107"
}
```

**Respuesta:**
```json
{
  "preview": [...],        // Primeras 24 filas
  "total_rows": 168,       // Total de registros
  "columns": ["datetime", "ALLSKY_SFC_SW_DWN"],
  "lat": 19.4326,
  "lon": -99.1332,
  "start": "20240101",
  "end": "20240107"
}
```

---

## Notas importantes

- El mapa SVG es un contorno simplificado de México. Para producción puedes reemplazarlo con **Leaflet.js** o **react-map-gl** con tiles reales.
- NASA POWER puede tardar 5-15 segundos en responder según el rango de fechas.
- Valores `-999` en los datos significan "sin datos disponibles" (se reemplazan por `NaN`).
- La unidad de `ALLSKY_SFC_SW_DWN` es **kW·h/m²**.