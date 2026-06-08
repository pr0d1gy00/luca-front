"use client";

import { motion } from "motion/react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import { useClinicConsultations } from "../hooks/useClinicConsultations";
import type { ClinicConsultation } from "../types";

export function TodayAgenda() {
  const consultations = useClinicConsultations();
  const isEmpty = consultations.length === 0;

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <div className="bg-pharmako-care-light rounded-lg p-1.5">
          <Calendar className="w-4 h-4 text-pharmako-care" />
        </div>
        Consultas de hoy
      </h3>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <Calendar className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            No hay consultas programadas para hoy
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {consultations.map((c) => (
            <AgendaRow key={c.id} consultation={c} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Atendido", className: "bg-emerald-50 text-emerald-600" },
  "in-progress": {
    label: "En curso",
    className: "bg-pharmako-care-light text-pharmako-care",
  },
  pending: { label: "Pendiente", className: "bg-amber-50 text-amber-600" },
  cancelled: { label: "Cancelado", className: "bg-slate-50 text-slate-500" },
};

function AgendaRow({ consultation }: { consultation: ClinicConsultation }) {
  const { patientName, doctorName, time, type, status } = consultation;
  const sc = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {patientName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{doctorName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500">{type}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
            sc.className,
          )}
        >
          {sc.label}
        </span>
      </div>
    </div>
  );
}
