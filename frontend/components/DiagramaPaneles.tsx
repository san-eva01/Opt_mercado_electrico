"use client";

import { useId } from "react";

export interface DiagramaPanelesProps {
  beta: number;
  gammaSolar: number;
  d: number;
  b: number;
}

export default function DiagramaPaneles({ beta, gammaSolar, d, b }: DiagramaPanelesProps) {
  const id = useId().replace(/:/g, "");
  if (![beta, gammaSolar, d, b].every(Number.isFinite) || gammaSolar <= 0 || d <= 0 || b <= 0) {
    return <p role="status">No hay una separación válida para esta altura solar.</p>;
  }
  const rad = Math.PI / 180;
  const scale = Math.min(150, 490 / (d + b * Math.cos(beta * rad)), 140 / b);
  const length = b * scale;
  const spacing = d * scale;
  const ground = 285;
  const x1 = 95;
  const x2 = x1 + spacing;
  const dx = length * Math.cos(beta * rad);
  const dy = length * Math.sin(beta * rad);
  const rayLength = Math.min((x2 - 40) / Math.cos(gammaSolar * rad), 185 / Math.sin(gammaSolar * rad));
  const sunX = x2 - rayLength * Math.cos(gammaSolar * rad);
  const sunY = ground - rayLength * Math.sin(gammaSolar * rad);
  const arc = (x: number, angle: number, radius: number, left = false) => {
    const sign = left ? -1 : 1;
    return `M ${x + sign * radius} ${ground} A ${radius} ${radius} 0 0 ${left ? 1 : 0} ${x + sign * radius * Math.cos(angle * rad)} ${ground - radius * Math.sin(angle * rad)}`;
  };
  return (
    <svg id="diagrama-paneles" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" role="img" aria-labelledby={`${id}-title ${id}-desc`} fontFamily="Arial, sans-serif">
      <title id={`${id}-title`}>Inclinación y separación entre hileras de paneles</title>
      <desc id={`${id}-desc`}>Dos paneles de {b.toFixed(1)} metros, inclinados {beta.toFixed(1)} grados, con separación de {d.toFixed(2)} metros y altura solar de {gammaSolar.toFixed(1)} grados.</desc>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#87CEEB" /><stop offset="1" stopColor="#E0F0FF" /></linearGradient>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" /></marker>
      </defs>
      <rect width="700" height="400" rx="14" fill="#fff" />
      <rect y="55" width="700" height="230" fill={`url(#${id}-sky)`} />
      <text x="350" y="32" textAnchor="middle" fill="#1e293b" fontSize="19">d<tspan baselineShift="sub" fontSize="12">min</tspan> = b · sin(γs + β) / sin(γs)</text>
      <rect y={ground} width="700" height="31" fill="#8B7355" />
      <rect y={ground} width="700" height="7" fill="#90EE90" />
      <g stroke="#FF8C00" strokeWidth="3">
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={sunX + 24 * Math.cos(i * Math.PI / 6)} y1={sunY + 24 * Math.sin(i * Math.PI / 6)} x2={sunX + 32 * Math.cos(i * Math.PI / 6)} y2={sunY + 32 * Math.sin(i * Math.PI / 6)} />)}
      </g>
      <circle cx={sunX} cy={sunY} r="19" fill="#FFD700" />
      <line x1={sunX} y1={sunY} x2={x2} y2={ground} stroke="#FF8C00" strokeWidth="2" strokeDasharray="7 4" />
      <text x="680" y="77" textAnchor="end" fontSize="13" fontStyle="italic" fill="#9a4500">Posición del sol el 21 de diciembre</text>
      {[x1, x2].map((x, index) => (
        <g key={index}>
          <line x1={x + dx} y1={ground - dy} x2={x + dx} y2={ground} stroke="#64748b" strokeWidth="4" />
          <g transform={`translate(${x} ${ground}) rotate(${-beta})`}>
            <rect x="0" y="-9" width={length} height="9" fill="#1565C0" stroke="#0d47a1" strokeWidth="2" />
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={length * (i + 1) / 10} x2={length * (i + 1) / 10} y1="-9" y2="0" stroke="#42A5F5" />)}
            <line x1="0" x2={length} y1="-4.5" y2="-4.5" stroke="#42A5F5" />
          </g>
          <path d={arc(x, beta, 36)} fill="none" stroke="#1565C0" strokeWidth="1.5" />
          <text x={x} y={ground + 50} fontSize="13" fill="#1565C0">β = {beta.toFixed(1)}°</text>
        </g>
      ))}
      <path d={arc(x2, gammaSolar, 47, true)} fill="none" stroke="#c65c00" strokeWidth="1.5" />
      <text x={x2 - 110} y={ground - 18} fontSize="13" fill="#9a4500">γs = {gammaSolar.toFixed(1)}°</text>
      <g stroke="#334155" strokeWidth="1.3" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`}>
        <line x1={x1} x2={x2} y1="355" y2="355" />
        <line x1={x2 + dx + 22} x2={x2 + dx + 22} y1={ground - Math.max(dy, 10)} y2={ground} />
      </g>
      <text x={(x1 + x2) / 2} y="378" textAnchor="middle" fontSize="15" fill="#1e293b">d_min = {d.toFixed(2)} m</text>
      <text x={x2 + dx + 30} y={ground - dy / 2} fontSize="13" fill="#1e293b">b = {b.toFixed(1)} m</text>
    </svg>
  );
}
