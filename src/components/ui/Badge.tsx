import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import type { TripType } from "@/types";
import { TRIP_TYPE_COLORS } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export function TripTypeBadge({ type }: { type: TripType }) {
  const { bg, text, label } = TRIP_TYPE_COLORS[type];
  return (
    <Badge className={cn(bg, text)}>
      {type === "Couple" && <Heart className="w-2.5 h-2.5 fill-current" />}
      {label}
    </Badge>
  );
}

export function WithWifeBadge() {
  return (
    <Badge className="bg-rose-100 text-rose-600">
      <Heart className="w-2.5 h-2.5 fill-current" />
      With Wife
    </Badge>
  );
}

export function RegionBadge({ region }: { region: string }) {
  const colorMap: Record<string, string> = {
    Asia: "bg-orange-100 text-orange-700",
    Europe: "bg-blue-100 text-blue-700",
    Americas: "bg-green-100 text-green-700",
    Africa: "bg-yellow-100 text-yellow-700",
    Oceania: "bg-purple-100 text-purple-700",
    "Middle East": "bg-red-100 text-red-700",
  };
  return (
    <Badge className={colorMap[region] ?? "bg-gray-100 text-gray-700"}>
      {region}
    </Badge>
  );
}
