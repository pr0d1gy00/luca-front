"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { Stethoscope, FlaskConical, MessageSquare } from "lucide-react";
import { QuickActionButton } from "./QuickActionButton";
import type { QuickAction } from "../types";

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-1",
    label: "Nueva Consulta",
    icon: Stethoscope,
    href: "#",
    variant: "primary",
  },
  {
    id: "qa-2",
    label: "Laboratorios",
    icon: FlaskConical,
    href: "#",
    count: 3,
    variant: "secondary",
  },
  {
    id: "qa-3",
    label: "Mensajes",
    icon: MessageSquare,
    href: "#",
    count: 5,
    variant: "outline",
  },
];

export function QuickActions() {
  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-3"
    >
      {QUICK_ACTIONS.map((action) => (
        <QuickActionButton key={action.id} action={action} />
      ))}
    </motion.div>
  );
}
