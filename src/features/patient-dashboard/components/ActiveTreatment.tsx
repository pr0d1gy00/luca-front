"use client";

import { motion } from "motion/react";
import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import type { Treatment } from "../types";

interface ActiveTreatmentProps {
  treatments: Treatment[];
}

export function ActiveTreatment({ treatments }: ActiveTreatmentProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Tratamientos Activos
        </h2>
        <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
          Ver historial completo
        </button>
      </div>

      {treatments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <Pill className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            No tenés tratamientos activos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const { medication, dosage, frequency, duration, progress, nextDose } =
    treatment;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-teal-50 rounded-xl p-3">
          <Pill className="w-5 h-5 text-teal-600" />
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
          Activo
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{medication}</h3>
      <p className="text-sm text-slate-600 mb-0.5">{dosage}</p>
      <p className="text-sm text-slate-500">{frequency}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Progreso</span>
          <span className="text-slate-700 font-medium">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progress >= 75
                ? "bg-emerald-500"
                : progress >= 40
                  ? "bg-teal-500"
                  : "bg-amber-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Próxima dosis</p>
          <p className="text-sm font-semibold text-slate-900">{nextDose}</p>
        </div>
      </div>
    </div>
  );
}
