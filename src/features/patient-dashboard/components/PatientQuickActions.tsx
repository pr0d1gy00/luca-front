"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { usePatientActions } from "../hooks/usePatientActions";
import type { QuickAction } from "../types";

export function PatientQuickActions() {
  const actions = usePatientActions();

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3"
    >
      {actions.map((action) => (
        <QuickActionButton key={action.id} action={action} />
      ))}
    </motion.div>
  );
}

function QuickActionButton({ action }: { action: QuickAction }) {
  const { icon: Icon, label, variant, href } = action;

  return (
    <motion.a
      href={href}
      variants={staggerChildrenVariant}
      className={cn(
        "flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-sm transition-colors",
        variant === "primary" && "bg-blue-700 text-white hover:bg-blue-800",
        variant === "secondary" &&
          "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        variant === "outline" &&
          "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </motion.a>
  );
}
