"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import useSWR from "swr";
import Modal from "@/components/ui/Modal";
import { createCity, updateCity } from "@/lib/queries/cities";
import { getCountries } from "@/lib/queries/countries";
import type { City, TripType } from "@/types";
import { cn } from "@/lib/utils";

interface CityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City | null;
  onSaved: () => void;
}

type BaseType = "Solo" | "Business" | "Family";

const BASE_TYPES: BaseType[] = ["Solo", "Business", "Family"];

function deriveTripType(base: BaseType, withWife: boolean): TripType {
  if (base === "Family" && withWife) return "FamilyCouple";
  if (withWife) return "Couple";
  return base;
}

function splitTripType(tripType: TripType): { base: BaseType; withWife: boolean } {
  switch (tripType) {
    case "Couple":       return { base: "Solo",     withWife: true };
    case "FamilyCouple": return { base: "Family",   withWife: true };
    case "Family":       return { base: "Family",   withWife: false };
    case "Business":     return { base: "Business", withWife: false };
    default:             return { base: "Solo",     withWife: false };
  }
}

const EMPTY = {
  name: "",
  country_id: "",
  country_name: "",
  base_type: "Solo" as BaseType,
  with_wife: false,
  visit_date_start: "",
  visit_date_end: "",
  notes: "",
};

export default function CityModal({
  open,
  onOpenChange,
  city,
  onSaved,
}: CityModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: countries } = useSWR("countries-list", () => getCountries());

  useEffect(() => {
    if (city) {
      const { base, withWife } = splitTripType(city.trip_type);
      setForm({
        name: city.name,
        country_id: city.country_id ?? "",
        country_name: city.country_name,
        base_type: base,
        with_wife: withWife,
        visit_date_start: city.visit_date_start ?? "",
        visit_date_end: city.visit_date_end ?? "",
        notes: city.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setDetectedCountry(null);
    setError(null);
  }, [city, open]);

  // Auto-detect country from city name
  useEffect(() => {
    if (!form.name || form.name.length < 2 || city) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setDetecting(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.name)}&format=json&limit=1&addressdetails=1`,
          { headers: { "User-Agent": "TravelLog/1.0" } }
        );
        const data = await res.json();
        const countryName = data[0]?.address?.country;
        const countryCode = data[0]?.address?.country_code?.toUpperCase();

        if (countryName && countryCode && countries) {
          const match =
            countries.find((c) => c.code === countryCode) ||
            countries.find((c) =>
              c.name.toLowerCase().includes(countryName.toLowerCase())
            );

          if (!form.country_name) {
            const nameToUse = match?.name ?? countryName;
            setForm((f) => ({
              ...f,
              country_name: nameToUse,
              country_id: match?.id ?? "",
            }));
            setDetectedCountry(nameToUse);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setDetecting(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.name, form.country_id, countries, city]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const trip_type = deriveTripType(form.base_type, form.with_wife);
      const payload = {
        name: form.name,
        country_id: form.country_id || null,
        country_name: form.country_name,
        trip_type,
        visit_date_start: form.visit_date_start || null,
        visit_date_end: form.visit_date_end || null,
        notes: form.notes || null,
        with_wife: form.with_wife,
      };
      if (city) {
        await updateCity(city.id, payload);
      } else {
        await createCity(payload);
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
      title={city ? "Edit City" : "Add City"}
      description="A photo will be fetched automatically."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City name */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            City name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Tokyo"
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
          />
        </div>

        {/* Country */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-ink">
              Country
              <span className="text-ink-3 font-normal ml-1">(optional)</span>
            </label>
            {detecting && (
              <span className="flex items-center gap-1 text-xs text-ink-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                Detecting...
              </span>
            )}
          </div>
          <input
            value={form.country_name}
            onChange={(e) => {
              setDetectedCountry(null);
              const match = countries?.find(
                (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
              );
              setForm((f) => ({
                ...f,
                country_name: e.target.value,
                country_id: match?.id ?? "",
              }));
            }}
            placeholder="e.g. Japan"
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
          />
          {detectedCountry && (
            <p className="flex items-center gap-1 text-xs text-accent-sage mt-1">
              <Sparkles className="w-3 h-3" />
              Auto-filled from city name
            </p>
          )}
        </div>

        {/* Trip type — pill buttons + with wife checkbox */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Trip type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            {BASE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, base_type: type }))}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-medium border transition-all",
                  form.base_type === type
                    ? "bg-ink text-white border-ink"
                    : "bg-bg text-ink-2 border-border hover:border-ink-2 hover:text-ink"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div
              onClick={() => setForm((f) => ({ ...f, with_wife: !f.with_wife }))}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
                form.with_wife
                  ? "bg-accent-blush border-accent-blush"
                  : "bg-bg border-border group-hover:border-accent-blush/60"
              )}
            >
              {form.with_wife && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-ink">With Wife</span>
            {form.with_wife && (
              <span className="text-xs text-rose-500">
                · marks country as visited with wife
              </span>
            )}
          </label>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Visit start
              <span className="text-ink-3 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="date"
              value={form.visit_date_start}
              onChange={(e) =>
                setForm((f) => ({ ...f, visit_date_start: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Visit end
              <span className="text-ink-3 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="date"
              value={form.visit_date_end}
              onChange={(e) =>
                setForm((f) => ({ ...f, visit_date_end: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Anything memorable about this trip..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 border border-border text-ink text-sm font-medium rounded-xl hover:bg-surface-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {city ? "Save changes" : "Add city"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
