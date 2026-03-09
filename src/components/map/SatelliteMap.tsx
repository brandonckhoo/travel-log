"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { City, Country } from "@/types";

// Leaflet CSS — must be loaded client-side only
import "leaflet/dist/leaflet.css";

const MARKER_COLORS: Record<string, string> = {
  Solo: "#2563eb",
  Business: "#d97706",
  Family: "#00a07a",
  Couple: "#f43f5e",
  FamilyCouple: "#9333ea",
};

interface SatelliteMapProps {
  cities: City[];
  countries: Country[];
}

export default function SatelliteMap({ cities }: SatelliteMapProps) {
  // Fix Leaflet marker icon paths broken by webpack
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const pinned = cities.filter((c) => c.latitude && c.longitude);

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={1}
      maxZoom={18}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", minHeight: 480 }}
    >
      {/* Satellite imagery layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
        maxZoom={19}
      />
      {/* Labels layer on top of satellite */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution=""
        maxZoom={19}
        opacity={0.7}
      />

      {pinned.map((city) => (
        <CircleMarker
          key={city.id}
          center={[city.latitude!, city.longitude!]}
          radius={7}
          fillColor={MARKER_COLORS[city.trip_type] ?? "#9c9b99"}
          color="#ffffff"
          weight={2}
          fillOpacity={1}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <span className="text-xs font-medium">
              {city.name}
              {city.country_name ? `, ${city.country_name}` : ""}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
