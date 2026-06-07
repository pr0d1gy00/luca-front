import { Calendar, Pill, FlaskConical, ClipboardList } from "lucide-react";
import type { PatientKPI } from "../types";

export function usePatientKPIs(): PatientKPI[] {
  return [
    {
      id: "appointments",
      label: "Próximas Citas",
      value: 3,
      icon: Calendar,
      trend: "up",
      trendLabel: "+1 esta semana",
    },
    {
      id: "treatments",
      label: "Tratamientos Activos",
      value: 2,
      icon: Pill,
      trend: "stable",
      trendLabel: "Sin cambios",
    },
    {
      id: "labs",
      label: "Laboratorios Pendientes",
      value: 1,
      icon: FlaskConical,
      trend: "down",
      trendLabel: "-2 completados",
    },
    {
      id: "prescriptions",
      label: "Recetas Activas",
      value: 2,
      icon: ClipboardList,
      trend: "stable",
      trendLabel: "Vigentes",
    },
  ];
}
