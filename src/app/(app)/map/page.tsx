import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import type { Country, City } from "@/types";

const TravelMap = dynamic(() => import("@/components/map/TravelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-subtle animate-pulse rounded-2xl" />
  ),
});

async function getData() {
  const supabase = createClient();
  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from("countries").select("*"),
    supabase.from("cities").select("*").not("latitude", "is", null),
  ]);
  return { countries: (countries ?? []) as Country[], cities: (cities ?? []) as City[] };
}

const LEGEND = [
  { label: "Solo", color: "#2563eb" },
  { label: "Business", color: "#d97706" },
  { label: "Family", color: "#00a07a" },
  { label: "With Wife", color: "#f43f5e" },
];

export default async function MapPage() {
  const { countries, cities } = await getData();

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Map View</h1>
        <p className="text-sm text-ink-2 mt-0.5">
          {countries.length} countries · {cities.filter((c) => c.latitude).length} cities pinned
        </p>
      </div>

      <div className="flex-1 bg-surface rounded-2xl shadow-card overflow-hidden min-h-[500px]">
        <TravelMap countries={countries} cities={cities} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 flex-wrap">
        <span className="text-xs text-ink-3 font-medium">Trip type:</span>
        {LEGEND.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
            <span className="text-xs text-ink-2">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-8 h-3 rounded" style={{ background: "#e03d60" }} />
          <span className="text-xs text-ink-2">Visited country</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-3 rounded bg-[#E5E4E1]" />
          <span className="text-xs text-ink-2">Unvisited</span>
        </div>
      </div>
    </div>
  );
}
