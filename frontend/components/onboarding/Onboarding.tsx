"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Opening, { type Eleccion } from "./Opening";
import Walkthrough from "./Walkthrough";
import { PASOS_RECORRIDO } from "./contenido";
import s from "./onboarding.module.css";

// Sin cuentas de usuario: el recorrido completado se recuerda en este navegador.
const CLAVE_ONBOARDING = "solarpower:onboarding";
const DURACION_SALIDA = 850;

const leerCompletado = () => {
  try {
    return window.localStorage.getItem(CLAVE_ONBOARDING) === "completado";
  } catch {
    return false;
  }
};

const guardarCompletado = () => {
  try {
    window.localStorage.setItem(CLAVE_ONBOARDING, "completado");
  } catch {
    // Almacenamiento bloqueado (modo privado, etc.): el recorrido simplemente no se recuerda.
  }
};

const sinSuscripcion = () => () => {};

const OnboardingContext = createContext<{ iniciarRecorrido: () => void }>({ iniciarRecorrido: () => {} });

export const useOnboarding = () => useContext(OnboardingContext);

type Fase = "opening" | "modal" | "programa";

// Envuelve el programa existente: Opening → elección → (modal + recorrido) → programa.
export default function Onboarding({ children }: { children: React.ReactNode }) {
  const [fase, setFase] = useState<Fase>("opening");
  const [saliendo, setSaliendo] = useState(false);
  const [recorrido, setRecorrido] = useState<number | null>(null);
  const esRegreso = useSyncExternalStore(sinSuscripcion, leerCompletado, () => false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const iniciarRecorrido = useCallback(() => {
    // Deja que la vista se pinte antes de buscar sus elementos.
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRecorrido(Date.now()), 80);
  }, []);

  const elegir = (eleccion: Eleccion) => {
    setSaliendo(true);
    window.scrollTo(0, 0);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => {
      setFase(eleccion === "nuevo" ? "modal" : "programa");
      setSaliendo(false);
    }, reducido ? 0 : DURACION_SALIDA);
  };

  const terminarRecorrido = useCallback((completo: boolean) => {
    setRecorrido(null);
    if (completo) guardarCompletado();
  }, []);

  const contexto = useMemo(() => ({ iniciarRecorrido }), [iniciarRecorrido]);

  return (
    <OnboardingContext.Provider value={contexto}>
      {/* Mientras el opening o el modal cubren la pantalla, el programa se recorta al viewport:
          así su ancho actual en móvil no ensancha la página bajo las capas fijas. */}
      <div className={fase === "programa" ? "flex flex-1 flex-col" : "flex h-dvh flex-col overflow-hidden"} inert={fase !== "programa"}>
        {children}
      </div>

      {fase === "opening" && <Opening saliendo={saliendo} esRegreso={esRegreso} onElegir={elegir} />}

      {fase === "modal" && (
        <IntroModal
          onComenzar={() => { setFase("programa"); iniciarRecorrido(); }}
          onOmitir={() => setFase("programa")}
        />
      )}

      {recorrido !== null && <Walkthrough key={recorrido} pasos={PASOS_RECORRIDO} onTerminar={terminarRecorrido} />}
    </OnboardingContext.Provider>
  );
}

const PUNTOS = [
  { titulo: "Consulta", texto: "Irradiancia solar horaria de NASA POWER para cualquier punto de México." },
  { titulo: "Mercado", texto: "Precios marginales locales de los nodos del Mercado de Día en Adelanto." },
  { titulo: "Calcula", texto: "Generación, ingresos, costo de instalación, inclinación y separación de paneles." },
  { titulo: "Decide", texto: "La factibilidad indica si la inversión se recupera y en cuántos años, con reporte PDF." },
];

function IntroModal({ onComenzar, onOmitir }: { onComenzar: () => void; onOmitir: () => void }) {
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    boton.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOmitir(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOmitir]);

  return (
    <div
      className={`fixed inset-0 z-[2600] flex items-end justify-center bg-gray-900/45 p-3 sm:items-center sm:p-6 ${s.backdropIn}`}
      style={{ fontFamily: "var(--font-geist-sans), 'Segoe UI', sans-serif" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-titulo"
        className={`max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl sm:p-8 ${s.dialogIn}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs text-white" aria-hidden="true">☀</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Solar POWER</span>
        </div>
        <h2 id="intro-titulo" className="mt-4 text-2xl font-semibold tracking-tight">Evalúa tu proyecto solar</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Una plataforma para estimar si un sistema fotovoltaico conectado al mercado eléctrico es rentable en una ubicación específica.
        </p>

        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {PUNTOS.map((p) => (
            <div key={p.titulo} className="border-l-2 border-amber-400 pl-3">
              <dt className="text-sm font-semibold">{p.titulo}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-gray-500">{p.texto}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onOmitir} className="py-2 text-sm text-gray-500 hover:text-gray-800">
            Explorar por mi cuenta
          </button>
          <button
            ref={boton}
            type="button"
            onClick={onComenzar}
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            Comenzar recorrido →
          </button>
        </div>
      </div>
    </div>
  );
}
