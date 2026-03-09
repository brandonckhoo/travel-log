export async function fetchPhoto(query: string): Promise<string | null> {
  try {
    // Server-side: call Unsplash directly with the secret key
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (key) {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
        { headers: { Authorization: `Client-ID ${key}` } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.results?.[0]?.urls?.regular ?? null;
    }

    // Client-side: proxy through the API route
    const res = await fetch(`/api/photo?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
