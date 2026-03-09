import { createClient } from "@/lib/supabase/client";
import { fetchPhoto } from "@/lib/unsplash";
import type { Country } from "@/types";

export async function getCountries(region?: string): Promise<Country[]> {
  const supabase = createClient();
  let query = supabase
    .from("countries")
    .select(
      `
      *,
      cities_count:cities(count),
      visits_count:cities(count)
    `
    )
    .order("name");

  if (region && region !== "All") {
    query = query.eq("region", region);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    cities_count: (row.cities_count as { count: number }[])?.[0]?.count ?? 0,
    visits_count: (row.visits_count as { count: number }[])?.[0]?.count ?? 0,
  })) as Country[];
}

export async function createCountry(
  values: Omit<Country, "id" | "created_at" | "updated_at" | "photo_url" | "cities_count" | "visits_count">
): Promise<Country> {
  const supabase = createClient();
  const photo_url = await fetchPhoto(values.name);

  const { data, error } = await supabase
    .from("countries")
    .insert({ ...values, photo_url })
    .select()
    .single();

  if (error) throw error;
  return data as Country;
}

export async function updateCountry(
  id: string,
  values: Partial<Omit<Country, "id" | "created_at" | "updated_at">>
): Promise<Country> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("countries")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Country;
}

export async function deleteCountry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("countries").delete().eq("id", id);
  if (error) throw error;
}
