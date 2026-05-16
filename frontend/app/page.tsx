"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  const [eficiencia, setEficiencia] = useState<number | "">("");
  const [tipoCambio, setTipoCambio] = useState<number | null>(null);
  const [loadingTipoCambio, setLoadingTipoCambio] = useState(false);
  const [semanaActiva, setSemanaActiva] = useState(0); // índice de semana visible



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



  // Calcula cuántas semanas hay entre start y end
  const semanas = useMemo(() => {
    if (!start || !end || !result || !precios.length) return [];

    const fechaInicio = new Date(start);
    const fechaFin = new Date(end);
    const totalDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalSemanas = Math.ceil(totalDias / 7);

    return Array.from({ length: totalSemanas }, (_, i) => {
      const inicioSemana = new Date(fechaInicio);
      inicioSemana.setDate(inicioSemana.getDate() + i * 7);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);
      return {
        inicio: inicioSemana.toISOString().slice(0, 10),
        fin: finSemana > fechaFin ? fechaFin.toISOString().slice(0, 10) : finSemana.toISOString().slice(0, 10),
      };
    });
  }, [start, end, result, precios]);

  //Calcular datos de generación e ingreso por semana activa
  const datosFactibilidad = useMemo(() => {
    if (!semanas.length || !result || !precios.length || capacidad === "" || eficiencia === "") return [];

    const semana = semanas[semanaActiva];

    // Filtrar irradiancia de la semana activa
    const irradianciaFiltrada = result.preview.filter((row) => {
      const fecha = (row["datetime"] as string).slice(0, 10);
      return fecha >= semana.inicio && fecha <= semana.fin;
    });

    // Filtrar precios de la semana activa
    const preciosFiltrados = precios.filter((p) => p.fecha >= semana.inicio && p.fecha <= semana.fin);

    // Agrupar por hora del día (0-23) y promediar
    const porHora = Array.from({ length: 24 }, (_, hora) => {
      const irradianciaHora = irradianciaFiltrada
        .filter((r) => {
          const h = parseInt((r["datetime"] as string).slice(11, 13));
          return h === hora;
        })
        .map((r) => r["ALLSKY_SFC_SW_DWN"] as number)
        .filter((v) => v !== -999);

      const preciosHora = preciosFiltrados
        .filter((p) => p.hora === hora)
        .map((p) => p.precio);

      const irradianciaPromedio = irradianciaHora.length
        ? irradianciaHora.reduce((a, b) => a + b, 0) / irradianciaHora.length
        : 0;

      const precioPromedio = preciosHora.length
        ? preciosHora.reduce((a, b) => a + b, 0) / preciosHora.length
        : 0;

      // Generación (kWh) = Irradiancia × Capacidad × (Eficiencia / 100)
      const generacion = irradianciaPromedio * (capacidad as number) * ((eficiencia as number) / 100);

      // Ingreso ($) = Generación (kWh) × Precio ($/MWh) * 1000
      const ingreso = generacion * precioPromedio * 1000;

      return {
        hora: `${String(hora).padStart(2, "0")}:00`,
        generacion: parseFloat(generacion.toFixed(4)),
        ingreso: parseFloat(ingreso.toFixed(4)),
        irradiancia: parseFloat(irradianciaPromedio.toFixed(4)),
        precio: parseFloat(precioPromedio.toFixed(4)),
      };
    });

    return porHora;
  }, [semanas, semanaActiva, result, precios, capacidad, eficiencia]);


  //calcular inversion y retorno
  const calculos = useMemo(() => {
    if (capacidad === "" || !tipoCambio || !start || !end) return null;

    // Inversión total
    const inversionUSD = (capacidad as number) * 0.8;
    const inversionMXN = inversionUSD * tipoCambio;

    // Ingreso total del período seleccionado
    const ingresoTotal = datosFactibilidad.reduce((acc, row) => acc + row.ingreso, 0) * semanas.length;

    // Días del período
    const fechaInicio = new Date(start);
    const fechaFin = new Date(end);
    const diasPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Extrapolar ingreso a un año
    const ingresoAnual = (ingresoTotal / diasPeriodo) * 365;

    // Años de retorno
    const anosRetorno = ingresoAnual > 0 ? inversionMXN / ingresoAnual : null;

    return {
      inversionUSD: inversionUSD.toFixed(2),
      inversionMXN: inversionMXN.toFixed(2),
      ingresoAnual: ingresoAnual.toFixed(2),
      anosRetorno: anosRetorno ? anosRetorno.toFixed(1) : "—",
      tipoCambio: tipoCambio.toFixed(2),
    };
  }, [capacidad, tipoCambio, start, end, datosFactibilidad, semanas]);

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

  const generarPDF = useCallback(async () => {
    if (!calculos || !datosFactibilidad.length) return;

    try {
      const res = await fetch(`${API_URL}/api/reporte-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capacidad,
          eficiencia,
          tipoCambio,
          semana: semanas[semanaActiva],
          datosFactibilidad,
          calculos,
          nodo,
          mercado,
          lat,
          lon,
        }),
      });

      if (!res.ok) throw new Error("Error al generar PDF");

      // Descargar el PDF
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_factibilidad_${nodo}_${semanas[semanaActiva]?.inicio}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error al generar el reporte PDF.");
    }
  }, [capacidad, eficiencia, tipoCambio, semanaActiva, datosFactibilidad, calculos, nodo, mercado, lat, lon, semanas]);

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

            {/* ── 04 Características del sistema ── */}
            <div className="border-t border-gray-100 pt-8 space-y-6">
            <SectionLabel number="04" label="Características del sistema fotovoltaico" />

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
                value={eficiencia}
                onChange={(e) => setEficiencia(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="Ej. 20"
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

          {/* Gráficas de factibilidad — solo si hay datos */}
          {datosFactibilidad.length > 0 && (
            <div className="space-y-8">

              {/* Navegador de semanas */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSemanaActiva((s) => Math.max(0, s - 1))}
                  disabled={semanaActiva === 0}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:border-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Semana anterior
                </button>
                <span className="text-xs text-gray-500">
                  Semana {semanaActiva + 1} de {semanas.length} ·{" "}
                  {semanas[semanaActiva]?.inicio} al {semanas[semanaActiva]?.fin}
                </span>
                <button
                  onClick={() => setSemanaActiva((s) => Math.min(semanas.length - 1, s + 1))}
                  disabled={semanaActiva === semanas.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:border-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Semana siguiente →
                </button>
              </div>

              {/* Gráfica 1 — Generación pronosticada */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">
                  Generación pronosticada (kWh) — promedio horario semanal
                </p>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={datosFactibilidad} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={50} />
                      <Tooltip
                        contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(v) => [`${Number(v).toFixed(4)} kWh`, "Generación"]}
                      />
                      <Line type="monotone" dataKey="generacion" stroke="#f59e0b" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 2 — Ingreso pronosticado */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">
                  Ingreso pronosticado ($MXN) — promedio horario semanal
                </p>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={datosFactibilidad} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(v) => [`$${Number(v).toFixed(4)}`, "Ingreso"]}
                      />
                      <Line type="monotone" dataKey="ingreso" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inversión y retorno */}
              {calculos && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1">
                    <p className="text-xs text-gray-400">Inversión estimada (USD)</p>
                    <p className="text-lg font-semibold text-gray-900">${calculos.inversionUSD}</p>
                    <p className="text-xs text-gray-400">T.C. ${calculos.tipoCambio} MXN/USD</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1">
                    <p className="text-xs text-gray-400">Inversión estimada (MXN)</p>
                    <p className="text-lg font-semibold text-gray-900">${calculos.inversionMXN}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1">
                    <p className="text-xs text-gray-400">Ingreso anual estimado</p>
                    <p className="text-lg font-semibold text-gray-900">${calculos.ingresoAnual}</p>
                    <p className="text-xs text-gray-400">Extrapolado del período</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-amber-50 border-amber-200 p-4 space-y-1">
                    <p className="text-xs text-amber-600">Años de retorno de inversión</p>
                    <p className="text-lg font-semibold text-amber-600">{calculos.anosRetorno} años</p>
                  </div>
                </div>
              )}

              {/* Botón PDF */}
              {calculos && (
                <button
                  onClick={generarPDF}
                  className="w-full py-3 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500 transition-colors"
                >
                  Generar reporte PDF →
                </button>
              )}

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
        <SectionLabel number="01" label="Ubicación" />

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
        <SectionLabel number="02" label="Período de tiempo" />
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
  );
}


