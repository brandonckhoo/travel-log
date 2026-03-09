"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Edit2, Trash2 } from "lucide-react";
import { TripTypeBadge } from "@/components/ui/Badge";
import { formatDateRange } from "@/lib/utils";
import type { City } from "@/types";

interface CityCardProps {
  city: City;
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
}

export default function CityCard({ city, onEdit, onDelete }: CityCardProps) {
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
      <div className="relative h-40 bg-surface-subtle">
        {city.photo_url ? (
          <Image
            src={city.photo_url}
            alt={city.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-ink-3" />
          </div>
        )}
        {/* Trip type badge overlay */}
        <div className="absolute top-3 left-3">
          <TripTypeBadge type={city.trip_type} />
        </div>
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(city)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-ink-2 hover:text-ink transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(city)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-ink-2 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-ink text-sm">{city.name}</h3>
        <p className="text-xs text-ink-2">{city.country_name}</p>
        <p className="text-xs text-ink-3">
          {formatDateRange(city.visit_date_start, city.visit_date_end)}
        </p>
      </div>
    </motion.div>
  );
}
