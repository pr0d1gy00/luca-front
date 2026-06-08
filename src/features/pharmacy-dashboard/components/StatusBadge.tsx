"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "../types";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent rounded-full text-xs font-semibold px-2 py-0.5",
        status === "pendiente" && "bg-amber-50 text-amber-700",
        status === "en-preparacion" &&
          "bg-pharmako-care-light text-pharmako-care",
        status === "listo" && "bg-emerald-50 text-emerald-600",
      )}
    >
      {status === "en-preparacion"
        ? "En preparación"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
