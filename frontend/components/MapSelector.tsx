"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para el ícono por defecto de Leaflet en Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ícono personalizado amarillo para el pin
const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Sub-componente que captura clics en el mapa ────────────────────────────
function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Props ──────────────────────────────────────────────────────────────────
interface MapSelectorProps {
  onLocationSelect: (lat: number, lon: number) => void;
  lat: number | null;
  lon: number | null;
}

// ── Componente principal ───────────────────────────────────────────────────
export default function MapSelector({ onLocationSelect, lat, lon }: MapSelectorProps) {
  // Centro aproximado de México
  const CENTER: [number, number] = [23.5, -102.5];
  const ZOOM = 5;

  useEffect(() => {
    // Asegurar que Leaflet se inicializa correctamente sin SSR
    if (typeof window !== "undefined") {
      import("leaflet");
    }
  }, []);

  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      style={{ width: "100%", height: "100%", background: "#071828" }}
      // Limitar el panning a la región de México aproximadamente
      maxBounds={[
        [14.0, -120.0],
        [33.5, -85.0],
      ]}
      maxBoundsViscosity={0.8}
    >
      {/* Tiles oscuros de CartoDB para mantener la estética del dashboard */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <ClickHandler onLocationSelect={onLocationSelect} />

      {/* Mostrar pin si hay coordenadas seleccionadas */}
      {lat !== null && lon !== null && (
        <Marker position={[lat, lon]} icon={yellowIcon} />
      )}
    </MapContainer>
  );
}