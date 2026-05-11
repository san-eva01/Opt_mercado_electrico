"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "../lib/supabase";

// Leaflet sin SSR
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

interface MapCenter {
  lat: number;
  lon: number;
  zoom: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";




export default function Home() {

  useEffect(() => {
    fetchEstados();
  }, []);

  const [estados, setEstados] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);


  const fetchEstados = async () => {
    const { data, error } = await supabase
      .from("NODO")
      .select("ESTADO")
      .not("ESTADO", "is", null)

    if (error) return;

    const unicos = [...new Set(data.map((r) => r.ESTADO as string))].sort();
    setEstados(unicos);
  };

  const fetchMunicipios = async (estadoSeleccionado: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("MUNICIPIO")
      .eq("ESTADO", estadoSeleccionado)
      .not("MUNICIPIO", "is", null)

    if (error) return;

    const unicos = [...new Set(data.map((r) => r.MUNICIPIO as string))].sort();
    setMunicipios(unicos);




  };




  // Coordenadas seleccionadas
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  // Estado y municipio
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");

  // Dirección
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [coloniaCP, setColoniaCP] = useState("");

  // Control del mapa
  const [mapCenter, setMapCenter] = useState<MapCenter>({ lat: 23.5, lon: -102.5, zoom: 5 });

  // Fechas y resultados
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [result, setResult] = useState<SolarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const toNasaDate = (d: string) => d.replace(/-/g, "");

  // ── Geocodificación con Nominatim (OpenStreetMap, sin API key) ────────────
  const geocode = async (query: string, zoom: number) => {
    setGeocoding(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=mx&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setGeoError("No se encontró la ubicación. Intenta con otra búsqueda.");
        return;
      }
      const { lat: rLat, lon: rLon } = data[0];
      const newLat = parseFloat(parseFloat(rLat).toFixed(4));
      const newLon = parseFloat(parseFloat(rLon).toFixed(4));
      setLat(newLat);
      setLon(newLon);
      setMapCenter({ lat: newLat, lon: newLon, zoom });
    } catch {
      setGeoError("Error al geocodificar. Verifica tu conexión.");
    } finally {
      setGeocoding(false);
    }
  };

  // ── Handlers de ubicación ─────────────────────────────────────────────────
  const handleEstadoChange = async (value: string) => {
    setEstado(value);
    setMunicipio("");
    setMunicipios([]);
    //setGeoError(null);


    if (value) {
      await fetchMunicipios(value);
      await geocode(value + ", México", 7);
    }
  };

  const handleMunicipioChange = async (value: string) => {
    setMunicipio(value);
    // setGeoError(null);
    if (value && estado) {
      await geocode(value + ", " + estado + ", México", 11);
    }
  };

  const handleAddressSearch = async () => {
    if (!calle) return;
    const parts = [calle, numero, coloniaCP, municipio, estado, "México"].filter(Boolean);
    await geocode(parts.join(", "), 15);
  };

  const handleMapClick = useCallback((newLat: number, newLon: number) => {
    setLat(parseFloat(newLat.toFixed(4)));
    setLon(parseFloat(newLon.toFixed(4)));
    setResult(null);
    setError(null);
  }, []);

  // ── Consulta NASA POWER ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!lat || !lon) return setError("Selecciona un punto en el mapa o ingresa una ubicación.");
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

  const chartData = result?.preview.map((row) => ({
    hora: row["datetime"] as string,
    irradiancia: row["ALLSKY_SFC_SW_DWN"] === -999 ? null : (row["ALLSKY_SFC_SW_DWN"] as number),
  })) ?? [];

  //const municipiosList = estado ? (MUNICIPIOS[estado] ?? []) : [];

  return (

    <main className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header className="border-b border-gray-100 px-8 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">☀</div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Solar POWER</h1>
          <p className="text-xs text-gray-400">Irradiancia Solar · NASA POWER · México</p>
        </div>
      </header>

      {/* AQUI ESTA EL CAMBIO DE COLUMNAS WWWWWWWWWWEEEEEEEEEEEEYYYYYYYYYYYYYYYYYYY */}
      {/*<div className="max-w-5xl mx-auto px-6 py-8 space-y-8">*/}
      <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto px-6 py-8">

        <div className="space-y-6">

          {/* ── Sección de ubicación ── */}
          <div className="space-y-4">
            <SectionLabel number="01" label="Ubicación" />

            {/* Estado y Municipio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="">Selecciona un estado</option>
                  {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Municipio</label>
                <select
                  value={municipio}
                  onChange={(e) => handleMunicipioChange(e.target.value)}
                  disabled={!estado}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50 disabled:text-gray-300"
                >
                  <option value="">Selecciona un municipio</option>
                  {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Calle</label>
                <input
                  type="text"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Nombre de la calle"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Número</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej. 123"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Colonia o Código Postal</label>
                <input
                  type="text"
                  value={coloniaCP}
                  onChange={(e) => setColoniaCP(e.target.value)}
                  placeholder="Colonia o C.P."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <button
                onClick={handleAddressSearch}
                disabled={geocoding || !calle}
                className="py-2.5 px-4 rounded-lg text-sm font-medium border border-amber-400 text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {geocoding ? "Buscando..." : "Buscar dirección"}
              </button>
            </div>

            {geoError && (
              <p className="text-xs text-red-500">{geoError}</p>
            )}

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o selecciona en el mapa</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Mapa */}
            <div className="relative rounded-xl border border-gray-200 overflow-hidden h-[380px]">
              <MapSelector
                onLocationSelect={handleMapClick}
                lat={lat}
                lon={lon}
                center={mapCenter}
              />
              {lat && lon && (
                <div className="absolute bottom-3 right-3 z-[1000] bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 shadow-sm pointer-events-none">
                  {lat.toFixed(4)}°N · {lon.toFixed(4)}°W
                </div>
              )}
              {geocoding && (
                <div className="absolute inset-0 z-[999] bg-white/60 flex items-center justify-center">
                  <span className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                    Buscando ubicación...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sección de período ── */}
          <div className="space-y-3">
            <SectionLabel number="02" label="Período de tiempo" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Fecha inicio</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  max={end || undefined}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Fecha fin</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  min={start || undefined}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Resumen y botón */}
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <InfoCell label="Latitud" value={lat ? `${lat}°` : "—"} />
              <InfoCell label="Longitud" value={lon ? `${lon}°` : "—"} />
              <InfoCell label="Inicio" value={start || "—"} />
              <InfoCell label="Fin" value={end || "—"} />
              <InfoCell label="Variable" value="ALLSKY_SFC_SW_DWN" accent />
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

          {/* ── Resultados ── */}
          {result && (
            <div className="space-y-8 border-t border-gray-100 pt-8">

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Resultados</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.total_rows.toLocaleString()} registros · {result.lat}°N, {result.lon}°W
                  </p>
                </div>
                <span className="text-xs border border-green-200 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {result.total_rows.toLocaleString()} registros
                </span>
              </div>

              {/* Gráfica */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Irradiancia solar horaria — ALLSKY_SFC_SW_DWN (kW·h/m²)</p>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="hora"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        interval={Math.floor(chartData.length / 8)}
                        tickFormatter={(v) => v?.toString().slice(5, 10) || ""}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(v) => v == null ? ["No disponible", "Irradiancia"] : [`${v} kW·h/m²`, "Irradiancia"]}
                        labelFormatter={(l) => `${l}`}
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
                <p className="text-xs font-medium text-gray-500">Datos completos</p>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-auto max-h-[500px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#f3f4f6]">
                        <tr>
                          {result.columns.map((col) => (
                            <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.preview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                            {result.columns.map((col) => (
                              <td key={col} className={`px-4 py-2.5 tabular-nums whitespace-nowrap ${row[col] === -999 ? "text-gray-300 italic" :
                                col === "ALLSKY_SFC_SW_DWN" ? "text-amber-500 font-medium" :
                                  "text-gray-600"
                                }`}>
                                {row[col] === -999 ? "No disponible" : row[col] != null ? String(row[col]) : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Unidad: kW·h/m²</p>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DE PRECIOS AQUI LA BORRAS SI NO CHARCHA — Precios */}
      <div className="space-y-6">
        {/* Paso 1: selector de nodo */}
      </div>



    </main>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-amber-400">{number}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

function InfoCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-gray-400">{label}</p>
      <p className={accent ? "text-amber-500 font-medium truncate" : "text-gray-700 font-medium"}>{value}</p>
    </div>
  );
}