import { createClient } from "@/lib/supabase/server";
import { MapPin, Globe, Layers, Heart } from "lucide-react";
import Link from "next/link";

// Country → Continent mapping (used to count distinct continents from city data)
const COUNTRY_REGION: Record<string, string> = {
  // Asia
  Japan: "Asia", China: "Asia", "South Korea": "Asia", Thailand: "Asia",
  Vietnam: "Asia", Singapore: "Asia", Malaysia: "Asia", Indonesia: "Asia",
  Philippines: "Asia", Cambodia: "Asia", Myanmar: "Asia", Laos: "Asia",
  India: "Asia", Nepal: "Asia", "Sri Lanka": "Asia", Bangladesh: "Asia",
  Pakistan: "Asia", Kazakhstan: "Asia", Uzbekistan: "Asia", Kyrgyzstan: "Asia",
  Mongolia: "Asia", Bhutan: "Asia", Maldives: "Asia", Brunei: "Asia",
  Taiwan: "Asia", "Hong Kong": "Asia", Macau: "Asia",
  // Europe
  France: "Europe", Germany: "Europe", "United Kingdom": "Europe", Italy: "Europe",
  Spain: "Europe", Portugal: "Europe", Netherlands: "Europe", Belgium: "Europe",
  Switzerland: "Europe", Austria: "Europe", Denmark: "Europe", Sweden: "Europe",
  Norway: "Europe", Finland: "Europe", "Czech Republic": "Europe", Poland: "Europe",
  Greece: "Europe", Croatia: "Europe", Slovenia: "Europe", Slovakia: "Europe",
  Hungary: "Europe", Romania: "Europe", Bulgaria: "Europe", Ukraine: "Europe",
  Ireland: "Europe", Iceland: "Europe", Estonia: "Europe", Latvia: "Europe",
  Lithuania: "Europe", Serbia: "Europe", Albania: "Europe", Belarus: "Europe",
  "North Macedonia": "Europe", "Bosnia & Herzegovina": "Europe",
  // Americas
  "United States": "Americas", Canada: "Americas", Mexico: "Americas",
  Brazil: "Americas", Argentina: "Americas", Chile: "Americas", Colombia: "Americas",
  Peru: "Americas", Venezuela: "Americas", Bolivia: "Americas", Ecuador: "Americas",
  Paraguay: "Americas", Uruguay: "Americas", "Costa Rica": "Americas",
  Panama: "Americas", Guatemala: "Americas", Honduras: "Americas",
  Cuba: "Americas", "Dominican Republic": "Americas", Jamaica: "Americas",
  // Africa
  "South Africa": "Africa", Kenya: "Africa", Egypt: "Africa", Nigeria: "Africa",
  Ethiopia: "Africa", Ghana: "Africa", Tanzania: "Africa", Uganda: "Africa",
  Morocco: "Africa", Tunisia: "Africa", Algeria: "Africa", Libya: "Africa",
  Senegal: "Africa", Cameroon: "Africa", Zambia: "Africa", Zimbabwe: "Africa",
  Mozambique: "Africa", Madagascar: "Africa", Botswana: "Africa", Namibia: "Africa",
  Rwanda: "Africa", "DR Congo": "Africa",
  // Oceania
  Australia: "Oceania", "New Zealand": "Oceania", "Papua New Guinea": "Oceania",
  Fiji: "Oceania",
  // Middle East
  "Saudi Arabia": "Middle East", UAE: "Middle East", Israel: "Middle East",
  Jordan: "Middle East", Turkey: "Middle East", Iran: "Middle East",
  Iraq: "Middle East", Syria: "Middle East", Lebanon: "Middle East",
  Qatar: "Middle East", Kuwait: "Middle East", Oman: "Middle East",
  Yemen: "Middle East", Bahrain: "Middle East",
};

async function getStats() {
  const supabase = createClient();

  const [{ data: allCities }, { data: recentCities }] = await Promise.all([
    supabase.from("cities").select("country_name, with_wife, trip_type"),
    supabase
      .from("cities")
      .select("id, name, country_name, trip_type, visit_date_start, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const cities = allCities ?? [];

  const uniqueCountries = new Set(
    cities.filter((c) => c.country_name).map((c) => c.country_name as string)
  );

  const continents = new Set(
    Array.from(uniqueCountries)
      .map((name) => COUNTRY_REGION[name])
      .filter(Boolean)
  ).size;

  const withWife = new Set(
    cities
      .filter((c) => c.with_wife && c.country_name)
      .map((c) => c.country_name as string)
  ).size;

  return {
    cities: cities.length,
    countries: uniqueCountries.size,
    continents,
    withWife,
    recentCities: recentCities ?? [],
  };
}

const TRIP_TYPE_COLORS: Record<string, string> = {
  Solo: "bg-sky-100 text-sky-700",
  Business: "bg-amber-100 text-amber-700",
  Family: "bg-emerald-100 text-emerald-700",
  Couple: "bg-rose-100 text-rose-600",
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  Solo: "Solo",
  Business: "Business",
  Family: "Family",
  Couple: "With Wife",
};

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      label: "Cities Visited",
      value: stats.cities,
      icon: MapPin,
      color: "text-accent-sky",
      bg: "bg-blue-50",
      href: "/cities",
    },
    {
      label: "Countries Visited",
      value: stats.countries,
      icon: Globe,
      color: "text-accent-sage",
      bg: "bg-emerald-50",
      href: "/countries",
    },
    {
      label: "Continents Covered",
      value: stats.continents,
      icon: Layers,
      color: "text-accent-lavender",
      bg: "bg-purple-50",
      href: "/map",
    },
    {
      label: "Countries with Wife",
      value: stats.withWife,
      icon: Heart,
      color: "text-accent-blush",
      bg: "bg-rose-50",
      href: "/countries",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">My Travel Log</h1>
        <p className="text-sm text-ink-2 mt-0.5">Your journey at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <div className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-ink-2 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent trips */}
      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-ink text-sm">Recent Trips</h2>
          <Link href="/cities" className="text-xs text-accent-blush hover:underline">
            View all
          </Link>
        </div>
        {stats.recentCities.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-2">
            No trips logged yet.{" "}
            <Link href="/cities" className="text-accent-blush hover:underline">
              Add your first city
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-subtle">
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-3">City</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-3">Country</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-3">Trip type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentCities.map((city) => (
                <tr key={city.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-6 py-3 font-medium text-ink">{city.name}</td>
                  <td className="px-6 py-3 text-ink-2">{city.country_name || "—"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${TRIP_TYPE_COLORS[city.trip_type] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {TRIP_TYPE_LABELS[city.trip_type] ?? city.trip_type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-3">
                    {city.visit_date_start
                      ? new Date(city.visit_date_start).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
