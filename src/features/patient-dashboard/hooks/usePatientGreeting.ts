"use client";

import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientGreeting() {
  const { data } = usePatientDashboardQuery();

  return {
    name: data?.patient_name ?? "Paciente",
    date:
      data?.current_date ??
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  };
}
