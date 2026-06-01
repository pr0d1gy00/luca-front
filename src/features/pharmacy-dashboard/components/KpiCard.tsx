"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { PharmacyKPI } from "../types";

interface KpiCardProps {
  kpi: PharmacyKPI;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const { label, value, trend, trendDirection, subtitle, icon: Icon } = kpi;

  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isGood =
    (isPositive && trendDirection === "higher-is-better") ||
    (isNegative && trendDirection === "lower-is-better");

  const trendColor = isGood ? "text-emerald-600" : "text-amber-500";
  const trendArrow = isPositive ? "↑" : isNegative ? "↓" : "→";

  return (
    <motion.div
      variants={fadeUpVariant}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-luca-muted">{label}</span>
        <div className="bg-luca-primary/10 rounded-xl p-3">
          <Icon className="w-5 h-5 text-luca-primary" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-luca-primary">{value}</span>
        {trend !== 0 && (
          <span className={cn("text-sm font-semibold", trendColor)}>
            {trendArrow}{" "}
            {trend > 0
              ? `+${trend}`
              : trend}
          </span>
        )}
      </div>

      <span className="text-xs text-luca-muted">{subtitle}</span>
    </motion.div>
  );
}
