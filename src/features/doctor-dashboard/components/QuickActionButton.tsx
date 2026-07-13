"use client";

import { motion } from "motion/react";
import { scaleInVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import type { QuickAction } from "../types";
import Link from "next/link";

interface QuickActionButtonProps {
  action: QuickAction;
  onClick?: () => void;
}

export function QuickActionButton({ action, onClick }: QuickActionButtonProps) {
  const { label, icon: Icon, href, count } = action;

  const content = (
    <>
      <div className="flex items-center justify-center size-9 rounded-lg bg-pharmako-care-light">
        <Icon className="w-4 h-4 text-pharmako-care" />
      </div>
      <span className="text-[11px] font-medium text-center leading-tight text-slate-500">
        {label}
      </span>

      {count !== undefined && count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pharmako-care-light0 text-white text-[9px] font-bold leading-none ">
          {count}
        </span>
      )}
    </>
  );

  const className = cn(
    "flex flex-col items-center gap-2 p-4 rounded-xl w-full",
    "bg-white border border-slate-200",
    "transition-all duration-200 hover:-translate-y-0.5",
    "text-slate-600 hover:text-pharmako-care",
  );

  return (
    <motion.div
      variants={scaleInVariant}
      whileTap={{ scale: 0.97 }}
      className="relative"
    >
      {onClick ? (
        <button onClick={onClick} className={className}>
          {content}
        </button>
      ) : (
        <Link href={href} className={className}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}
