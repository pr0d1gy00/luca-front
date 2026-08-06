"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { PharmacyKPI } from "../types";
import { Package, CheckCircle, Clock, AlertTriangle, HelpCircle } from "lucide-react";

interface KpiCardProps {
  kpi: PharmacyKPI;
}

const iconMap: Record<string, React.ElementType> = {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
};

export function KpiCard({ kpi }: KpiCardProps) {
  const { label, value, trend, trendDirection, subtitle, icon } = kpi;
  const Icon = typeof icon === "string" ? (iconMap[icon] || HelpCircle) : icon;
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const trendArrow = isPositive ? "↑" : isNegative ? "↓" : "→";

  return (
    <motion.div
      variants={fadeUpVariant}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="bg-pharmako-care-light rounded-xl p-3">
          <Icon className="w-5 h-5 text-pharmako-care" />
        </div>
        {trend !== 0 && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5",
              trendDirection === "up" && "bg-emerald-50 text-emerald-600",
              trendDirection === "down" && "bg-amber-50 text-amber-600",
              trendDirection === "stable" && "bg-slate-50 text-slate-500",
            )}
          >
            {trendArrow} {trend > 0 ? `+${trend}` : trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>

      <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
    </motion.div>
  );
}
