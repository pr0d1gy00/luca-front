"use client";

import type { Consultation } from "../types";
import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientConsultations(): Consultation[] {
  const { data } = usePatientDashboardQuery();

  if (!data?.consultations_history) {
    return [];
  }

  return data.consultations_history.map((c, idx) => ({
    id: `cns-${idx}`,
    date: c.date,
    time: c.time,
    type: c.title,
    reason: c.reason,
    diagnosis: c.diagnosis,
  }));
}
