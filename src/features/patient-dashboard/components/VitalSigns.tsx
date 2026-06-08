"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import type { VitalSign } from "../types";

interface VitalSignsProps {
  vitals: VitalSign[];
}

export function VitalSigns({ vitals }: VitalSignsProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">Signos Vitales</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vitals.map((vital) => (
          <VitalSignCard key={vital.id} vital={vital} />
        ))}
      </div>
    </motion.div>
  );
}

function VitalSignCard({ vital }: { vital: VitalSign }) {
  const { name, value, unit, time, status, icon: Icon } = vital;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            status === "stable"
              ? "bg-pharmako-care-light text-pharmako-care"
              : "bg-amber-50 text-amber-600",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {name}
          </h3>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
        <span
          className={cn(
            "text-xs font-semibold rounded-full px-2 py-0.5",
            status === "stable"
              ? "bg-pharmako-care-light text-pharmako-care"
              : "bg-amber-50 text-amber-600",
          )}
        >
          {status === "stable" ? "Normal" : "Alerta"}
        </span>
      </div>

      <div className="flex items-baseline mt-4">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="ml-2 text-lg text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
