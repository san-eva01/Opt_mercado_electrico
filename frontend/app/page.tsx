"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MapSelector = dynamic(() => import("../components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[#4a7fa8] text-sm">
      Cargando mapa...
    </div>
  ),
});

interface SolarResponse {
  preview: Record<string, number | string>[];
  total_rows: number;
  columns: string[];
  lat: number;
  lon: number;
  start: string;
  end: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toNasaDate = (d: string) => d.replace(/-/g, "");

  const handleMapClick = useCallback((newLat: number, newLon: number) => {
    setLat(parseFloat(newLat.toFixed(4)));
    setLon(parseFloat(newLon.toFixed(4)));
    setResult(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!lat || !lon) return setError("Selecciona un punto en el mapa.");
    if (!start || !end) return setError("Selecciona el rango de fechas.");
    if (start > end) return setError("La fecha inicio debe ser anterior a la fecha fin.");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/solar-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, start: toNasaDate(start), end: toNasaDate(end) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Error del servidor.");
      }
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white font-mono">
      <header className="border-b border-[#1e3a5f] px-8 py-5 flex items-center gap-4">
        <span className="text-2xl">☀️</span>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-[#f0c040] uppercase">Solar POWER</h1>
          <p className="text-xs text-[#4a7fa8] tracking-wider">Irradiancia Solar · NASA POWER API · México</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Mapa */}
          <div className="space-y-3">
            <label className="text-xs tracking-widest text-[#4a7fa8] uppercase">
              01 · Selecciona ubicación en México
            </label>
            <div className="relative rounded-xl border border-[#1e3a5f] overflow-hidden h-[420px]">
              <MapSelector onLocationSelect={handleMapClick} lat={lat} lon={lon} />
              {lat && lon && (
                <div className="absolute bottom-3 right-3 z-[1000] bg-[#0a0f1e]/90 border border-[#f0c040]/30 rounded px-3 py-1.5 text-xs text-[#f0c040] tabular-nums pointer-events-none">
                  {lat.toFixed(4)}°N · {lon.toFixed(4)}°W
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs tracking-widest text-[#4a7fa8] uppercase">02 · Período de tiempo</label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-[#3a6a88]">Fecha inicio</span>
                  <input type="date" value={start} onChange={(e) => setStart(e.target.value)} max={end || undefined}
                    className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f0c040] transition-colors [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-[#3a6a88]">Fecha fin</span>
                  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} min={start || undefined}
                    className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f0c040] transition-colors [color-scheme:dark]" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#1e3a5f] bg-[#0d1b2a] p-5 space-y-2 text-sm">
              <p className="text-xs text-[#4a7fa8] uppercase tracking-widest mb-3">Parámetros</p>
              <Row label="Latitud"  value={lat  ? `${lat}°`  : "—"} />
              <Row label="Longitud" value={lon  ? `${lon}°`  : "—"} />
              <Row label="Inicio"   value={start || "—"} />
              <Row label="Fin"      value={end   || "—"} />
              <Row label="Variable" value="ALLSKY_SFC_SW_DWN" highlight />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all duration-200 bg-[#f0c040] text-[#0a0f1e] hover:bg-[#ffd060] disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? "Consultando NASA POWER..." : "Consultar Datos →"}
            </button>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-400 text-sm">⚠ {error}</div>
            )}
          </div>
        </div>

        {/* Resultados */}
        {result && (
          <div className="space-y-4 border-t border-[#1e3a5f] pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#f0c040] tracking-wider">Vista Previa de Datos</h2>
                <p className="text-xs text-[#4a7fa8] mt-1">
                  Mostrando 24 de {result.total_rows.toLocaleString()} registros · {result.lat}°N, {result.lon}°W
                </p>
              </div>
              <span className="text-xs border border-[#1e6b3a] text-[#4ab870] px-3 py-1 rounded-full">
                ✓ {result.total_rows.toLocaleString()} registros totales
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1e3a5f]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1b2a] border-b border-[#1e3a5f]">
                    {result.columns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs tracking-widest text-[#4a7fa8] uppercase whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.preview.map((row, i) => (
                    <tr key={i} className="border-b border-[#0d1b2a] hover:bg-[#0d1b2a]/60 transition-colors">
                      {result.columns.map((col) => (
                        <td key={col} className={`px-4 py-2.5 tabular-nums whitespace-nowrap ${col === "ALLSKY_SFC_SW_DWN" ? "text-[#f0c040] font-bold" : "text-[#8ab0c8]"}`}>
                          {row[col] != null ? String(row[col]) : "No disponible"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#2a5a7a] text-center">Unidad: kW·h/m² · Valores -999 reemplazados por NaN</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#3a6a88]">{label}</span>
      <span className={highlight ? "text-[#f0c040] text-xs" : "text-white"}>{value}</span>
    </div>
  );
}