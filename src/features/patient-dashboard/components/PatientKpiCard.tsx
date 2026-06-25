"use client";

import { cn } from "@/lib/utils";
import type { PatientKPI } from "../types";

interface PatientKpiCardProps {
  kpi: PatientKPI;
}

export function PatientKpiCard({ kpi }: PatientKpiCardProps) {
  const { icon: Icon, label, value, unit, trend, trendLabel } = kpi;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 p-5",
        "hover:bg-slate-50 transition-colors",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl p-3">
          <Icon className="w-5 h-5 text-pharmako-care" />
        </div>
        {trend && trendLabel && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5",
              trend === "up" && "bg-emerald-50 text-emerald-600",
              trend === "down" && "bg-amber-50 text-amber-600",
              trend === "stable" && "bg-slate-50 text-slate-500",
            )}
          >
            {trendLabel}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">
          {value}
          {unit && (
            <span className="text-lg font-normal text-slate-400 ml-1">
              {unit}
            </span>
          )}
        </p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
