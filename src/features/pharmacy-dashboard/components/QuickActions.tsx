"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Plus, Package, MessageSquare } from "lucide-react";
import { QuickActionButton } from "./QuickActionButton";
import type { PharmacyQuickAction } from "../types";

const PHARMACY_ACTIONS: PharmacyQuickAction[] = [
  {
    id: "pa-1",
    label: "Nueva Orden",
    icon: Plus,
    href: "/pharmacy/orders/new",
    variant: "primary",
  },
  {
    id: "pa-2",
    label: "Ver Inventario",
    icon: Package,
    href: "/pharmacy/inventory",
    variant: "secondary",
  },
  {
    id: "pa-3",
    label: "Mensajes",
    icon: MessageSquare,
    href: "/pharmacy/messages",
    variant: "outline",
  },
];

export function QuickActions() {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900">
        Acciones Rápidas
      </h3>

      <motion.div
        variants={staggerChildrenVariant}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {PHARMACY_ACTIONS.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </motion.div>
    </motion.div>
  );
}
