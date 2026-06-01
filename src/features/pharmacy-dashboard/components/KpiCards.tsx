"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { KpiCard } from "./KpiCard";
import type { PharmacyKPI } from "../types";

interface KpiCardsProps {
  kpis: PharmacyKPI[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </motion.div>
  );
}
