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


  type Vista = "normal" | "graficas" | "comparar-nodos" | "comparar-irradiancia";
  const [vista, setVista] = useState<Vista>("normal");




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

  const fetchNodos = async (estadoVal: string, municipioVal: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("CLAVE, NOMBRE")
      .eq("ESTADO", estadoVal)
      .eq("MUNICIPIO", municipioVal)

    if (error) return;
    setNodos(data as { CLAVE: string; NOMBRE: string }[]);
  }


  const fetchPrecios = async () => {
    if (!nodo || !startPrecios || !endPrecios) return;

    setLoadingPrecios(true);
    setErrorPrecios(null);
    setPrecios([]);

    const { data, error } = await supabase
      .from(mercado)                          // "MDA" o "MTR" según el botón
      .select("FECHA, HORA, PRECIO_MARGINAL_LOCAL")
      .eq("CLAVE_NODO", nodo)
      .gte("FECHA", startPrecios)             // mayor o igual a fecha inicio
      .lte("FECHA", endPrecios)              // menor o igual a fecha fin
      .order("FECHA", { ascending: true })
      .order("HORA", { ascending: true });

  console.log("mercado:", mercado);
  console.log("data:", data);
  console.log("error:", error);

    if (error) {
      setErrorPrecios("Error al consultar precios.");
      setLoadingPrecios(false);
      return;
    }

    setPrecios(
      (data ?? []).map((r) => ({
        fecha: r.FECHA as string,
        hora: r.HORA as number,
        precio: r.PRECIO_MARGINAL_LOCAL as number,
      }))
    );
    setLoadingPrecios(false);
  };

  const fetchPrecios2 = async () => {
    if (!nodo2 || !startPrecios2 || !endPrecios2) return;

    setLoadingPrecios2(true);
    setErrorPrecios2(null);
    setPrecios2([]);

    const { data, error } = await supabase
      .from(mercado2)
      .select("FECHA, HORA, PRECIO_MARGINAL_LOCAL")
      .eq("CLAVE_NODO", nodo2)
      .gte("FECHA", startPrecios2)
      .lte("FECHA", endPrecios2)
      .order("FECHA", { ascending: true })
      .order("HORA", { ascending: true });

    if (error) {
      setErrorPrecios2("Error al consultar precios.");
      setLoadingPrecios2(false);
      return;
    }

    setPrecios2(
      (data ?? []).map((r) => ({
        fecha: r.FECHA as string,
        hora: r.HORA as number,
        precio: r.PRECIO_MARGINAL_LOCAL as number,
      }))
    );
    setLoadingPrecios2(false);
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
  //para precios
  const [estados, setEstados] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [nodos, setNodos] = useState<{ CLAVE: string; NOMBRE: string }[]>([]);
  const [nodo, setNodo] = useState("");

  const [mercado, setMercado] = useState<"MDA" | "MTR">("MDA"); // botón seleccionado
  const [startPrecios, setStartPrecios] = useState("");          // fecha inicio precios
  const [endPrecios, setEndPrecios] = useState("");              // fecha fin precios
  const [precios, setPrecios] = useState<{ hora: number; precio: number; fecha: string }[]>([]);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [errorPrecios, setErrorPrecios] = useState<string | null>(null);

  const [nodo2, setNodo2] = useState("");
  const [mercado2, setMercado2] = useState<"MDA" | "MTR">("MDA");
  const [startPrecios2, setStartPrecios2] = useState("");
  const [endPrecios2, setEndPrecios2] = useState("");
  const [precios2, setPrecios2] = useState<{ fecha: string; hora: number; precio: number }[]>([]);
  const [loadingPrecios2, setLoadingPrecios2] = useState(false);
  const [errorPrecios2, setErrorPrecios2] = useState<string | null>(null);


  useEffect(() => {
    fetchEstados();
  }, []);

  //coordinar listas de precios con las de irradiancia
  useEffect(() => {
    if (start) setStartPrecios(start);
  }, [start]);

  useEffect(() => {
    if (end) setEndPrecios(end);
  }, [end]);

  useEffect(() => {
    if (start) setStartPrecios2(start);
  }, [start]);

  useEffect(() => {
    if (end) setEndPrecios2(end);
  }, [end]);

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
    setNodo("");
    setNodos([]);
    if (value && estado) {
      await geocode(value + ", " + estado + ", México", 11);
      await fetchNodos(estado, value);
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

  const preciosChartData = precios.map((r) => ({
    label: `${r.fecha} ${String(r.hora).padStart(2, "0")}:00`,
    precio: r.precio,
  }));

  const preciosChartData2 = precios2.map((r) => ({
    label: `${r.fecha} ${String(r.hora).padStart(2, "0")}:00`,
    precio: r.precio,
  }));


  return (

    <main className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">

        {/* Logo izquierda */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">☀</div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Solar POWER</h1>
            <p className="text-xs text-gray-400">Irradiancia Solar · NASA POWER · México</p>
          </div>
        </div>

        {/* Botones derecha */}
        <div className="flex items-center gap-2">
          <NavBtn label="Vista normal" value="normal" vista={vista} setVista={setVista} />

          <NavBtn label="Ver solo gráficas" value="graficas" vista={vista} setVista={setVista} />
          <NavBtn label="Comparar nodos" value="comparar-nodos" vista={vista} setVista={setVista} />
          <NavBtn label="Comparar irradiancia" value="comparar-irradiancia" vista={vista} setVista={setVista} />
          {/*<a
            href="/factibilidad"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500 transition-colors"
          >
            Análisis de factibilidad
          </a>*/}
        </div>


      </header>

      {/* AQUI ESTA EL CAMBIO DE COLUMNAS AAAAAAAAAAAA */}
      {/*<div className="max-w-5xl mx-auto px-6 py-8 space-y-8">*/}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Vista normal */}
        {vista === "normal" && (
          <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto px-6 py-8">


            {/* COLUMNA DE irradiancia */}
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


            {/* COLUMNA DE PRECIOS AQUI LA BORRAS SI NO CHARCHA — Precios */}
            <div className="space-y-6">
              {/*titulo*/}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-400">03</span>
                <span className="text-sm font-medium text-gray-700">Selección de nodo</span>
              </div>

              {!municipio ? (
                <p className="text-xs text-gray-400">
                  Selecciona un estado y municipio para ver los nodos disponibles.
                </p>
              ) : nodos.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No hay nodos registrados para este municipio.
                </p>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Nodo</label>
                  <select
                    value={nodo}
                    onChange={(e) => setNodo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Selecciona un nodo</option>
                    {nodos.map((n) => (
                      <option key={n.CLAVE} value={n.CLAVE}>
                        {n.CLAVE} — {n.NOMBRE}
                      </option>
                    ))}
                  </select>
                </div>
              )}


              {/*aqui agrega el resultado de la busqueda del nodo, con opcion de cambiar la fecha, con boton de busqueda, y grafica a la misma
          altura que las de irradiancia*/}
              {/* Botones MDA / MTR */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Mercado</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMercado("MDA")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mercado === "MDA"
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                      }`}
                  >
                    MDA
                  </button>
                  <button
                    onClick={() => setMercado("MTR")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mercado === "MTR"
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                      }`}
                  >
                    MTR
                  </button>
                </div>
              </div>

              {/* Fechas de precios */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Período de precios</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">Inicio</span>
                    <input
                      type="date"
                      value={startPrecios}
                      onChange={(e) => setStartPrecios(e.target.value)}
                      max={endPrecios || undefined}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">Fin</span>
                    <input
                      type="date"
                      value={endPrecios}
                      onChange={(e) => setEndPrecios(e.target.value)}
                      min={startPrecios || undefined}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Botón consultar precios */}
              <button
                onClick={fetchPrecios}
                disabled={loadingPrecios || !nodo || !startPrecios || !endPrecios}
                className="w-full py-3 rounded-xl font-medium text-sm bg-amber-400 text-white hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPrecios ? "Consultando precios..." : `Consultar ${mercado} →`}
              </button>

              {errorPrecios && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                  {errorPrecios}
                </div>
              )}

              {/* Gráfica de precios */}
              {precios.length > 0 && (
                <div className="space-y-6">

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      Precio Marginal Local — {mercado} ($/MWh)
                    </p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={preciosChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e5e7eb" }}
                            interval={Math.floor(preciosChartData.length / 8)}
                            tickFormatter={(v) => v?.toString().slice(5, 10) || ""}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                            width={50}
                          />
                          <Tooltip
                            contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                            formatter={(v) => v != null ? [`$${Number(v).toFixed(2)}/MWh`, "Precio"] : ["—", "Precio"]}
                            labelFormatter={(l) => `${l}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="precio"
                            stroke="#3b82f6"
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 4, fill: "#3b82f6" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tabla de precios */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Datos completos</p>
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="overflow-auto max-h-[500px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#f3f4f6]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Fecha</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Hora</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Precio ($/MWh)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {precios.map((row, i) => (
                              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2.5 text-gray-600 tabular-nums">{row.fecha}</td>
                                <td className="px-4 py-2.5 text-gray-600 tabular-nums">{String(row.hora).padStart(2, "0")}:00</td>
                                <td className="px-4 py-2.5 text-blue-500 font-medium tabular-nums">${row.precio.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {precios.length.toLocaleString()} registros · {mercado} · Nodo {nodo}
                    </p>
                  </div>

                </div>
              )}


            </div>

          </div>
        )}

        {/* Ver solo gráficas */}
        {vista === "graficas" && (
          <div className="grid grid-cols-2 gap-8">
            {/* Gráfica irradiancia */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                Irradiancia solar horaria — ALLSKY_SFC_SW_DWN (kW·h/m²)
              </p>
              {result ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} interval={Math.floor(chartData.length / 8)} tickFormatter={(v) => v?.toString().slice(5, 10) || ""} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} formatter={(v) => v == null ? ["No disponible", "Irradiancia"] : [`${v} kW·h/m²`, "Irradiancia"]} />
                      <Line type="monotone" dataKey="irradiancia" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sin datos de irradiancia aún.</p>
              )}
            </div>

            {/* Gráfica precios */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                Precio Marginal Local — {mercado} ($/MWh)
              </p>
              {precios.length > 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={preciosChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} interval={Math.floor(preciosChartData.length / 8)} tickFormatter={(v) => v?.toString().slice(5, 10) || ""} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={50} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} formatter={(v) => v != null ? [`$${Number(v).toFixed(2)}/MWh`, "Precio"] : ["—", "Precio"]} />
                      <Line type="monotone" dataKey="precio" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sin datos de precios aún.</p>
              )}
            </div>
          </div>
        )}

        {/* Comparar nodos — columna derecha dos veces */}
        {vista === "comparar-nodos" && (
          <div className="space-y-6">

            {/* Estado y municipio compartidos — arriba centrado */}
            <div className="max-w-xl mx-auto space-y-3">
              <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-widest">
                Ubicación compartida
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400"
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-300"
                  >
                    <option value="">Selecciona un municipio</option>
                    {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="h-px bg-gray-100" />

            {/* Dos columnas de nodos */}
            <div className="grid grid-cols-2 gap-8">

              {/* ── Nodo 1 ── */}
              <ColNodo
                numero="Nodo 1"
                nodos={nodos}
                municipio={municipio}
                nodo={nodo}
                setNodo={setNodo}
                mercado={mercado}
                setMercado={setMercado}
                startPrecios={startPrecios}
                setStartPrecios={setStartPrecios}
                endPrecios={endPrecios}
                setEndPrecios={setEndPrecios}
                fetchPrecios={fetchPrecios}
                loadingPrecios={loadingPrecios}
                errorPrecios={errorPrecios}
                precios={precios}
                preciosChartData={preciosChartData}
              />

              {/* ── Nodo 2 ── */}
              <ColNodo
                numero="Nodo 2"
                nodos={nodos}
                municipio={municipio}
                nodo={nodo2}
                setNodo={setNodo2}
                mercado={mercado2}
                setMercado={setMercado2}
                startPrecios={startPrecios2}
                setStartPrecios={setStartPrecios2}
                endPrecios={endPrecios2}
                setEndPrecios={setEndPrecios2}
                fetchPrecios={fetchPrecios2}
                loadingPrecios={loadingPrecios2}
                errorPrecios={errorPrecios2}
                precios={precios2}
                preciosChartData={preciosChartData2}
              />

            </div>
          </div>
        )}

        {/* Comparar irradiancia — columna izquierda dos veces */}
        {vista === "comparar-irradiancia" && (
          <div className="grid grid-cols-2 gap-8">
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
        )}

      </div>



    </main >

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

function NavBtn({
  label,
  value,
  vista,
  setVista,
}: {
  label: string;
  value: string;
  vista: string;
  setVista: (v: any) => void;
}) {
  const activo = vista === value;
  return (
    <button
      onClick={() => setVista(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activo
        ? "bg-amber-400 text-white border-amber-400"
        : "border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500"
        }`}
    >
      {label}
    </button>
  );
}

function ColNodo({
  numero, nodos, municipio, nodo, setNodo,
  mercado, setMercado, startPrecios, setStartPrecios,
  endPrecios, setEndPrecios, fetchPrecios, loadingPrecios,
  errorPrecios, precios, preciosChartData,
}: {
  numero: string;
  nodos: { CLAVE: string; NOMBRE: string }[];
  municipio: string;
  nodo: string;
  setNodo: (v: string) => void;
  mercado: "MDA" | "MTR";
  setMercado: (v: "MDA" | "MTR") => void;
  startPrecios: string;
  setStartPrecios: (v: string) => void;
  endPrecios: string;
  setEndPrecios: (v: string) => void;
  fetchPrecios: () => void;
  loadingPrecios: boolean;
  errorPrecios: string | null;
  precios: { fecha: string; hora: number; precio: number }[];
  preciosChartData: { label: string; precio: number }[];
}) {
  return (
    <div className="space-y-4">

      {/* Título */}
      <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">{numero}</p>

      {/* Selector de nodo */}
      {!municipio ? (
        <p className="text-xs text-gray-400">Selecciona un municipio arriba.</p>
      ) : nodos.length === 0 ? (
        <p className="text-xs text-gray-400">No hay nodos para este municipio.</p>
      ) : (
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Nodo</label>
          <select
            value={nodo}
            onChange={(e) => setNodo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="">Selecciona un nodo</option>
            {nodos.map((n) => (
              <option key={n.CLAVE} value={n.CLAVE}>
                {n.CLAVE} — {n.NOMBRE}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botones MDA / MTR */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400">Mercado</label>
        <div className="flex gap-2">
          {(["MDA", "MTR"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMercado(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mercado === m
                  ? "bg-amber-400 text-white border-amber-400"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-xs text-gray-400">Inicio</span>
          <input
            type="date"
            value={startPrecios}
            onChange={(e) => setStartPrecios(e.target.value)}
            max={endPrecios || undefined}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-gray-400">Fin</span>
          <input
            type="date"
            value={endPrecios}
            onChange={(e) => setEndPrecios(e.target.value)}
            min={startPrecios || undefined}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Botón consultar */}
      <button
        onClick={fetchPrecios}
        disabled={loadingPrecios || !nodo || !startPrecios || !endPrecios}
        className="w-full py-3 rounded-xl font-medium text-sm bg-amber-400 text-white hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loadingPrecios ? "Consultando..." : `Consultar ${mercado} →`}
      </button>

      {errorPrecios && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
          {errorPrecios}
        </div>
      )}

      {/* Gráfica */}
      {precios.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">
              Precio Marginal Local — {mercado} ($/MWh)
            </p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={preciosChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} interval={Math.floor(preciosChartData.length / 8)} tickFormatter={(v) => v?.toString().slice(5, 10) || ""} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} formatter={(v) => v != null ? [`$${Number(v).toFixed(2)}/MWh`, "Precio"] : ["—", "Precio"]} />
                  <Line type="monotone" dataKey="precio" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Datos completos</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#f3f4f6]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest">Precio ($/MWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {precios.map((row, i) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600 tabular-nums">{row.fecha}</td>
                        <td className="px-4 py-2.5 text-gray-600 tabular-nums">{String(row.hora).padStart(2, "0")}:00</td>
                        <td className="px-4 py-2.5 text-blue-500 font-medium tabular-nums">${row.precio.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {precios.length.toLocaleString()} registros · {mercado} · Nodo {nodo}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}