"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { usePatientKPIs } from "../hooks/usePatientKPIs";
import { PatientKpiCard } from "./PatientKpiCard";

export function PatientKpiCards() {
  const kpis = usePatientKPIs();

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.id} variants={staggerChildrenVariant}>
          <PatientKpiCard kpi={kpi} />
        </motion.div>
      ))}
    </motion.div>
  );
}
