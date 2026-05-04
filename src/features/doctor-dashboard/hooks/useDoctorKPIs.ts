"use client";

import type { KPIData } from "../types";

const MOCK_KPIS: KPIData[] = [
  {
    label: "Pacientes hoy",
    value: 12,
    trend: 3,
    subtitle: "vs. ayer",
  },
  {
    label: "Recetas emitidas",
    value: 8,
    trend: -1,
    subtitle: "promedio semanal",
  },
  {
    label: "Citas pendientes",
    value: 5,
    trend: 0,
    subtitle: "próximas 2 horas",
  },
];

export function useDoctorKPIs(): KPIData[] {
  return MOCK_KPIS;
}
