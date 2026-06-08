import { Plus, Users, FileText } from "lucide-react";
import type { ClinicQuickAction } from "../types";

export function useClinicActions(): ClinicQuickAction[] {
  return [
    {
      id: "act-consultation",
      label: "Nueva consulta",
      icon: Plus,
      variant: "primary",
      href: "/dashboard/consultations/new",
    },
    {
      id: "act-doctors",
      label: "Gestionar doctores",
      icon: Users,
      variant: "secondary",
      href: "/dashboard/doctors",
    },
    {
      id: "act-report",
      label: "Reporte del día",
      icon: FileText,
      variant: "outline",
      href: "/dashboard/reports",
    },
  ];
}
