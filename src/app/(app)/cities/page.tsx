"use client";

import { useState } from "react";
import useSWR from "swr";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import CityCard from "@/components/cities/CityCard";
import CityModal from "@/components/cities/CityModal";
import ConfirmDelete from "@/components/countries/ConfirmDelete";
import { getCities, deleteCity } from "@/lib/queries/cities";
import type { City, TripType } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: TripType | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Solo", value: "Solo" },
  { label: "Business", value: "Business" },
  { label: "Family", value: "Family" },
  { label: "With Wife", value: "Couple" },
];

export default function CitiesPage() {
  const [tripFilter, setTripFilter] = useState<TripType | "All">("All");
  const [search, setSearch] = useState("");
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: cities, mutate, isLoading } = useSWR(
    ["cities", tripFilter, search],
    () =>
      getCities({
        tripType: tripFilter === "All" ? undefined : tripFilter,
        search: search || undefined,
      })
  );

  function handleAdd() {
    setEditingCity(null);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deletingCity) return;
    await deleteCity(deletingCity.id, deletingCity.country_id);
    mutate();
  }

  const total = cities?.length ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Cities Visited</h1>
          <p className="text-sm text-ink-2 mt-0.5">
            {total} trip{total !== 1 ? "s" : ""} logged
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add City
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cities..."
          className="px-3 py-2 rounded-xl border border-border bg-surface text-ink placeholder:text-ink-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blush/30 focus:border-accent-blush transition-all w-48"
        />
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTripFilter(value)}
              className={cn(
                "px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors",
                tripFilter === value
                  ? "bg-ink text-white"
                  : "bg-surface text-ink-2 hover:bg-surface-subtle hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-surface-subtle" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-subtle rounded w-2/3" />
                <div className="h-3 bg-surface-subtle rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cities?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-2 text-sm mb-4">No cities found.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Add your first city
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {cities?.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onEdit={(c) => {
                  setEditingCity(c);
                  setModalOpen(true);
                }}
                onDelete={setDeletingCity}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <CityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        city={editingCity}
        onSaved={() => mutate()}
      />
      <ConfirmDelete
        open={!!deletingCity}
        onOpenChange={(open) => !open && setDeletingCity(null)}
        itemName={deletingCity ? `${deletingCity.name}, ${deletingCity.country_name}` : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
