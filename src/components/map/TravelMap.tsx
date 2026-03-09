"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  Sphere,
  Graticule,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { useState, useRef, useEffect, useCallback } from "react";
import type { City, Country } from "@/types";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

const NUMERIC_TO_NAME: Record<string, string> = {
  "004": "Afghanistan", "008": "Albania", "012": "Algeria",
  "024": "Angola", "032": "Argentina", "036": "Australia",
  "040": "Austria", "031": "Azerbaijan", "050": "Bangladesh",
  "056": "Belgium", "064": "Bhutan", "068": "Bolivia",
  "070": "Bosnia & Herzegovina", "072": "Botswana", "076": "Brazil",
  "096": "Brunei", "100": "Bulgaria", "104": "Myanmar",
  "108": "Burundi", "116": "Cambodia", "120": "Cameroon",
  "124": "Canada", "140": "Central African Republic", "144": "Sri Lanka",
  "152": "Chile", "156": "China", "170": "Colombia",
  "180": "DR Congo", "188": "Costa Rica", "191": "Croatia",
  "192": "Cuba", "203": "Czech Republic", "204": "Benin",
  "208": "Denmark", "262": "Djibouti", "214": "Dominican Republic",
  "218": "Ecuador", "818": "Egypt", "222": "El Salvador",
  "232": "Eritrea", "233": "Estonia", "231": "Ethiopia",
  "242": "Fiji", "246": "Finland", "250": "France",
  "266": "Gabon", "270": "Gambia", "268": "Georgia",
  "276": "Germany", "288": "Ghana", "300": "Greece",
  "304": "Greenland", "320": "Guatemala", "324": "Guinea",
  "332": "Haiti", "340": "Honduras", "348": "Hungary",
  "352": "Iceland", "356": "India", "360": "Indonesia",
  "364": "Iran", "368": "Iraq", "372": "Ireland",
  "376": "Israel", "380": "Italy", "388": "Jamaica",
  "392": "Japan", "400": "Jordan", "398": "Kazakhstan",
  "404": "Kenya", "408": "North Korea", "410": "South Korea",
  "414": "Kuwait", "417": "Kyrgyzstan", "418": "Laos",
  "428": "Latvia", "422": "Lebanon", "426": "Lesotho",
  "430": "Liberia", "434": "Libya", "440": "Lithuania",
  "450": "Madagascar", "454": "Malawi", "458": "Malaysia",
  "462": "Maldives", "466": "Mali", "478": "Mauritania",
  "484": "Mexico", "496": "Mongolia", "504": "Morocco",
  "508": "Mozambique", "516": "Namibia", "524": "Nepal",
  "528": "Netherlands", "554": "New Zealand", "558": "Nicaragua",
  "562": "Niger", "566": "Nigeria", "578": "Norway",
  "512": "Oman", "586": "Pakistan", "591": "Panama",
  "598": "Papua New Guinea", "600": "Paraguay", "604": "Peru",
  "608": "Philippines", "616": "Poland", "620": "Portugal",
  "634": "Qatar", "642": "Romania", "643": "Russia",
  "646": "Rwanda", "682": "Saudi Arabia", "686": "Senegal",
  "694": "Sierra Leone", "702": "Singapore", "703": "Slovakia",
  "705": "Slovenia", "706": "Somalia", "710": "South Africa",
  "728": "South Sudan", "724": "Spain",
  "729": "Sudan", "740": "Suriname", "752": "Sweden",
  "756": "Switzerland", "760": "Syria", "834": "Tanzania",
  "764": "Thailand", "780": "Trinidad & Tobago", "788": "Tunisia",
  "792": "Turkey", "795": "Turkmenistan", "800": "Uganda",
  "804": "Ukraine", "784": "UAE", "826": "United Kingdom",
  "840": "United States", "858": "Uruguay", "860": "Uzbekistan",
  "862": "Venezuela", "704": "Vietnam", "887": "Yemen",
  "894": "Zambia", "716": "Zimbabwe", "807": "North Macedonia",
  "051": "Armenia", "112": "Belarus",
};

const MARKER_COLORS: Record<string, string> = {
  Solo: "#2563eb",
  Business: "#d97706",
  Family: "#00a07a",
  Couple: "#f43f5e",
  FamilyCouple: "#9333ea",
};

type ViewMode = "globe" | "map";

interface TravelMapProps {
  countries: Country[];
  cities: City[];
  interactive?: boolean;
}

export default function TravelMap({
  countries,
  cities,
  interactive = true,
}: TravelMapProps) {
  const [cityTooltip, setCityTooltip] = useState("");
  const [countryHover, setCountryHover] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [rotation, setRotation] = useState<[number, number, number]>([-15, -25, 0]);
  const [globeZoom, setGlobeZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visitedCodes = new Set(countries.map((c) => c.code));

  // Non-passive wheel listener for globe zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || viewMode !== "globe" || !interactive) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setGlobeZoom((z) =>
        Math.max(0.5, Math.min(6, z * (1 - e.deltaY * 0.0008)))
      );
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [viewMode, interactive]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (viewMode !== "globe" || !interactive) return;
      dragRef.current = true;
      setIsDragging(true);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    },
    [viewMode, interactive]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setRotation(([rx, ry, rz]) => [rx + dx * 0.4, ry - dy * 0.4, rz]);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current = false;
    setIsDragging(false);
    lastPosRef.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#dbeafe]"
      style={{
        minHeight: 480,
        cursor:
          viewMode === "globe"
            ? isDragging
              ? "grabbing"
              : "grab"
            : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Globe / Map toggle */}
      {interactive && (
        <div className="absolute top-3 left-3 z-10 flex bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm overflow-hidden select-none">
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "map"
                ? "bg-accent-blush text-white"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            🗺 Map
          </button>
          <button
            onClick={() => setViewMode("globe")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "globe"
                ? "bg-accent-blush text-white"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            🌐 Globe
          </button>
        </div>
      )}

      {/* Country name badge */}
      {countryHover && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-ink text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm pointer-events-none select-none transition-opacity">
          {countryHover}
        </div>
      )}

      <ComposableMap
        projection={viewMode === "globe" ? "geoOrthographic" : "geoNaturalEarth1"}
        projectionConfig={
          viewMode === "globe"
            ? { rotate: rotation, scale: 200 * globeZoom }
            : { scale: 153, center: [0, 10] }
        }
        style={{ width: "100%", height: "100%" }}
      >
        {viewMode === "map" && interactive ? (
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
            <MapContent
              visitedCodes={visitedCodes}
              cities={cities}
              onCityTooltip={setCityTooltip}
              onCountryHover={setCountryHover}
              interactive={interactive}
            />
          </ZoomableGroup>
        ) : (
          <MapContent
            visitedCodes={visitedCodes}
            cities={cities}
            onCityTooltip={setCityTooltip}
            onCountryHover={setCountryHover}
            interactive={interactive}
          />
        )}
      </ComposableMap>

      {interactive && (
        <Tooltip anchorSelect=".map-marker" content={cityTooltip} />
      )}
      {interactive && (
        <p className="absolute bottom-3 right-4 text-xs text-blue-300 select-none">
          {viewMode === "globe"
            ? "Drag to rotate · Scroll to zoom"
            : "Scroll to zoom · Drag to pan"}
        </p>
      )}
    </div>
  );
}

function MapContent({
  visitedCodes,
  cities,
  onCityTooltip,
  onCountryHover,
  interactive,
}: {
  visitedCodes: Set<string>;
  cities: City[];
  onCityTooltip: (v: string) => void;
  onCountryHover: (v: string) => void;
  interactive: boolean;
}) {
  return (
    <>
      <Sphere id="ocean" fill="#bfdbfe" stroke="#93c5fd" strokeWidth={0.5} />
      <Graticule stroke="#93c5fd" strokeWidth={0.3} />
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const numericId = String(geo.id).padStart(3, "0");
            const alphaCode = NUMERIC_TO_ALPHA[numericId];
            const isVisited = alphaCode ? visitedCodes.has(alphaCode) : false;
            const countryName = NUMERIC_TO_NAME[numericId] ?? alphaCode ?? "";

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isVisited ? "#e03d60" : "#e8e6e2"}
                stroke="#ffffff"
                strokeWidth={0.4}
                onMouseEnter={() => interactive && onCountryHover(countryName)}
                onMouseLeave={() => interactive && onCountryHover("")}
                style={{
                  default: { outline: "none" },
                  hover: {
                    outline: "none",
                    fill: isVisited ? "#c42d50" : "#d4d1cc",
                    cursor: "default",
                  },
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
                onCityTooltip(
                  `${city.name}${city.country_name ? `, ${city.country_name}` : ""}`
                )
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
