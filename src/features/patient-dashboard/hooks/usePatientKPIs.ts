"use client";

import { Calendar, Pill, FlaskConical, ClipboardList } from "lucide-react";
import type { PatientKPI } from "../types";
import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientKPIs(): PatientKPI[] {
  const { data } = usePatientDashboardQuery();

  return [
    {
      id: "appointments",
      label: "Próximas Citas",
      value: data?.kpis?.upcoming_appointments?.value ?? 0,
      icon: Calendar,
      trend: "up",
      trendLabel: data?.kpis?.upcoming_appointments?.change ?? "+1 esta semana",
    },
    {
      id: "treatments",
      label: "Tratamientos Activos",
      value: data?.kpis?.active_treatments?.value ?? 0,
      icon: Pill,
      trend: "stable",
      trendLabel: data?.kpis?.active_treatments?.change ?? "Sin cambios",
    },
    {
      id: "labs",
      label: "Laboratorios Pendientes",
      value: data?.kpis?.pending_labs?.value ?? 0,
      icon: FlaskConical,
      trend: "down",
      trendLabel: data?.kpis?.pending_labs?.change ?? "-2 completados",
    },
    {
      id: "prescriptions",
      label: "Recetas Activas",
      value: data?.kpis?.active_prescriptions?.value ?? 0,
      icon: ClipboardList,
      trend: "stable",
      trendLabel: data?.kpis?.active_prescriptions?.change ?? "Vigentes",
    },
  ];
}
