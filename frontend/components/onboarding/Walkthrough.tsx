"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PasoRecorrido } from "./contenido";
import s from "./onboarding.module.css";

interface Caja { top: number; left: number; width: number; height: number }

const MARGEN = 8;      // aire alrededor del elemento resaltado
const SEPARACION = 12; // distancia entre resaltado y tarjeta
const ANCHO_TARJETA = 340;
const MOVIL = 640;

const buscar = (id: string) => document.querySelector<HTMLElement>(`[data-tour="${id}"]`);

// Área visible real. En móvil el programa puede ser más ancho que la pantalla,
// así que la tarjeta se ubica respecto al visualViewport y no a window.inner*.
interface Vista { x: number; y: number; w: number; h: number }

const leerVista = (): Vista => {
  const vv = window.visualViewport;
  return vv
    ? { x: vv.offsetLeft, y: vv.offsetTop, w: vv.width, h: vv.height }
    : { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
};

const mismaVista = (a: Vista, b: Vista) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

const mismaCaja = (a: Caja | null, b: Caja) =>
  !!a && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;

// Capa de ayuda sobre el programa: no modifica los elementos, solo los resalta.
export default function Walkthrough({
  pasos,
  onTerminar,
}: {
  pasos: PasoRecorrido[];
  onTerminar: (completo: boolean) => void;
}) {
  // Solo se recorren los elementos que existen en la vista actual.
  const [visibles] = useState(() => pasos.filter((p) => buscar(p.id)));
  const [indice, setIndice] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [altoTarjeta, setAltoTarjeta] = useState(200);
  const [viewport, setViewport] = useState<Vista>({ x: 0, y: 0, w: 0, h: 0 });
  const tarjeta = useRef<HTMLDivElement>(null);

  const paso = visibles[indice];
  const ultimo = indice === visibles.length - 1;

  useEffect(() => {
    if (visibles.length === 0) onTerminar(false);
  }, [visibles.length, onTerminar]);

  // Lleva el elemento a la vista y sigue su posición mientras dure el paso.
  useEffect(() => {
    if (!paso) return;
    const el = buscar(paso.id);
    if (!el) return;

    const vista = leerVista();
    const espacioTarjeta = vista.w < MOVIL ? 240 : 0;
    const alto = el.getBoundingClientRect().height > vista.h - espacioTarjeta - 48;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: alto ? "start" : "center", inline: "nearest" });

    const medir = () => {
      const b = el.getBoundingClientRect();
      const nueva = { top: b.top - MARGEN, left: b.left - MARGEN, width: b.width + MARGEN * 2, height: b.height + MARGEN * 2 };
      setCaja((prev) => (mismaCaja(prev, nueva) ? prev : nueva));
      const vista = leerVista();
      setViewport((prev) => (mismaVista(prev, vista) ? prev : vista));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("scroll", medir, true);
    window.addEventListener("resize", medir);
    window.visualViewport?.addEventListener("resize", medir);
    window.visualViewport?.addEventListener("scroll", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", medir, true);
      window.removeEventListener("resize", medir);
      window.visualViewport?.removeEventListener("resize", medir);
      window.visualViewport?.removeEventListener("scroll", medir);
    };
  }, [paso]);

  useLayoutEffect(() => {
    if (tarjeta.current) setAltoTarjeta(tarjeta.current.offsetHeight);
  }, [indice, viewport.w]);

  useEffect(() => {
    tarjeta.current?.focus({ preventScroll: true });
  }, [indice]);

  const siguiente = useCallback(() => {
    if (ultimo) onTerminar(true);
    else setIndice((i) => i + 1);
  }, [ultimo, onTerminar]);

  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onTerminar(true);
      else if (e.key === "ArrowRight") siguiente();
      else if (e.key === "ArrowLeft") anterior();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [siguiente, anterior, onTerminar]);

  if (!paso) return null;

  const { x, y, w, h } = viewport;
  let estiloTarjeta: React.CSSProperties;
  if (w === 0) {
    estiloTarjeta = { left: 12, right: 12, bottom: 12 };
  } else if (w < MOVIL || !caja) {
    // En pantallas pequeñas la tarjeta queda fija abajo, a todo el ancho visible.
    estiloTarjeta = { left: x + 12, width: w - 24, top: y + h - altoTarjeta - 12 };
  } else {
    const ancho = Math.min(ANCHO_TARJETA, w - 24);
    const abajo = caja.top + caja.height + SEPARACION;
    const arriba = caja.top - SEPARACION - altoTarjeta;
    const top = abajo + altoTarjeta <= y + h - 12 ? abajo : arriba >= y + 12 ? arriba : y + h - altoTarjeta - 16;
    const left = Math.min(Math.max(caja.left, x + 12), x + w - ancho - 12);
    estiloTarjeta = { top, left, width: ancho };
  }

  return (
    <div className="fixed inset-0 z-[2500]" style={{ fontFamily: "var(--font-geist-sans), 'Segoe UI', sans-serif" }}>
      {/* Captura los clics para que el recorrido no active controles por accidente. */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {caja && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-xl ring-2 ring-amber-400 transition-all duration-300 ease-out"
          style={{ ...caja, boxShadow: "0 0 0 9999px rgba(17, 17, 17, 0.55)" }}
        />
      )}

      <div
        ref={tarjeta}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recorrido-titulo"
        aria-describedby="recorrido-texto"
        tabIndex={-1}
        className={`absolute rounded-2xl bg-white p-5 text-gray-900 shadow-xl outline-none transition-[top,left] duration-300 ease-out ${s.dialogIn}`}
        style={estiloTarjeta}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-amber-600">{indice + 1} de {visibles.length}</span>
          <button type="button" onClick={() => onTerminar(true)} className="text-xs text-gray-400 hover:text-gray-700">
            Saltar recorrido
          </button>
        </div>
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-amber-400 transition-[width] duration-300" style={{ width: `${((indice + 1) / visibles.length) * 100}%` }} />
        </div>
        <h2 id="recorrido-titulo" className="mt-4 text-base font-semibold">{paso.titulo}</h2>
        <p id="recorrido-texto" className="mt-1.5 text-sm leading-relaxed text-gray-600">{paso.texto}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          {indice > 0 && (
            <button type="button" onClick={anterior} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-amber-400 hover:text-amber-600">
              Anterior
            </button>
          )}
          <button type="button" onClick={siguiente} className="rounded-lg bg-amber-400 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-500">
            {ultimo ? "Terminar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
