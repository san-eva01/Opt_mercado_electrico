
"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { supabase } from "../lib/supabase";
import { MESES, MESES_CORTOS, unirDatosAnuales, agruparMeses, agruparDias, calcularSeparacion } from "../lib/factibilidad";
import type { DatoAnual, DatoMensual, DatoDiario, PrecioHorario } from "../lib/factibilidad";

const DiagramaPaneles = dynamic(() => import("../components/DiagramaPaneles"), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
//declare module "dom-to-image-more";
//import * as domtoimage from "dom-to-image-more";

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




type Vista = "normal" | "graficas" | "comparar-nodos" | "comparar-irradiancia";

export default function Home() {



  const [vista, setVista] = useState<Vista>("normal");
  const [modoUbicacion, setModoUbicacion] = useState<"compartida" | "distinta">("compartida");



  const fetchEstados = async () => {
    const { data, error } = await supabase
      .from("NODO")
      .select("ESTADO")
      .not("ESTADO", "is", null)

    if (error) return;

    const unicos = [...new Set(data.map((r) => r.ESTADO as string))].sort();
    setEstados(unicos);
  };

  const fetchEstados2 = async () => {
    const { data, error } = await supabase
      .from("NODO")
      .select("ESTADO")
      .not("ESTADO", "is", null);
    if (error) return;
    const unicos = [...new Set(data.map((r) => r.ESTADO as string))].sort();
    setEstados2(unicos);
  };

  const fetchEstados3 = async () => {
    const { data, error } = await supabase
      .from("NODO")
      .select("ESTADO")
      .not("ESTADO", "is", null);
    if (error) return;
    const unicos = [...new Set(data.map((r) => r.ESTADO as string))].sort();
    setEstados3(unicos);
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

  const fetchMunicipios2 = async (estadoSeleccionado: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("MUNICIPIO")
      .eq("ESTADO", estadoSeleccionado)
      .not("MUNICIPIO", "is", null)

    if (error) return;

    const unicos = [...new Set(data.map((r) => r.MUNICIPIO as string))].sort();
    setMunicipios2(unicos);
  };

  const fetchMunicipios3 = async (estadoSeleccionado: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("MUNICIPIO")
      .eq("ESTADO", estadoSeleccionado)
      .not("MUNICIPIO", "is", null)

    if (error) return;

    const unicos = [...new Set(data.map((r) => r.MUNICIPIO as string))].sort();
    setMunicipios3(unicos);
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

  const fetchNodos2 = async (estadoVal: string, municipioVal: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("CLAVE, NOMBRE")
      .eq("ESTADO", estadoVal)
      .eq("MUNICIPIO", municipioVal)

    if (error) return;
    setNodos2(data as { CLAVE: string; NOMBRE: string }[]);
  }

  const fetchNodos3 = async (estadoVal: string, municipioVal: string) => {
    const { data, error } = await supabase
      .from("NODO")
      .select("CLAVE, NOMBRE")
      .eq("ESTADO", estadoVal)
      .eq("MUNICIPIO", municipioVal)

    if (error) return;
    setNodos3(data as { CLAVE: string; NOMBRE: string }[]);
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

  const fetchPrecios3 = async () => {
    if (!nodo3 || !startPrecios3 || !endPrecios3) return;

    setLoadingPrecios3(true);
    setErrorPrecios3(null);
    setPrecios3([]);

    const { data, error } = await supabase
      .from(mercado3)
      .select("FECHA, HORA, PRECIO_MARGINAL_LOCAL")
      .eq("CLAVE_NODO", nodo3)
      .gte("FECHA", startPrecios3)
      .lte("FECHA", endPrecios3)
      .order("FECHA", { ascending: true })
      .order("HORA", { ascending: true });

    if (error) {
      setErrorPrecios3("Error al consultar precios.");
      setLoadingPrecios3(false);
      return;
    }

    setPrecios3(
      (data ?? []).map((r) => ({
        fecha: r.FECHA as string,
        hora: r.HORA as number,
        precio: r.PRECIO_MARGINAL_LOCAL as number,
      }))
    );
    setLoadingPrecios3(false);
  };

  //obtener tipo de cambio de usd en internet
  const fetchTipoCambio = async () => {
    setLoadingTipoCambio(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setTipoCambio(data.rates.MXN);
    } catch {
      setTipoCambio(null);
    } finally {
      setLoadingTipoCambio(false);
    }
  };

  // irradiancia
  //columna normal
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCenter>({ lat: 23.5, lon: -102.5, zoom: 5 });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Estado y municipio
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  // Dirección
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [coloniaCP, setColoniaCP] = useState("");
  // peticiones a mapa para direccion
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);


  //columna comparativa de irradiancia 1
  const [lat2, setLat2] = useState<number | null>(null);
  const [lon2, setLon2] = useState<number | null>(null);
  const [mapCenter2, setMapCenter2] = useState<MapCenter>({ lat: 23.5, lon: -102.5, zoom: 5 });
  const [start2, setStart2] = useState("");
  const [end2, setEnd2] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [result2, setResult2] = useState<SolarResponse | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [estado2, setEstado2] = useState("");
  const [municipio2, setMunicipio2] = useState("");
  const [calle2, setCalle2] = useState("");
  const [numero2, setNumero2] = useState("");
  const [coloniaCP2, setColoniaCP2] = useState("");
  const [geocoding2, setGeocoding2] = useState(false);
  const [geoError2, setGeoError2] = useState<string | null>(null);




  //columna comparativa de irradiancia 2
  const [lat3, setLat3] = useState<number | null>(null);
  const [lon3, setLon3] = useState<number | null>(null);
  const [mapCenter3, setMapCenter3] = useState<MapCenter>({ lat: 23.5, lon: -102.5, zoom: 5 });
  const [start3, setStart3] = useState("");
  const [end3, setEnd3] = useState("");
  const [loading3, setLoading3] = useState(false);
  const [result3, setResult3] = useState<SolarResponse | null>(null);
  const [error3, setError3] = useState<string | null>(null);
  const [estado3, setEstado3] = useState("");
  const [municipio3, setMunicipio3] = useState("");
  const [calle3, setCalle3] = useState("");
  const [numero3, setNumero3] = useState("");
  const [coloniaCP3, setColoniaCP3] = useState("");
  const [geocoding3, setGeocoding3] = useState(false);
  const [geoError3, setGeoError3] = useState<string | null>(null);




  const [estados2, setEstados2] = useState<string[]>([]);
  const [estados3, setEstados3] = useState<string[]>([]);

  //para precios
  const [estados, setEstados] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [municipios2, setMunicipios2] = useState<string[]>([]);
  const [municipios3, setMunicipios3] = useState<string[]>([]);
  const [nodos, setNodos] = useState<{ CLAVE: string; NOMBRE: string }[]>([]);
  const [nodos2, setNodos2] = useState<{ CLAVE: string; NOMBRE: string }[]>([]);
  const [nodos3, setNodos3] = useState<{ CLAVE: string; NOMBRE: string }[]>([]);
  const [nodo, setNodo] = useState("");
  const [compartidoNodos, setCompartidoNodos] = useState(true); // true = compartido, false = independiente

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

  const [nodo3, setNodo3] = useState("");
  const [mercado3, setMercado3] = useState<"MDA" | "MTR">("MDA");
  const [startPrecios3, setStartPrecios3] = useState("");
  const [endPrecios3, setEndPrecios3] = useState("");
  const [precios3, setPrecios3] = useState<{ fecha: string; hora: number; precio: number }[]>([]);
  const [loadingPrecios3, setLoadingPrecios3] = useState(false);
  const [errorPrecios3, setErrorPrecios3] = useState<string | null>(null);


  //estados del sistema fotovoltaico
  const [capacidad, setCapacidad] = useState<number | "">("");
  const [eficiencia, setEficiencia] = useState<number | "">(0.8); // Eficiencia como factor: 0.8 equivale a 80%.
  const [tipoCambio, setTipoCambio] = useState<number | null>(null);
  const [loadingTipoCambio, setLoadingTipoCambio] = useState(false);
  const [alturaPanel, setAlturaPanel] = useState<number>(1.0);
  const [mesSeleccionadoGeneracion, setMesSeleccionadoGeneracion] = useState<number | null>(null);
  const [mesSeleccionadoIngreso, setMesSeleccionadoIngreso] = useState<number | null>(null);
  const [consultaAnual, setConsultaAnual] = useState<{ clave: string; solar: SolarResponse; precios: PrecioHorario[] } | null>(null);
  const [loadingAnual, setLoadingAnual] = useState(false);
  const [errorAnual, setErrorAnual] = useState<string | null>(null);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [errorPDF, setErrorPDF] = useState<string | null>(null);
  const solicitudAnual = useRef(0);
  // UTC evita que el 1 de enero se interprete como el año anterior en México.
  const targetYear = new Date(start).getUTCFullYear();
  const inicioAnual = Number.isFinite(targetYear) ? `${targetYear}-01-01` : "";
  const finAnual = Number.isFinite(targetYear) ? `${targetYear}-12-31` : "";
  const claveAnual = JSON.stringify([lat, lon, targetYear, nodo]);
  const anualVigente = consultaAnual?.clave === claveAnual;

  const fetchFactibilidadAnual = async () => {
    if (lat === null || lon === null || !inicioAnual || !nodo) return;
    const solicitud = ++solicitudAnual.current;
    setLoadingAnual(true);
    setErrorAnual(null);
    setConsultaAnual(null);
    try {
      const fetchSolarAnual = async (): Promise<SolarResponse> => {
        const res = await fetch(`${API_URL}/api/solar-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon, start: inicioAnual.replace(/-/g, ""), end: finAnual.replace(/-/g, "") }),
        });
        if (!res.ok) throw new Error("No se pudo consultar la irradiancia del año completo.");
        return res.json();
      };
      const fetchMdaAnual = async (): Promise<PrecioHorario[]> => {
        const registros: PrecioHorario[] = [];
        const pageSize = 1000;
        // Paginar hasta una página vacía: incluso un límite del servidor menor a 1000 no trunca el año.
        for (let offset = 0; ; ) {
          const { data, error } = await supabase.from("MDA")
            .select("FECHA, HORA, PRECIO_MARGINAL_LOCAL")
            .eq("CLAVE_NODO", nodo).gte("FECHA", inicioAnual).lte("FECHA", finAnual)
            .order("FECHA", { ascending: true }).order("HORA", { ascending: true })
            .order("PRECIO_MARGINAL_LOCAL", { ascending: true })
            .range(offset, offset + pageSize - 1);
          if (error) throw new Error("No se pudieron consultar los precios MDA del año completo.");
          if (!data?.length) break;
          registros.push(...data.map((r) => ({ fecha: String(r.FECHA), hora: Number(r.HORA), precio: r.PRECIO_MARGINAL_LOCAL == null ? NaN : Number(r.PRECIO_MARGINAL_LOCAL) })));
          offset += data.length;
        }
        return registros;
      };
      const [solar, preciosAnuales] = await Promise.all([fetchSolarAnual(), fetchMdaAnual()]);
      // Validar conflictos de precio antes de publicar los datos en React.
      unirDatosAnuales(solar.preview, preciosAnuales, targetYear, 1, 1);
      if (solicitud === solicitudAnual.current) setConsultaAnual({ clave: claveAnual, solar, precios: preciosAnuales });
    } catch (err: unknown) {
      if (solicitud === solicitudAnual.current) setErrorAnual(err instanceof Error ? err.message : "Error consultando el año completo.");
    } finally {
      if (solicitud === solicitudAnual.current) setLoadingAnual(false);
    }
  };



  useEffect(() => {
    fetchEstados();      // para columna 1
    fetchEstados2();     // para columna 2
    fetchEstados3();     // para columna 3
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

  useEffect(() => {
    fetchTipoCambio();
  }, []);


  const toNasaDate = (d: string) => d.replace(/-/g, "");

  // llamada a nominatim vista normal de irradiancia
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

  //llamada a nominatim vista comparativa irradiancia 1
  const geocode2 = async (query: string, zoom: number) => {
    setGeocoding2(true);
    setGeoError2(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=mx&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data.length === 0) { setGeoError2("No se encontró la ubicación."); return; }
      const newLat = parseFloat(parseFloat(data[0].lat).toFixed(4));
      const newLon = parseFloat(parseFloat(data[0].lon).toFixed(4));
      setLat2(newLat);
      setLon2(newLon);
      setMapCenter2({ lat: newLat, lon: newLon, zoom });
    } catch {
      setGeoError2("Error al geocodificar.");
    } finally {
      setGeocoding2(false);
    }
  };

  //llamada a nominatim vista comparativa irradiancia 2
  const geocode3 = async (query: string, zoom: number) => {
    setGeocoding3(true);
    setGeoError3(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=mx&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data.length === 0) { setGeoError3("No se encontró la ubicación."); return; }
      const newLat = parseFloat(parseFloat(data[0].lat).toFixed(4));
      const newLon = parseFloat(parseFloat(data[0].lon).toFixed(4));
      setLat3(newLat);
      setLon3(newLon);
      setMapCenter3({ lat: newLat, lon: newLon, zoom });
    } catch {
      setGeoError3("Error al geocodificar.");
    } finally {
      setGeocoding3(false);
    }
  };



  const datosFactibilidadAnual = useMemo<DatoAnual[]>(() => {
    if (!anualVigente || !consultaAnual || capacidad === "" || eficiencia === "" ||
      !Number.isFinite(capacidad) || capacidad < 0 || !Number.isFinite(eficiencia) || eficiencia < 0 || eficiencia > 1) return [];
    return unirDatosAnuales(consultaAnual.solar.preview, consultaAnual.precios, targetYear, capacidad, eficiencia);
  }, [anualVigente, consultaAnual, capacidad, eficiencia, targetYear]);

  const datosGeneracionMensual = useMemo<DatoMensual[]>(() => agruparMeses(datosFactibilidadAnual), [datosFactibilidadAnual]);
  const ingresoTotalAnual = useMemo<number>(() => datosGeneracionMensual.reduce((sum, row) => sum + row.ingreso, 0), [datosGeneracionMensual]);
  const generacionTotalAnual = useMemo<number>(() => datosGeneracionMensual.reduce((sum, row) => sum + row.generacion, 0), [datosGeneracionMensual]);
  const datosGeneracionDiaria = useMemo<DatoDiario[]>(() => agruparDias(datosFactibilidadAnual, mesSeleccionadoGeneracion, targetYear), [datosFactibilidadAnual, mesSeleccionadoGeneracion, targetYear]);
  const datosIngresoDiario = useMemo<DatoDiario[]>(() => agruparDias(datosFactibilidadAnual, mesSeleccionadoIngreso, targetYear), [datosFactibilidadAnual, mesSeleccionadoIngreso, targetYear]);
  const horasEsperadas = (Date.UTC(targetYear + 1, 0, 1) - Date.UTC(targetYear, 0, 1)) / 3600000;
  const coberturaCompleta = datosFactibilidadAnual.length === horasEsperadas;

  const calculos = useMemo<{ costoInstalacion: string; ingresoAnual: string; anosRetorno: string; tipoCambio: string } | null>(() => {
    if (!coberturaCompleta || capacidad === "" || eficiencia === "" || !tipoCambio || !Number.isFinite(tipoCambio) || tipoCambio <= 0) return null;
    const costoInstalacion = (capacidad * 1000) * eficiencia * tipoCambio;
    const anosRetorno = ingresoTotalAnual > 0 ? costoInstalacion / ingresoTotalAnual : null;
    return { costoInstalacion: costoInstalacion.toFixed(2), ingresoAnual: ingresoTotalAnual.toFixed(2), anosRetorno: anosRetorno === null ? "Sin retorno" : anosRetorno.toFixed(anosRetorno > 0 && anosRetorno < 0.1 ? 4 : 1), tipoCambio: tipoCambio.toFixed(2) };
  }, [coberturaCompleta, capacidad, eficiencia, tipoCambio, ingresoTotalAnual]);

  const { orientation, tiltAnual, tiltVerano, tiltInvierno, tiltPromedio } = useMemo(() => {
    const tiltAnual = Math.abs(lat ?? 0);
    const tiltVerano = tiltAnual - 15;
    const tiltInvierno = tiltAnual + 15;
    return { orientation: (lat ?? 0) >= 0 ? "Sur" : "Norte", tiltAnual, tiltVerano, tiltInvierno, tiltPromedio: (tiltVerano + tiltInvierno) / 2 };
  }, [lat]);
  const { H, d } = useMemo<{ H: number; d: number }>(() => {
    if (lat === null) return { H: 0, d: 0 };
    return calcularSeparacion(lat, alturaPanel, tiltAnual);
  }, [lat, alturaPanel, tiltAnual]);
  const separacionValida = lat !== null && H > 0 && Number.isFinite(d) && d > 0 && alturaPanel >= 0.1;

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

  const handleEstado2Change = async (value: string) => {
    setEstado2(value);
    setMunicipio2("");
    setMunicipios2([]);
    if (!compartidoNodos) {
      setNodos2([]);
    }
    if (value) {
      await fetchMunicipios2(value);
      await geocode2(value + ", México", 7);
    }
  };

  const handleMunicipio2Change = async (value: string) => {
    setMunicipio2(value);
    if (value && estado2) {
      await geocode2(value + ", " + estado2 + ", México", 11);
      if (!compartidoNodos) {
        await fetchNodos2(estado2, value);
      }
    }
  };

  const handleEstado3Change = async (value: string) => {
    setEstado3(value);
    setMunicipio3("");
    setMunicipios3([]);
    if (!compartidoNodos) {
      setNodos3([]);
    }
    if (value) {
      await fetchMunicipios3(value);
      await geocode3(value + ", México", 7);
    }
  };

  const handleMunicipio3Change = async (value: string) => {
    setMunicipio3(value);
    if (value && estado3) {
      await geocode3(value + ", " + estado3 + ", México", 11);
      if (!compartidoNodos) {
        await fetchNodos3(estado3, value);
      }
    }
  };

  //funcion de busqueda por direccion vista normal
  const handleAddressSearch = async () => {
    if (!calle) return;
    const parts = [calle, numero, coloniaCP, municipio, estado, "México"].filter(Boolean);
    await geocode(parts.join(", "), 15);
  };

  //funcion de busqueda por direccion vista comparativa irradiancia 1
  const handleAddressSearch2 = async () => {
    if (!calle2) return;
    const parts = [calle2, numero2, coloniaCP2, municipio2, estado2, "México"].filter(Boolean);
    await geocode2(parts.join(", "), 15);
  };

  //funcion de busqueda por direccion vista comparativa irradiancia 2
  const handleAddressSearch3 = async () => {
    if (!calle3) return;
    const parts = [calle3, numero3, coloniaCP3, municipio3, estado3, "México"].filter(Boolean);
    await geocode3(parts.join(", "), 15);
  };





  //posición del mapa vista normal
  const handleMapClick = useCallback((newLat: number, newLon: number) => {
    setLat(parseFloat(newLat.toFixed(4)));
    setLon(parseFloat(newLon.toFixed(4)));
    setResult(null);
    setError(null);
  }, []);

  //posición del mapa irradiancia comparativa 1
  const handleMapClick2 = useCallback((newLat: number, newLon: number) => {
    setLat2(parseFloat(newLat.toFixed(4)));
    setLon2(parseFloat(newLon.toFixed(4)));
    setResult2(null);
    setError2(null);
  }, []);

  //posición del mapa irradiancia comparativa 2
  //posición del mapa irradiancia comparativa 1
  const handleMapClick3 = useCallback((newLat: number, newLon: number) => {
    setLat3(parseFloat(newLat.toFixed(4)));
    setLon3(parseFloat(newLon.toFixed(4)));
    setResult3(null);
    setError3(null);
  }, []);



  // ── Consulta NASA POWER ───────────────────────────────────────────────────
  //consulta vista normal
  const handleSubmit = async () => {
    if (lat === null || lon === null) return setError("Selecciona un punto en el mapa o ingresa una ubicación.");
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

  //consulta vista comparativa irradiancia 1
  const handleSubmit2 = async () => {
    if (!lat2 || !lon2) return setError2("Selecciona un punto en el mapa o ingresa una ubicación.");
    if (!start2 || !end2) return setError2("Selecciona el rango de fechas.");
    if (start2 > end2) return setError2("La fecha inicio debe ser anterior a la fecha fin.");

    setLoading2(true);
    setError2(null);
    setResult2(null);

    try {
      const res = await fetch(`${API_URL}/api/solar-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: lat2, lon: lon2, start: toNasaDate(start2), end: toNasaDate(end2) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Error del servidor.");
      }
      setResult2(await res.json());
    } catch (err: unknown) {
      setError2(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading2(false);
    }
  };

  //consulta vista comparativa irradiancia 2
  const handleSubmit3 = async () => {
    if (!lat3 || !lon3) return setError3("Selecciona un punto en el mapa o ingresa una ubicación.");
    if (!start3 || !end3) return setError3("Selecciona el rango de fechas.");
    if (start3 > end3) return setError3("La fecha inicio debe ser anterior a la fecha fin.");

    setLoading3(true);
    setError3(null);
    setResult3(null);

    try {
      const res = await fetch(`${API_URL}/api/solar-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: lat3, lon: lon3, start: toNasaDate(start3), end: toNasaDate(end3) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Error del servidor.");
      }
      setResult3(await res.json());
    } catch (err: unknown) {
      setError3(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading3(false);
    }
  };

  //tabla de datos para gráfica de irradiancia vista normal
  const chartData = result?.preview.map((row) => ({
    hora: row["datetime"] as string,
    irradiancia: row["ALLSKY_SFC_SW_DWN"] === -999 ? null : (row["ALLSKY_SFC_SW_DWN"] as number),
  })) ?? [];

  //tabla de datos para gráfica de irradiancia comparativa 1
  const chartData2 = result2?.preview.map((row) => ({
    hora: row["datetime"] as string,
    irradiancia: row["ALLSKY_SFC_SW_DWN"] === -999 ? null : (row["ALLSKY_SFC_SW_DWN"] as number),
  })) ?? [];

  //tabla de datos para gráfica de irradiancia comparativa 2
  const chartData3 = result3?.preview.map((row) => ({
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

  const preciosChartData3 = precios3.map((r) => ({
    label: `${r.fecha} ${String(r.hora).padStart(2, "0")}:00`,
    precio: r.precio,
  }));

  const generarPDF = async () => {
    if (!calculos || !coberturaCompleta || !separacionValida || exportandoPDF) return;
    setExportandoPDF(true);
    setErrorPDF(null);
    try {
      const domtoimage = await import("dom-to-image-more");
      const { default: jsPDF } = await import("jspdf");
      // Capturar antes de generar el documento: un error no entrega un reporte incompleto.
      const imagenes = await Promise.all(["diagrama-paneles", "grafica-generacion", "grafica-ingreso"].map(async (id) => {
        const el = document.getElementById(id);
        if (!el) throw new Error("No se encontró " + id + ". Espera a que termine de cargar e intenta de nuevo.");
        // Esta versión de dom-to-image-more impone un namespace HTML al nodo raíz.
        // Capturar el contenedor conserva el namespace del SVG interior.
        const captureEl = el instanceof SVGElement ? el.parentElement : el;
        if (!captureEl) throw new Error("No se encontró el contenedor de " + id);
        const bounds = captureEl.getBoundingClientRect();
        if (!bounds.width || !bounds.height) throw new Error("La imagen " + id + " no es visible.");
        const png = await domtoimage.default.toPng(captureEl, {
          scale: 2, bgcolor: "#ffffff",
          onclone: (clone) => {
            // El foco y los tooltips siguen disponibles en pantalla, pero no forman parte del reporte.
            clone.querySelectorAll<HTMLElement | SVGElement>(".recharts-wrapper, .recharts-surface").forEach((node) => { node.style.outline = "none"; });
            clone.querySelectorAll<HTMLElement>(".recharts-tooltip-wrapper").forEach((node) => { node.style.display = "none"; });
          },
        });
        return { png, ratio: bounds.height / bounds.width };
      }));
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 15;
      const contentWidth = 180;
      let y = 36;
      const espacio = (height: number) => {
        if (y + height > 270) { doc.addPage(); y = 15; }
      };
      const titulo = (text: string) => {
        espacio(20);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(17, 24, 39);
        doc.text(text, margin, y); y += 7;
      };
      const tabla = (headers: string[], rows: string[][], widths: number[]) => {
        const fila = (cells: string[], header: boolean, index: number) => {
          doc.setFontSize(9);
          doc.setFont("helvetica", header ? "bold" : "normal");
          const lines = cells.map((cell, i) => doc.splitTextToSize(cell, widths[i] - 6) as string[]);
          const height = Math.max(8, ...lines.map((line) => line.length * 4 + 4));
          if (y + height > 270) {
            doc.addPage(); y = 15;
            if (!header) fila(headers, true, 0);
          }
          if (header) doc.setFillColor(245, 158, 11);
          else if (index % 2 === 0) doc.setFillColor(249, 250, 251);
          else doc.setFillColor(255, 255, 255);
          doc.rect(margin, y, contentWidth, height, "F");
          doc.setTextColor(header ? 255 : 17, header ? 255 : 24, header ? 255 : 39);
          doc.setFont("helvetica", header ? "bold" : "normal");
          let x = margin;
          lines.forEach((line, i) => { doc.text(line, x + 3, y + 5); x += widths[i]; });
          y += height;
        };
        fila(headers, true, 0);
        rows.forEach((row, i) => fila(row, false, i));
        y += 9;
      };
      const imagen = (title: string, img: { png: string; ratio: number }) => {
        const height = Math.min(contentWidth * img.ratio, 220);
        const width = height / img.ratio;
        espacio(height + 17); titulo(title);
        doc.addImage(img.png, "PNG", margin + (contentWidth - width) / 2, y, width, height);
        y += height + 10;
      };
      doc.setFillColor(245, 158, 11); doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("Reporte de Factibilidad Fotovoltaica", margin, 12);
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text("Solar POWER · NASA POWER · CENACE", margin, 19);
      doc.text(new Date().toLocaleDateString("es-MX"), 195, 19, { align: "right" });

      titulo("Parámetros del sistema");
      tabla(["Campo", "Valor"], [
        ["Nodo / Mercado", nodo + " / MDA"],
        ["Ubicación (latitud, longitud)", lat?.toFixed(4) + "°, " + lon?.toFixed(4) + "°"],
        ["Período analizado", inicioAnual + " al " + finAnual],
        ["Capacidad instalada", capacidad + " kW"], ["Eficiencia", (eficiencia === "" ? "" : Number((eficiencia * 100).toFixed(8))) + " %"],
        ["Tipo de cambio", calculos.tipoCambio + " MXN/USD"], ["Altura del panel", alturaPanel + " m"],
      ], [90, 90]);
      titulo("Inclinación y orientación de paneles");
      tabla(["Campo", "Valor"], [
        ["Orientación recomendada", orientation], ["Inclinación anual óptima", tiltAnual.toFixed(1) + "°"],
        ["Inclinación en verano", tiltVerano.toFixed(1) + "°"], ["Inclinación en invierno", tiltInvierno.toFixed(1) + "°"],
        ["Inclinación media anual", tiltPromedio.toFixed(1) + "°"],
      ], [90, 90]);
      titulo("Distancia mínima entre hileras");
      tabla(["Campo", "Valor"], [
        ["Ángulo de altura solar (gamma s)", H.toFixed(2) + "°"], ["Altura del panel (b)", alturaPanel + " m"],
        ["Distancia mínima entre hileras", d.toFixed(2) + " m"],
      ], [90, 90]);
      espacio(14); doc.setFontSize(9); doc.setTextColor(75, 85, 99);
      doc.text("Calculado para el 21 de diciembre a las 10h solar, condición más desfavorable.", margin, y); y += 12;
      imagen("Diagrama de inclinación y separación", imagenes[0]);
      imagen("Generación mensual (kWh)", imagenes[1]);
      imagen("Ingreso mensual (MXN)", imagenes[2]);
      titulo("Desglose mensual de generación e ingresos");
      tabla(["Mes", "Generación (kWh)", "Ingreso ($MXN)"], [
        ...datosGeneracionMensual.map((row) => [row.mes, row.generacion.toFixed(2), row.ingreso.toFixed(2)]),
        ["Total anual", generacionTotalAnual.toFixed(2), ingresoTotalAnual.toFixed(2)],
      ], [60, 60, 60]);
      titulo("Resultados financieros");
      tabla(["Campo", "Valor"], [
        ["Costo de instalación (MXN)", calculos.costoInstalacion],
        ["Ingreso anual estimado (MXN)", calculos.ingresoAnual],
        ["Años de retorno de inversión", calculos.anosRetorno],
      ], [100, 80]);
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); doc.setFillColor(245, 158, 11); doc.rect(0, 287, 210, 10, "F");
        doc.setFont("helvetica", "normal"); doc.setTextColor(255, 255, 255); doc.setFontSize(8);
        doc.text("Solar POWER · Reporte de Factibilidad Fotovoltaica", margin, 293);
        doc.text("Página " + i + " de " + totalPages, 195, 293, { align: "right" });
      }
      doc.save("reporte_factibilidad_" + nodo + "_" + targetYear + ".pdf");
    } catch (err: unknown) {
      setErrorPDF(err instanceof Error ? err.message : "No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setExportandoPDF(false);
    }
  };





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
          <div className="w-full space-y-8">
            <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto px-6 py-8">


              {/* COLUMNA DE irradiancia */}
              <div className="space-y-6">

                {/* ── Sección de ubicación ── */}
                <div className="space-y-4">
                  <SectionLabel number="1" label="Ubicación" />

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

                  {/* ── Sección de período ── */}
                  <div className="space-y-3">
                    <SectionLabel number="2" label="Período de tiempo" />
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
                                      {row[col] === -999 || row[col] === -0.999 ? "No disponible" : row[col] != null ? String(row[col]) : "—"}
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
                  <span className="text-xs font-medium text-amber-400">3</span>
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
                    {/*<button
                      onClick={() => setMercado("MTR")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mercado === "MTR"
                        ? "bg-amber-400 text-white border-amber-400"
                        : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                        }`}
                    >
                      MTR
                    </button>*/}
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

            {/* ── 04 Características del sistema ── */}
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <SectionLabel number="4" label="Características del sistema fotovoltaico" />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Capacidad instalada (kW)</label>
                  <input
                    type="number"
                    min={0}
                    value={capacidad}
                    onChange={(e) => setCapacidad(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="Ej. 100"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Eficiencia (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={eficiencia === "" ? "" : Number((eficiencia * 100).toFixed(8))}
                    onChange={(e) => setEficiencia(e.target.value === "" ? "" : parseFloat(e.target.value) / 100)}
                    placeholder="Ej. 80"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Tipo de cambio (MXN/USD)</label>
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 flex items-center justify-between">
                    <span>{loadingTipoCambio ? "Consultando..." : tipoCambio ? `$${tipoCambio.toFixed(2)}` : "No disponible"}</span>
                    <button onClick={fetchTipoCambio} className="text-xs text-amber-500 hover:underline">
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>

              <section className="border-t border-gray-100 pt-8 space-y-6">
                <SectionLabel number="5" label="Generación e ingresos mensuales" />
                <p className="text-sm text-gray-500">El análisis usa irradiancia y precios MDA del 1 de enero al 31 de diciembre del año de inicio, independientemente del rango de las consultas anteriores.</p>
                <button onClick={fetchFactibilidadAnual} disabled={loadingAnual || lat === null || lon === null || !inicioAnual || !nodo}
                  className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-40">
                  {loadingAnual ? "Consultando el año completo..." : "Consultar año completo"}{inicioAnual && !loadingAnual ? " · " + targetYear : ""}
                </button>
                {errorAnual && <p role="alert" className="text-sm text-red-600">{errorAnual}</p>}
                {consultaAnual && !anualVigente && <p role="status" className="text-sm text-amber-700">Cambió la ubicación, el nodo o el año. Consulta de nuevo el año completo.</p>}
                {anualVigente && !coberturaCompleta && <p role="status" className="text-sm text-amber-700">Cobertura: {datosFactibilidadAnual.length} de {horasEsperadas} horas válidas. Completa los parámetros del sistema; si faltan registros, no se calcula ROI anual ni se extrapolan ingresos.</p>}
                {datosFactibilidadAnual.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500">{inicioAnual} al {finAnual} · MDA · {coberturaCompleta ? "Cobertura anual completa" : "Datos parciales"}</p>
                    {([
                      { key: "generacion", title: "Generación", unit: "kWh", color: "#f59e0b", mes: mesSeleccionadoGeneracion, setMes: setMesSeleccionadoGeneracion, diario: datosGeneracionDiaria },
                      { key: "ingreso", title: "Ingreso", unit: "MXN", color: "#3b82f6", mes: mesSeleccionadoIngreso, setMes: setMesSeleccionadoIngreso, diario: datosIngresoDiario },
                    ] as const).map((grafica) => (
                      <div key={grafica.key} className="space-y-3">
                        <label className="flex flex-wrap items-center gap-3 text-sm text-gray-600" htmlFor={"mes-" + grafica.key}>
                          {grafica.title}: detalle por mes
                          <select id={"mes-" + grafica.key} value={grafica.mes ?? ""} onChange={(e) => grafica.setMes(e.target.value === "" ? null : Number(e.target.value))}
                            className="rounded-lg border border-gray-200 bg-white p-2">
                            <option value="">Sin detalle diario</option>
                            {MESES.map((mes, i) => <option key={mes} value={i}>{mes}</option>)}
                          </select>
                        </label>
                        <div id={"grafica-" + grafica.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <h3 className="mb-3 text-sm text-gray-600">{grafica.title} mensual ({grafica.unit}) · {targetYear}</h3>
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={datosGeneracionMensual} margin={{ top: 8, right: 16, left: 12, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mesIndex" tickFormatter={(v: number) => MESES_CORTOS[v]} tick={{ fontSize: 11 }} interval={0} />
                              <YAxis width={75} tick={{ fontSize: 10 }} label={{ value: grafica.unit, angle: -90, position: "insideLeft" }} />
                              <Tooltip labelFormatter={(v) => MESES[Number(v)]} formatter={(v) => [Number(v).toFixed(2) + " " + grafica.unit, grafica.title]} />
                              <Bar dataKey={grafica.key} fill={grafica.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {grafica.mes !== null && (
                          <div className="rounded-xl border border-gray-100 p-4">
                            <h3 className="mb-3 text-sm text-gray-600">{grafica.key === "ingreso" ? "Ingreso diario" : "Generación diaria"} · {MESES[grafica.mes]} ({grafica.unit})</h3>
                            <ResponsiveContainer width="100%" height={240}>
                              <LineChart data={grafica.diario} margin={{ top: 8, right: 16, left: 12, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" label={{ value: "Día", position: "insideBottom", offset: -10 }} />
                                <YAxis width={75} tick={{ fontSize: 10 }} label={{ value: grafica.unit, angle: -90, position: "insideLeft" }} />
                                <Tooltip labelFormatter={(v) => "Día " + v} formatter={(v) => [Number(v).toFixed(2) + " " + grafica.unit, grafica.title]} />
                                <Line type="monotone" dataKey={grafica.key} stroke={grafica.color} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    ))}
                    {calculos && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs text-gray-500">Costo de instalación (MXN)</p><p className="text-lg font-semibold">$ {calculos.costoInstalacion}</p></div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs text-gray-500">Ingreso anual estimado (MXN)</p><p className="text-lg font-semibold">$ {calculos.ingresoAnual}</p><p className="text-xs text-gray-500">Suma de los 12 meses</p></div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs text-amber-700">Retorno de inversión (años)</p><p className="text-lg font-semibold text-amber-700">{calculos.anosRetorno}</p></div>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="border-t border-gray-100 pt-8 space-y-4">
                <SectionLabel number="6" label="Inclinación y orientación de los paneles" />
                {lat === null ? <p className="text-sm text-gray-500">Selecciona una ubicación en el paso 1.</p> : (
                  <>
                    <dl className="grid sm:grid-cols-2 gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
                      {[["Inclinación anual óptima", tiltAnual.toFixed(1) + "°"], ["Inclinación en verano", tiltVerano.toFixed(1) + "°"], ["Inclinación en invierno", tiltInvierno.toFixed(1) + "°"], ["Inclinación media anual", tiltPromedio.toFixed(1) + "°"], ["Orientación", orientation]].map(([label, value]) => <div key={label}><dt className="text-gray-500">{label}</dt><dd className="font-semibold text-gray-900">{value}</dd></div>)}
                    </dl>
                    <p className="text-sm text-gray-500">La inclinación anual se aproxima al valor absoluto de la latitud. El ajuste estacional resta 15° en verano y suma 15° en invierno. Los paneles se orientan hacia el ecuador: al sur en el hemisferio norte y al norte en el hemisferio sur. Estas recomendaciones geométricas no modifican el cálculo de generación.</p>
                  </>
                )}
              </section>

              <section className="border-t border-gray-100 pt-8 space-y-4">
                <SectionLabel number="7" label="Distancia mínima entre hileras de paneles" />
                <label htmlFor="altura-panel" className="block text-sm text-gray-600">Altura del panel (m)</label>
                <input id="altura-panel" type="number" min={0.1} step={0.1} value={alturaPanel} onChange={(e) => {
                  const value = e.target.valueAsNumber;
                  if (Number.isFinite(value)) setAlturaPanel(value);
                }} className="w-40 rounded-lg border border-gray-200 px-3 py-2" />
                {separacionValida ? (
                  <>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm space-y-2">
                      <p>Ángulo de altura solar (γs): <strong>{H.toFixed(2)}°</strong></p>
                      <p>Distancia mínima entre hileras (d): <strong>{d.toFixed(2)} m</strong></p>
                      <p className="text-gray-500">Calculado para el 21 de diciembre a las 10h solar, condición más desfavorable</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-100"><DiagramaPaneles beta={tiltAnual} gammaSolar={H} d={d} b={alturaPanel} /></div>
                  </>
                ) : <p role="status" className="text-sm text-amber-700">Selecciona una ubicación y una altura de al menos 0.1 m. La separación requiere una altura solar positiva.</p>}
              </section>

              <section className="border-t border-gray-100 pt-8 space-y-4">
                <SectionLabel number="8" label="¿Por qué considerar pérdidas del sistema?" />
                <p className="text-sm text-gray-500">La energía aprovechable se reduce por pérdidas del sistema. La eficiencia representa el factor global de rendimiento; los siguientes valores típicos ilustran las pérdidas que pueden afectar la producción.</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f59e0b] text-white"><tr><th className="p-3">Factor de pérdida</th><th className="p-3">Impacto típico</th></tr></thead>
                    <tbody>{[
                      ["Temperatura", "Reducción de potencia del 3–10% según clima y temperatura del módulo"],
                      ["Polvo y suciedad", "Pérdida de energía del 2–5% según entorno y mantenimiento"],
                      ["Pérdidas del inversor", "Pérdidas de conversión del 1–3% según eficiencia del inversor"],
                      ["Pérdidas en el cable", "1–2%: pérdida de transmisión según diseño del sistema"],
                    ].map(([factor, impacto]) => <tr key={factor} className="odd:bg-gray-50 even:bg-gray-100"><th scope="row" className="p-3 font-medium">{factor}</th><td className="p-3">{impacto}</td></tr>)}</tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500">El 80% es el valor inicial editable y se utiliza como factor 0.8 en los cálculos. Ajusta la eficiencia según el equipo, el clima, el mantenimiento y las condiciones reales de instalación.</p>
              </section>
              {errorPDF && <p role="alert" className="text-sm text-red-600">{errorPDF}</p>}
              {calculos && <button onClick={generarPDF} disabled={exportandoPDF || !separacionValida} className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 disabled:opacity-40">{exportandoPDF ? "Generando reporte..." : "Generar reporte PDF →"}</button>}
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

            {/* Botones de toggle */}
            <div className="max-w-xl mx-auto flex gap-3 mb-6">
              <button
                onClick={() => setCompartidoNodos(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${compartidoNodos
                  ? "bg-amber-400 text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Ubicación compartida
              </button>
              <button
                onClick={() => setCompartidoNodos(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${!compartidoNodos
                  ? "bg-amber-400 text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Ubicación independiente
              </button>
            </div>

            {/* Ubicación compartida — arriba centrado */}
            {compartidoNodos && (
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
            )}

            {/* Ubicación independiente — dos columnas */}
            {!compartidoNodos && (
              <div className="grid grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Columna 1</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Estado</label>
                      <select
                        value={estado2}
                        onChange={(e) => handleEstado2Change(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">Selecciona un estado</option>
                        {estados2.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Municipio</label>
                      <select
                        value={municipio2}
                        onChange={(e) => handleMunicipio2Change(e.target.value)}
                        disabled={!estado2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-300"
                      >
                        <option value="">Selecciona un municipio</option>
                        {municipios2.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                {/* Columna 2 */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Columna 2</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Estado</label>
                      <select
                        value={estado3}
                        onChange={(e) => handleEstado3Change(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">Selecciona un estado</option>
                        {estados3.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Municipio</label>
                      <select
                        value={municipio3}
                        onChange={(e) => handleMunicipio3Change(e.target.value)}
                        disabled={!estado3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-300"
                      >
                        <option value="">Selecciona un municipio</option>
                        {municipios3.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divisor */}
            <div className="h-px bg-gray-100" />

            {/* Dos columnas de nodos */}
            <div className="grid grid-cols-2 gap-8">

              {/* ── Nodo 1 ── */}
              <ColNodo
                numero="Nodo 1"
                nodos={compartidoNodos ? nodos : nodos2}
                municipio={compartidoNodos ? municipio : municipio2}
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

              {/* ── Nodo 2 ── */}
              <ColNodo
                numero="Nodo 2"
                nodos={compartidoNodos ? nodos : nodos3}
                municipio={compartidoNodos ? municipio : municipio3}
                nodo={nodo3}
                setNodo={setNodo3}
                mercado={mercado3}
                setMercado={setMercado3}
                startPrecios={startPrecios3}
                setStartPrecios={setStartPrecios3}
                endPrecios={endPrecios3}
                setEndPrecios={setEndPrecios3}
                fetchPrecios={fetchPrecios3}
                loadingPrecios={loadingPrecios3}
                errorPrecios={errorPrecios3}
                precios={precios3}
                preciosChartData={preciosChartData3}
              />

            </div>
          </div>
        )}

        {/* Comparar irradiancia — columna izquierda dos veces */}
        {vista === "comparar-irradiancia" && (
          <div className="grid grid-cols-2 gap-8">

            <ColIrradiancia
              estados={estados2} municipios={municipios2}   // ← ambos con 2
              estado={estado2} municipio={municipio2}
              onEstadoChange={handleEstado2Change}
              onMunicipioChange={handleMunicipio2Change}
              calle={calle2} numero={numero2} coloniaCP={coloniaCP2}
              onCalleChange={setCalle2} onNumeroChange={setNumero2} onColoniaCPChange={setColoniaCP2}
              onAddressSearch={handleAddressSearch2}
              geocoding={geocoding2} geoError={geoError2}
              lat={lat2} lon={lon2} mapCenter={mapCenter2}
              onMapClick={handleMapClick2}
              start={start2} end={end2}
              onStartChange={setStart2} onEndChange={setEnd2}
              loading={loading2} error={error2} onSubmit={handleSubmit2}
              result={result2} chartData={chartData2}
            />

            <ColIrradiancia
              estados={estados3} municipios={municipios3}   // ← ambos con 3
              estado={estado3} municipio={municipio3}
              onEstadoChange={handleEstado3Change}
              onMunicipioChange={handleMunicipio3Change}
              calle={calle3} numero={numero3} coloniaCP={coloniaCP3}
              onCalleChange={setCalle3} onNumeroChange={setNumero3} onColoniaCPChange={setColoniaCP3}
              onAddressSearch={handleAddressSearch3}
              geocoding={geocoding3} geoError={geoError3}
              lat={lat3} lon={lon3} mapCenter={mapCenter3}
              onMapClick={handleMapClick3}
              start={start3} end={end3}
              onStartChange={setStart3} onEndChange={setEnd3}
              loading={loading3} error={error3} onSubmit={handleSubmit3}
              result={result3} chartData={chartData3}
            />

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
  value: Vista;
  vista: Vista;
  setVista: (v: Vista) => void;
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


function ColIrradiancia({
  // ubicación
  estados, municipios, estado, municipio,
  onEstadoChange, onMunicipioChange,
  // dirección
  calle, numero, coloniaCP,
  onCalleChange, onNumeroChange, onColoniaCPChange,
  onAddressSearch, geocoding, geoError,
  // mapa
  lat, lon, mapCenter, onMapClick,
  // fechas
  start, end, onStartChange, onEndChange,
  // consulta
  loading, error, onSubmit, result, chartData,
}: {
  estados: string[];
  municipios: string[];
  estado: string;
  municipio: string;
  onEstadoChange: (v: string) => void;
  onMunicipioChange: (v: string) => void;
  calle: string;
  numero: string;
  coloniaCP: string;
  onCalleChange: (v: string) => void;
  onNumeroChange: (v: string) => void;
  onColoniaCPChange: (v: string) => void;
  onAddressSearch: () => void;
  geocoding: boolean;
  geoError: string | null;
  lat: number | null;
  lon: number | null;
  mapCenter: { lat: number; lon: number; zoom: number };
  onMapClick: (lat: number, lon: number) => void;
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  result: SolarResponse | null;
  chartData: { hora: string; irradiancia: number | null }[];
}) {
  return (
    <div className="space-y-6">

      {/* ── Sección de ubicación ── */}
      <div className="space-y-4">
        <SectionLabel number="1" label="Ubicación" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Estado</label>
            <select value={estado} onChange={(e) => onEstadoChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors">
              <option value="">Selecciona un estado</option>
              {estados.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Municipio</label>
            <select value={municipio} onChange={(e) => onMunicipioChange(e.target.value)} disabled={!estado}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50 disabled:text-gray-300">
              <option value="">Selecciona un municipio</option>
              {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-gray-400">Calle</label>
            <input type="text" value={calle} onChange={(e) => onCalleChange(e.target.value)} placeholder="Nombre de la calle"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Número</label>
            <input type="text" value={numero} onChange={(e) => onNumeroChange(e.target.value)} placeholder="Ej. 123"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-gray-400">Colonia o Código Postal</label>
            <input type="text" value={coloniaCP} onChange={(e) => onColoniaCPChange(e.target.value)} placeholder="Colonia o C.P."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <button onClick={onAddressSearch} disabled={geocoding || !calle}
            className="py-2.5 px-4 rounded-lg text-sm font-medium border border-amber-400 text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {geocoding ? "Buscando..." : "Buscar dirección"}
          </button>
        </div>

        {geoError && <p className="text-xs text-red-500">{geoError}</p>}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">o selecciona en el mapa</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="relative rounded-xl border border-gray-200 overflow-hidden h-[380px]">
          <MapSelector onLocationSelect={onMapClick} lat={lat} lon={lon} center={mapCenter} />
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

      {/* ── Período ── */}
      <div className="space-y-3">
        <SectionLabel number="2" label="Período de tiempo" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Fecha inicio</label>
            <input type="date" value={start} onChange={(e) => onStartChange(e.target.value)} max={end || undefined}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Fecha fin</label>
            <input type="date" value={end} onChange={(e) => onEndChange(e.target.value)} min={start || undefined}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-400 transition-colors" />
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

        <button onClick={onSubmit} disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-150 bg-amber-400 text-white hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Consultando NASA POWER..." : "Consultar datos →"}
        </button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">{error}</div>
        )}
      </div>

      {/* Resultados */}
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

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Irradiancia solar horaria — ALLSKY_SFC_SW_DWN (kW·h/m²)</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }}
                    interval={Math.floor(chartData.length / 8)} tickFormatter={(v) => v?.toString().slice(5, 10) || ""} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v) => v == null ? ["No disponible", "Irradiancia"] : [`${v} kW·h/m²`, "Irradiancia"]}
                    labelFormatter={(l) => `${l}`} />
                  <Line type="monotone" dataKey="irradiancia" stroke="#f59e0b" strokeWidth={1.5} dot={false}
                    activeDot={{ r: 4, fill: "#f59e0b" }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Datos completos</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#f3f4f6]">
                    <tr>
                      {result.columns.map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        {result.columns.map((col) => (
                          <td key={col} className={`px-4 py-2.5 tabular-nums whitespace-nowrap ${row[col] === -999 ? "text-gray-300 italic" :
                            col === "ALLSKY_SFC_SW_DWN" ? "text-amber-500 font-medium" : "text-gray-600"
                            }`}>
                            {row[col] === -999 || row[col] === -0.999 ? "No disponible" : row[col] != null ? String(row[col]) : "—"}
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
  );
}


