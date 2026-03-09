"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { useState } from "react";
import type { City, Country } from "@/types";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO 3166-1 numeric → alpha-2 mapping (subset of visited countries)
// react-simple-maps uses numeric codes in TopoJSON
const NUMERIC_TO_ALPHA: Record<string, string> = {
  "392": "JP", "250": "FR", "840": "US", "826": "GB",
  "036": "AU", "702": "SG", "764": "TH", "380": "IT",
  "410": "KR", "276": "DE", "724": "ES", "756": "CH",
  "528": "NL", "040": "AT", "620": "PT", "056": "BE",
  "208": "DK", "752": "SE", "578": "NO", "246": "FI",
  "554": "NZ", "124": "CA", "484": "MX", "076": "BR",
  "032": "AR", "152": "CL", "604": "PE", "170": "CO",
  "710": "ZA", "404": "KE", "818": "EG", "012": "DZ",
  "356": "IN", "156": "CN", "458": "MY", "360": "ID",
  "704": "VN", "116": "KH", "104": "MM", "608": "PH",
  "050": "BD", "144": "LK", "524": "NP", "586": "PK",
  "682": "SA", "784": "AE", "400": "JO", "376": "IL",
  "792": "TR", "300": "GR", "191": "HR", "705": "SI",
};

interface TravelMapProps {
  countries: Country[];
  cities: City[];
  interactive?: boolean;
}

const MARKER_COLORS: Record<string, string> = {
  Solo: "#2563eb",
  Business: "#d97706",
  Family: "#00a07a",
  Couple: "#f43f5e",
};

export default function TravelMap({
  countries,
  cities,
  interactive = true,
}: TravelMapProps) {
  const [tooltip, setTooltip] = useState<string>("");
  const visitedCodes = new Set(countries.map((c) => c.code));

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: "100%", height: "100%" }}
      >
        {interactive ? (
          <ZoomableGroup zoom={1}>
            <MapContent
              visitedCodes={visitedCodes}
              cities={cities}
              onTooltip={setTooltip}
              interactive={interactive}
            />
          </ZoomableGroup>
        ) : (
          <MapContent
            visitedCodes={visitedCodes}
            cities={cities}
            onTooltip={setTooltip}
            interactive={false}
          />
        )}
      </ComposableMap>
      {interactive && (
        <Tooltip anchorSelect=".map-marker" content={tooltip} />
      )}
    </div>
  );
}

function MapContent({
  visitedCodes,
  cities,
  onTooltip,
  interactive,
}: {
  visitedCodes: Set<string>;
  cities: City[];
  onTooltip: (v: string) => void;
  interactive: boolean;
}) {
  return (
    <>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const numericId = String(geo.id).padStart(3, "0");
            const alphaCode = NUMERIC_TO_ALPHA[numericId];
            const isVisited = alphaCode ? visitedCodes.has(alphaCode) : false;

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isVisited ? "#e03d60" : "#E5E4E1"}
                stroke="#ffffff"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: isVisited ? "#c42d50" : "#d0cfcc" },
                  pressed: { outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
      {interactive &&
        cities
          .filter((c) => c.latitude && c.longitude)
          .map((city) => (
            <Marker
              key={city.id}
              coordinates={[city.longitude!, city.latitude!]}
              className="map-marker"
              onMouseEnter={() =>
                onTooltip(`${city.name}, ${city.country_name}`)
              }
            >
              <circle
                r={4}
                fill={MARKER_COLORS[city.trip_type] ?? "#9c9b99"}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="cursor-pointer"
              />
            </Marker>
          ))}
    </>
  );
}
