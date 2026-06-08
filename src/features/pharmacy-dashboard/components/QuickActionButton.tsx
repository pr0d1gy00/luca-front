"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { PharmacyQuickAction } from "../types";
import Link from "next/link";

interface QuickActionButtonProps {
  action: PharmacyQuickAction;
}

export function QuickActionButton({ action }: QuickActionButtonProps) {
  const { label, icon: Icon, href, count, variant = "primary" } = action;

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        href={href}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl transition-all font-semibold text-sm",
          variant === "primary" && "bg-blue-700 text-white hover:bg-blue-800",
          variant === "secondary" &&
            "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
          variant === "outline" &&
            "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="text-center">{label}</span>

        {count !== undefined && count > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
