"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { PharmacyQuickAction } from "../types";
import Link from "next/link";

interface QuickActionButtonProps {
  action: PharmacyQuickAction;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover",
  secondary:
    "bg-luca-primary/10 text-luca-primary hover:bg-luca-primary/20",
  outline:
    "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
};

export function QuickActionButton({ action }: QuickActionButtonProps) {
  const { label, icon: Icon, href, count, variant = "primary" } = action;

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        href={href}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl shadow-sm transition-all font-semibold",
          variantStyles[variant] ?? variantStyles.primary,
        )}
      >
        <Icon className="w-6 h-6" />
        <span className="text-sm text-center">{label}</span>

        {count !== undefined && count > 0 && (
          <span className="absolute -top-2 -right-2 bg-luca-accent text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
