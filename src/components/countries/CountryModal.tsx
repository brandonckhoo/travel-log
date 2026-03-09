"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { createCountry, updateCountry } from "@/lib/queries/countries";
import type { Country } from "@/types";
import { REGIONS } from "@/types";

interface CountryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country | null;
  onSaved: () => void;
}

const EMPTY = {
  name: "",
  code: "",
  region: "Asia",
  first_visit_date: "",
  with_wife: false,
};

export default function CountryModal({
  open,
  onOpenChange,
  country,
  onSaved,
}: CountryModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (country) {
      setForm({
        name: country.name,
        code: country.code,
        region: country.region,
        first_visit_date: country.first_visit_date ?? "",
        with_wife: country.with_wife,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [country, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (country) {
        await updateCountry(country.id, {
          ...form,
          first_visit_date: form.first_visit_date || null,
        });
      } else {
        await createCountry({
          ...form,
          first_visit_date: form.first_visit_date || null,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={country ? "Edit Country" : "Add Country"}
      description={country ? undefined : "A photo will be fetched automatically from Unsplash."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-ink mb-1.5">
              Country name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Japan"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Country code <span className="text-red-500">*</span>
            </label>
            <input
              required
              maxLength={2}
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              placeholder="JP"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            >
              {REGIONS.filter((r) => r !== "All").map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-ink mb-1.5">
              First visit date
            </label>
            <input
              type="date"
              value={form.first_visit_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_visit_date: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            />
          </div>
        </div>

        {/* With Wife toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.with_wife}
              onChange={(e) =>
                setForm((f) => ({ ...f, with_wife: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-accent-blush transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-ink">Visited with wife</span>
        </label>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 px-4 border border-border text-ink text-sm font-medium rounded-xl hover:bg-surface-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {country ? "Save changes" : "Add country"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
