"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { Users, FileText, Clock } from "lucide-react";
import type { ComponentType } from "react";
import { KpiCard } from "./KpiCard";
import type { KPIData } from "../types";

const KPI_ICONS: ComponentType<{ className?: string }>[] = [
  Users,
  FileText,
  Clock,
];

interface KpiCardsProps {
  kpis: KPIData[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {kpis.map((kpi, i) => (
        <KpiCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          trend={kpi.trend}
          subtitle={kpi.subtitle}
          icon={KPI_ICONS[i] ?? Users}
        />
      ))}
    </motion.div>
  );
}
