"use client";

import { useState } from "react";
import { ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleBackfill() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/backfill-photos", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else if (data.updated === 0) {
        setResult("All cities already have photos.");
      } else {
        setResult(`Updated ${data.updated} of ${data.total} cities with photos.`);
      }
    } catch {
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <p className="text-sm text-ink-2 mt-1">Account and preferences.</p>

      <div className="mt-8 bg-surface rounded-2xl shadow-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-accent-sky" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-ink text-sm">Refresh City Photos</h2>
            <p className="text-xs text-ink-2 mt-1 mb-4">
              Fetch Unsplash cover photos for any cities that are missing one.
            </p>
            <button
              onClick={handleBackfill}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Fetching photos…" : "Refresh Photos"}
            </button>
            {result && (
              <p className="flex items-center gap-1.5 text-xs text-accent-sage mt-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {result}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
