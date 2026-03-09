import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json(null);

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    return NextResponse.json(data.results?.[0]?.urls?.regular ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
