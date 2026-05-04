"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "../types";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  finalizada: {
    label: "Finalizada",
    className: "bg-luca-accent/10 text-luca-accent",
  },
  "en-curso": {
    label: "En curso",
    className: "bg-luca-primary/10 text-luca-primary",
  },
  "en-espera": {
    label: "En espera",
    className: "bg-slate-100 text-luca-muted",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent px-2 py-0.5 rounded-full text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}
