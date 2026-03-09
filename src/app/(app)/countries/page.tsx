"use client";

import { useState } from "react";
import useSWR from "swr";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import CountryCard from "@/components/countries/CountryCard";
import CountryModal from "@/components/countries/CountryModal";
import ConfirmDelete from "@/components/countries/ConfirmDelete";
import { getCountries, deleteCountry } from "@/lib/queries/countries";
import type { Country, Region } from "@/types";
import { REGIONS } from "@/types";
import { cn } from "@/lib/utils";

export default function CountriesPage() {
  const [region, setRegion] = useState<Region>("All");
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [deletingCountry, setDeletingCountry] = useState<Country | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: countries, mutate, isLoading } = useSWR(
    ["countries", region],
    () => getCountries(region === "All" ? undefined : region)
  );

  function handleAdd() {
    setEditingCountry(null);
    setModalOpen(true);
  }

  function handleEdit(country: Country) {
    setEditingCountry(country);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deletingCountry) return;
    await deleteCountry(deletingCountry.id);
    mutate();
  }

  const total = countries?.length ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Countries</h1>
          <p className="text-sm text-ink-2 mt-0.5">
            {total} countr{total === 1 ? "y" : "ies"} visited across 6 continents
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Country
        </button>
      </div>

      {/* Region filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors",
              region === r
                ? "bg-ink text-white"
                : "bg-surface text-ink-2 hover:bg-surface-subtle hover:text-ink"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl overflow-hidden animate-pulse">
              <div className="h-32 bg-surface-subtle" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-subtle rounded w-2/3" />
                <div className="h-3 bg-surface-subtle rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : countries?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-2 text-sm mb-4">No countries yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-accent-blush text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Add your first country
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {countries?.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                onEdit={handleEdit}
                onDelete={setDeletingCountry}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <CountryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        country={editingCountry}
        onSaved={() => mutate()}
      />
      <ConfirmDelete
        open={!!deletingCountry}
        onOpenChange={(open) => !open && setDeletingCountry(null)}
        itemName={deletingCountry?.name ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
