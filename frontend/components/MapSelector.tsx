"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pinIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Sub-componente que mueve el mapa cuando cambia el centro
function MapController({ center }: { center: { lat: number; lon: number; zoom: number } }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (
      center.lat !== prevCenter.current.lat ||
      center.lon !== prevCenter.current.lon
    ) {
      map.flyTo([center.lat, center.lon], center.zoom, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapSelectorProps {
  onLocationSelect: (lat: number, lon: number) => void;
  lat: number | null;
  lon: number | null;
  center: { lat: number; lon: number; zoom: number };
}

export default function MapSelector({ onLocationSelect, lat, lon, center }: MapSelectorProps) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={center.zoom}
      style={{ width: "100%", height: "100%" }}
      maxBounds={[[14.0, -120.0], [33.5, -85.0]]}
      maxBoundsViscosity={0.8}
    >
      {/* Tiles claros de OpenStreetMap estándar */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} />
      <ClickHandler onLocationSelect={onLocationSelect} />

      {lat !== null && lon !== null && (
        <Marker position={[lat, lon]} icon={pinIcon} />
      )}
    </MapContainer>
  );
}