"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
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
  const trendColor = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-red-500"
      : "text-slate-400";

  return (
    <motion.div
      variants={fadeUpVariant}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-luca-muted">{label}</span>
        <Icon className="w-5 h-5 text-luca-primary/60" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-luca-primary">{value}</span>
        <span className={cn("text-sm font-semibold", trendColor)}>
          {trendSign}
          {trend}
        </span>
      </div>
      <span className="text-xs text-luca-muted">{subtitle}</span>
    </motion.div>
  );
}
