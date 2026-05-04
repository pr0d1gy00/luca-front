"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuickAction } from "../types";
import Link from "next/link";

interface QuickActionButtonProps {
  action: QuickAction;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover",
  secondary:
    "bg-luca-surface-light text-luca-primary hover:bg-luca-surface-dark",
  outline:
    "bg-white text-luca-primary border border-slate-200 hover:bg-slate-50",
};

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
          "relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl shadow-sm transition-all font-semibold",
          variantStyles[variant] ?? variantStyles.primary,
        )}
      >
        <Icon className="w-6 h-6" />
        <span className="text-sm text-center">{label}</span>

        {count !== undefined && count > 0 && (
          <Badge
            variant="outline"
            className="absolute -top-2 -right-2 bg-luca-accent text-white border-transparent text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1.5"
          >
            {count}
          </Badge>
        )}
      </Link>
    </motion.div>
  );
}
