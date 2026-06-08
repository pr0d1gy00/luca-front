"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { usePharmacyQuickActions } from "../hooks/usePharmacyQuickActions";
import { QuickActionButton } from "./QuickActionButton";

export function QuickActions() {
  const actions = usePharmacyQuickActions();

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900">Acciones Rápidas</h3>

      <motion.div
        variants={staggerChildrenVariant}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {actions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </motion.div>
    </motion.div>
  );
}
