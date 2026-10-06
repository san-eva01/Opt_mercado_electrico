"use client";

import { useEffect, useRef, useState } from "react";
import s from "./onboarding.module.css";

export type Eleccion = "experiencia" | "nuevo";

const PALABRAS = ["ENERGÍA", "INVERSIÓN", "UTILIDAD"];

// Momento (ms desde el montaje) en que entra cada palabra y en que la pantalla se divide.
const TIEMPOS_PALABRA = [300, 1200, 2100];
const TIEMPO_DIVISION = 3000;
const TIEMPO_PANEL = 3750;

const cx = (...clases: (string | false | undefined)[]) => clases.filter(Boolean).join(" ");

export default function Opening({
  saliendo,
  esRegreso,
  onElegir,
}: {
  saliendo: boolean;
  esRegreso: boolean;
  onElegir: (eleccion: Eleccion) => void;
}) {
  // paso: -1 antes de la primera palabra, 0..2 palabra activa.
  const [paso, setPaso] = useState(-1);
  const [dividido, setDividido] = useState(false);
  const [listo, setListo] = useState(false);
  const timers = useRef<number[]>([]);
  const primerBoton = useRef<HTMLButtonElement>(null);

  const limpiar = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const dividir = (retrasoPanel: number) => {
    limpiar();
    setPaso(PALABRAS.length - 1);
    setDividido(true);
    timers.current.push(window.setTimeout(() => setListo(true), retrasoPanel));
  };

  useEffect(() => {
    // Con movimiento reducido se llega directo a la pantalla dividida.
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const programar = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reducido ? 0 : ms));
    TIEMPOS_PALABRA.forEach((ms, i) => programar(() => setPaso(i), ms));
    programar(() => setDividido(true), TIEMPO_DIVISION);
    programar(() => setListo(true), TIEMPO_PANEL);
    return limpiar;
  }, []);

  useEffect(() => {
    if (listo) primerBoton.current?.focus({ preventScroll: true });
  }, [listo]);

  const opciones: { eleccion: Eleccion; label: string; hint: string }[] = [
    { eleccion: "experiencia", label: "Ya tengo experiencia", hint: "Ir directo al programa" },
    { eleccion: "nuevo", label: "Soy un nuevo usuario", hint: "Conoce la plataforma con un recorrido" },
  ];
  // Quien ya terminó el recorrido ve resaltado el acceso directo; quien no, el recorrido.
  const destacada: Eleccion = esRegreso ? "experiencia" : "nuevo";

  return (
    <div
      className={cx(s.opening, dividido && s.isSplit, listo && s.isReady, saliendo && s.isLeaving)}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a Solar POWER"
    >
      <div className={s.orange} aria-hidden="true" />

      <div className={s.stage}>
        <div className={s.sun} aria-hidden="true" />

        <div className={s.brand}>
          <span className={s.brandMark} aria-hidden="true">☀</span>
          Solar POWER
        </div>

        <h1 className={s.words} aria-label={PALABRAS.join(", ")}>
          <span className={s.window} aria-hidden="true">
            <span className={s.reel} style={{ "--step": Math.max(paso, 0) } as React.CSSProperties}>
              {PALABRAS.map((palabra, i) => (
                <span key={palabra} className={cx(s.line, (i <= paso || dividido) && s.lineActive)}>
                  {Array.from(palabra).map((letra, j) => (
                    <span key={j} className={s.char} style={{ "--i": j } as React.CSSProperties}>{letra}</span>
                  ))}
                </span>
              ))}
            </span>
          </span>
        </h1>

        <p className={s.caption}>Factibilidad fotovoltaica · Mercado eléctrico</p>

        <div className={s.progress} aria-hidden="true">
          {PALABRAS.map((palabra, i) => (
            <span key={palabra} className={cx(s.segment, i <= paso && s.segmentOn)} />
          ))}
        </div>

        <button type="button" className={s.skip} onClick={() => dividir(450)} tabIndex={dividido ? -1 : 0}>
          Saltar intro
        </button>
      </div>

      <div className={s.panel} inert={!listo}>
        <div className={s.panelInner}>
          <p className={cx(s.eyebrow, s.reveal)} style={{ "--d": 0 } as React.CSSProperties}>
            {esRegreso ? "Bienvenido de nuevo" : "Bienvenido"}
          </p>
          <h2 className={cx(s.title, s.reveal)} style={{ "--d": 1 } as React.CSSProperties}>Comencemos:</h2>
          <div className={s.choices}>
            {opciones.map((op, i) => (
              <button
                key={op.eleccion}
                ref={i === 0 ? primerBoton : undefined}
                type="button"
                onClick={() => onElegir(op.eleccion)}
                disabled={saliendo}
                className={cx(s.choice, s.reveal, op.eleccion === destacada && s.choicePrimary)}
                style={{ "--d": i + 2 } as React.CSSProperties}
              >
                <span>
                  <span className={s.choiceLabel}>{op.label}</span>
                  <span className={s.choiceHint}>{op.hint}</span>
                </span>
                <span className={s.choiceArrow} aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
