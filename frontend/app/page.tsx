"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const MapSelector = dynamic(() => import("../components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
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

  // Preparar datos para la gráfica
  const chartData = result?.preview.map((row) => ({
    hora: row["datetime"] as string,
    irradiancia: row["ALLSKY_SFC_SW_DWN"] === -999 ? null : (row["ALLSKY_SFC_SW_DWN"] as number),
  })) ?? [];

  return (
    <main className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="white"/>
            <line x1="8" y1="1" x2="8" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="13" x2="8" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="8" x2="3" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2.93" y1="2.93" x2="4.34" y2="4.34" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11.66" y1="11.66" x2="13.07" y2="13.07" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13.07" y1="2.93" x2="11.66" y2="4.34" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4.34" y1="11.66" x2="2.93" y2="13.07" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-gray-900">Solar POWER</h1>
          <p className="text-xs text-gray-400">Irradiancia Solar · NASA POWER · México</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Grid mapa + controles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Mapa */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              01 · Ubicación
            </label>
            <div className="relative rounded-xl border border-gray-200 overflow-hidden h-[380px]">
              <MapSelector onLocationSelect={handleMapClick} lat={lat} lon={lon} />
              {lat && lon && (
                <div className="absolute bottom-3 right-3 z-[1000] bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 shadow-sm pointer-events-none">
                  {lat.toFixed(4)}°N · {lon.toFixed(4)}°W
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                02 · Período
              </label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Fecha inicio</span>
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    max={end || undefined}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Fecha fin</span>
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    min={start || undefined}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Parámetros</p>
              <Row label="Latitud"  value={lat  ? `${lat}°`  : "—"} />
              <Row label="Longitud" value={lon  ? `${lon}°`  : "—"} />
              <Row label="Inicio"   value={start || "—"} />
              <Row label="Fin"      value={end   || "—"} />
              <Row label="Variable" value="ALLSKY_SFC_SW_DWN" accent />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-150
                         bg-amber-400 text-white hover:bg-amber-500
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Consultando NASA POWER..." : "Consultar datos →"}
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        {result && (
          <div className="space-y-8 border-t border-gray-100 pt-10">

            {/* Encabezado resultados */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Resultados</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {result.total_rows.toLocaleString()} registros · {result.lat}°N, {result.lon}°W
                </p>
              </div>
              <span className="text-xs border border-green-200 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {result.total_rows.toLocaleString()} registros totales
              </span>
            </div>

            {/* Gráfica de irradiancia */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Irradiancia solar horaria — ALLSKY_SFC_SW_DWN (kW·h/m²)
              </h3>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="hora"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      interval={Math.floor(chartData.length / 8)}
                      tickFormatter={(v) => v?.toString().slice(11, 16) || ""}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                      }}
                      formatter={(value: any) => {
                        const numericValue = value as string | number | null | undefined;
                        return numericValue == null
                          ? ["No disponible", "Irradiancia"]
                          : [`${numericValue} kW·h/m²`, "Irradiancia"];
                      }}
                      labelFormatter={(label) => `Hora: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="irradiancia"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#f59e0b" }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla completa scrollable */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Datos completos</h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-auto max-h-[480px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-100">
                        {result.columns.map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          {result.columns.map((col) => (
                            <td
                              key={col}
                              className={`px-4 py-2.5 tabular-nums whitespace-nowrap text-sm ${
                                row[col] === -999
                                  ? "text-gray-300 italic"
                                  : col === "ALLSKY_SFC_SW_DWN"
                                  ? "text-amber-500 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {row[col] === -999 ? "No disponible" : row[col] != null ? String(row[col]) : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Unidad: kW·h/m²
              </p>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={accent ? "text-xs text-amber-500 font-medium" : "text-xs text-gray-700"}>
        {value}
      </span>
    </div>
  );
}