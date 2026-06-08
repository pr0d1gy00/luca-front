"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface KpiCardProps {
  label: string;
  value: number;
  trend: number;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
}

export function KpiCard({
  label,
  value,
  trend,
  subtitle,
  icon: Icon,
}: KpiCardProps) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const trendSign = isPositive ? "+" : "";

  return (
    <motion.div
      variants={scaleInVariant}
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-5",
        "transition-all duration-200 hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          {label}
        </span>
        <Icon className="w-4 h-4 text-pharmako-care" />
      </div>
      <div className="flex items-baseline gap-2.5 mb-1">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {value.toLocaleString()}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            isPositive && "text-emerald-600",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-slate-400",
          )}
        >
          {trendSign}
          {trend}%
        </span>
      </div>
      <span className="text-xs text-slate-400">{subtitle}</span>
    </motion.div>
  );
}
