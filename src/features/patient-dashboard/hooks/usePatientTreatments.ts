"use client";

import type { Treatment } from "../types";
import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientTreatments(): Treatment[] {
  const { data } = usePatientDashboardQuery();

  if (!data?.active_treatments) {
    return [];
  }

  return data.active_treatments.map((t, idx) => ({
    id: `trt-${idx}`,
    medication: t.name,
    dosage: t.instructions,
    frequency: t.instructions,
    duration: "Tratamiento",
    progress: t.progress,
    status: "active",
    nextDose: t.next_dose,
  }));
}
