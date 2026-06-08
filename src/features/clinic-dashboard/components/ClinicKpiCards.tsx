"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { useClinicKPIs } from "../hooks/useClinicKPIs";
import { ClinicKpiCard } from "./ClinicKpiCard";

export function ClinicKpiCards() {
  const kpis = useClinicKPIs();

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.id} variants={staggerChildrenVariant}>
          <ClinicKpiCard kpi={kpi} />
        </motion.div>
      ))}
    </motion.div>
  );
}
