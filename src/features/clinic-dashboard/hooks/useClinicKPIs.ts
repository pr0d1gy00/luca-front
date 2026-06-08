import { Stethoscope, Users, UserCheck, ClipboardList } from "lucide-react";
import type { ClinicKPI } from "../types";

export function useClinicKPIs(): ClinicKPI[] {
  return [
    {
      id: "consultations",
      label: "Consultas hoy",
      value: 12,
      icon: Stethoscope,
      trend: "up",
      trendLabel: "+3 vs ayer",
    },
    {
      id: "doctors",
      label: "Doctores activos",
      value: 4,
      icon: Users,
      trend: "stable",
      trendLabel: "Todos presentes",
    },
    {
      id: "patients",
      label: "Pacientes atendidos",
      value: 28,
      icon: UserCheck,
      trend: "up",
      trendLabel: "+5 esta semana",
    },
    {
      id: "prescriptions",
      label: "Recetas emitidas",
      value: 9,
      icon: ClipboardList,
      trend: "stable",
      trendLabel: "Hoy",
    },
  ];
}
