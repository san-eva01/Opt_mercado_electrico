"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useOnboarding } from "./Onboarding";
import { AYUDA_VISTAS } from "./contenido";
import s from "./onboarding.module.css";

// Abre/cierra un popover y lo cierra al hacer clic fuera o con Escape.
function usePopover() {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return { abierto, setAbierto, raiz };
}

// "?" del encabezado: explica la vista actual y permite repetir el recorrido.
export function BotonAyudaVista({ vista, onIrAVistaNormal }: { vista: string; onIrAVistaNormal: () => void }) {
  const { abierto, setAbierto, raiz } = usePopover();
  const { iniciarRecorrido } = useOnboarding();
  const id = useId();
  const ayuda = AYUDA_VISTAS[vista] ?? AYUDA_VISTAS.normal;

  return (
    <span ref={raiz} className="relative inline-flex" data-tour="ayuda">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        aria-label="Ayuda sobre esta vista"
        className={`h-7 w-7 rounded-full border text-xs font-semibold transition-colors ${abierto
          ? "border-amber-400 bg-amber-400 text-white"
          : "border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-500"
          }`}
      >
        ?
      </button>
      {abierto && (
        <div id={id} role="dialog" aria-label={ayuda.titulo}
          className={`absolute right-0 top-full z-[1500] mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-lg ${s.popIn}`}>
          <p className="text-xs font-semibold text-gray-900">{ayuda.titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{ayuda.texto}</p>
          <button
            type="button"
            onClick={() => { setAbierto(false); onIrAVistaNormal(); iniciarRecorrido(); }}
            className="mt-3 text-xs font-medium text-amber-600 hover:underline"
          >
            Repetir recorrido guiado →
          </button>
        </div>
      )}
    </span>
  );
}

// "?" pequeño junto al título de una sección.
export function InfoTip({ titulo, texto }: { titulo: string; texto: string }) {
  const { abierto, setAbierto, raiz } = usePopover();
  const id = useId();

  return (
    <span ref={raiz} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={`Qué es: ${titulo}`}
        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none transition-colors ${abierto
          ? "border-amber-400 bg-amber-400 text-white"
          : "border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-500"
          }`}
      >
        ?
      </button>
      {abierto && (
        <span id={id} role="tooltip"
          className={`absolute left-0 top-full z-[1500] mt-2 block w-64 rounded-xl border border-gray-100 bg-white p-3 text-xs font-normal leading-relaxed text-gray-500 shadow-lg ${s.popIn}`}>
          {texto}
        </span>
      )}
    </span>
  );
}
