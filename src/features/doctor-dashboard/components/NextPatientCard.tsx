"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Pill,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import type { NextPatient } from "../types";
import Link from "next/link";

const ALERT_ICONS = {
  allergy: AlertTriangle,
  chronic: Stethoscope,
  "critical-lab": AlertCircle,
  "last-visit": Clock,
};

const ALERT_COLORS = {
  allergy: "text-amber-600 bg-amber-50 border-amber-200",
  chronic: "text-pharmako-care bg-pharmako-care-light border-blue-200",
  "critical-lab": "text-rose-600 bg-rose-50 border-rose-200",
  "last-visit": "text-slate-500 bg-slate-50 border-slate-200",
};

interface NextPatientCardProps {
  patient: NextPatient;
}

export function NextPatientCard({ patient }: NextPatientCardProps) {
  return (
    <motion.div
      variants={scaleInVariant}
      className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-xl overflow-hidden"
    >
      <Link
        href="#"
        className="block p-5 hover:bg-slate-50/50 transition-colors group"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-pharmako-care uppercase tracking-wide">
            Próximo Paciente
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>

        {/* Name + time */}
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
          <span className="text-sm font-semibold text-slate-500 tabular-nums">
            {patient.time}
          </span>
        </div>

        {/* Type + reason */}
        <p className="text-sm text-slate-500 mb-3">
          {patient.type}
          {patient.reason && (
            <span className="text-slate-400"> — {patient.reason}</span>
          )}
        </p>

        {/* Alerts */}
        {patient.alerts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {patient.alerts.map((alert) => {
              const AlertIcon = ALERT_ICONS[alert.type];
              const colorClass = ALERT_COLORS[alert.type];
              return (
                <span
                  key={alert.label}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                    colorClass,
                  )}
                >
                  <AlertIcon className="w-3 h-3" />
                  {alert.label}
                </span>
              );
            })}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
