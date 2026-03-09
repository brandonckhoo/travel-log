export type TripType = "Solo" | "Business" | "Family" | "Couple";

export type Region =
  | "All"
  | "Asia"
  | "Europe"
  | "Americas"
  | "Africa"
  | "Oceania"
  | "Middle East";

export interface Country {
  id: string;
  name: string;
  code: string;
  region: string;
  photo_url: string | null;
  with_wife: boolean;
  first_visit_date: string | null;
  created_at: string;
  updated_at: string;
  // computed from joins
  cities_count?: number;
  visits_count?: number;
}

export interface City {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
  photo_url: string | null;
  with_wife: boolean;
  trip_type: TripType;
  visit_date_start: string;
  visit_date_end: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  // from join
  country?: Pick<Country, "id" | "name" | "code" | "region">;
}

export interface Stats {
  cities: number;
  countries: number;
  continents: number;
  with_wife_countries: number;
}

export const TRIP_TYPE_COLORS: Record<TripType, { bg: string; text: string; label: string }> = {
  Solo: { bg: "bg-sky-100", text: "text-sky-700", label: "Solo" },
  Business: { bg: "bg-amber-100", text: "text-amber-700", label: "Business" },
  Family: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Family" },
  Couple: { bg: "bg-rose-100", text: "text-rose-600", label: "With Wife" },
};

export const REGIONS: Region[] = [
  "All",
  "Asia",
  "Europe",
  "Americas",
  "Africa",
  "Oceania",
  "Middle East",
];
