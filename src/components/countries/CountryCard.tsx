"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Edit2, Trash2 } from "lucide-react";
import { RegionBadge, WithWifeBadge } from "@/components/ui/Badge";
import type { Country } from "@/types";

interface CountryCardProps {
  country: Country;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export default function CountryCard({ country, onEdit, onDelete }: CountryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group"
    >
      {/* Photo */}
      <div className="relative h-32 bg-surface-subtle">
        {country.photo_url ? (
          <Image
            src={country.photo_url}
            alt={country.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 280px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-ink-3" />
          </div>
        )}
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(country)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-ink-2 hover:text-ink transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(country)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-ink-2 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink text-sm leading-tight">{country.name}</h3>
          <div className="flex flex-wrap gap-1 shrink-0">
            <RegionBadge region={country.region} />
            {country.with_wife && <WithWifeBadge />}
          </div>
        </div>
        <p className="text-xs text-ink-3">
          {country.cities_count ?? 0} cities · {country.visits_count ?? 0} visits
        </p>
      </div>
    </motion.div>
  );
}
