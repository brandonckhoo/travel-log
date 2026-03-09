import { createClient } from "@/lib/supabase/client";
import { fetchPhoto } from "@/lib/unsplash";
import { geocodeCity } from "@/lib/geocode";
import type { City, TripType } from "@/types";

interface CityFilters {
  countryId?: string;
  tripType?: TripType;
  withWife?: boolean;
  search?: string;
}

export async function getCities(filters?: CityFilters): Promise<City[]> {
  const supabase = createClient();
  let query = supabase
    .from("cities")
    .select(`*, country:countries(id, name, code, region)`)
    .order("visit_date_start", { ascending: false });

  if (filters?.countryId) query = query.eq("country_id", filters.countryId);
  if (filters?.tripType) query = query.eq("trip_type", filters.tripType);
  if (filters?.withWife) query = query.eq("with_wife", true);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as City[];
}

export async function createCity(
  values: Omit<City, "id" | "created_at" | "updated_at" | "photo_url" | "latitude" | "longitude" | "country">
): Promise<City> {
  const supabase = createClient();

  const [photo_url, coords] = await Promise.all([
    fetchPhoto(`${values.name} ${values.country_name}`),
    geocodeCity(values.name, values.country_name),
  ]);

  const { data, error } = await supabase
    .from("cities")
    .insert({
      ...values,
      photo_url,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      with_wife: values.trip_type === "Couple",
    })
    .select(`*, country:countries(id, name, code, region)`)
    .single();

  if (error) throw error;

  // If Couple trip, mark country as with_wife
  if (values.trip_type === "Couple") {
    await supabase
      .from("countries")
      .update({ with_wife: true, updated_at: new Date().toISOString() })
      .eq("id", values.country_id);
  }

  return data as City;
}

export async function updateCity(
  id: string,
  values: Partial<Omit<City, "id" | "created_at" | "updated_at" | "country">>
): Promise<City> {
  const supabase = createClient();

  const updateData = {
    ...values,
    updated_at: new Date().toISOString(),
    ...(values.trip_type !== undefined && {
      with_wife: values.trip_type === "Couple",
    }),
  };

  const { data, error } = await supabase
    .from("cities")
    .update(updateData)
    .eq("id", id)
    .select(`*, country:countries(id, name, code, region)`)
    .single();

  if (error) throw error;

  // Recalculate country with_wife status
  if (values.country_id) {
    await recalcCountryWithWife(values.country_id);
  }

  return data as City;
}

export async function deleteCity(id: string, countryId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) throw error;
  await recalcCountryWithWife(countryId);
}

async function recalcCountryWithWife(countryId: string): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from("cities")
    .select("id")
    .eq("country_id", countryId)
    .eq("trip_type", "Couple")
    .limit(1);

  const hasCoupleTripLeft = (data ?? []).length > 0;
  await supabase
    .from("countries")
    .update({ with_wife: hasCoupleTripLeft, updated_at: new Date().toISOString() })
    .eq("id", countryId);
}
