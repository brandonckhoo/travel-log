import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json({ error: "No Unsplash key" }, { status: 500 });

  const { data: cities, error } = await supabase
    .from("cities")
    .select("id, name, country_name")
    .is("photo_url", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!cities?.length) return NextResponse.json({ updated: 0 });

  let updated = 0;
  for (const city of cities) {
    try {
      const query = city.country_name
        ? `${city.name} ${city.country_name}`
        : city.name;
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
        { headers: { Authorization: `Client-ID ${key}` } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const photo_url = data.results?.[0]?.urls?.regular ?? null;
      if (!photo_url) continue;

      await supabase
        .from("cities")
        .update({ photo_url, updated_at: new Date().toISOString() })
        .eq("id", city.id);
      updated++;
    } catch {
      // skip individual failures
    }
  }

  return NextResponse.json({ updated, total: cities.length });
}
