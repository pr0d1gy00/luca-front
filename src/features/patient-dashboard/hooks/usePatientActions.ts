import { CalendarPlus, Pill, MessageSquare } from "lucide-react";
import type { QuickAction } from "../types";

export function usePatientActions(): QuickAction[] {
  return [
    {
      id: "act-new-appointment",
      label: "Agendar cita",
      icon: CalendarPlus,
      variant: "primary",
      href: "/dashboard/citas",
    },
    {
      id: "act-refill",
      label: "Pedir receta",
      icon: Pill,
      variant: "secondary",
      href: "/dashboard/recetas",
    },
    {
      id: "act-message",
      label: "Contactar médico",
      icon: MessageSquare,
      variant: "outline",
      href: "/dashboard/mensajes",
    },
  ];
}
