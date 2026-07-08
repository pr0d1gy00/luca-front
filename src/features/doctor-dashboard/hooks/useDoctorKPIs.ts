"use client";

import { useDoctorDashboardQuery } from "./useDoctorDashboardQuery";
import type { KPIData } from "../types";

export function useDoctorKPIs() {
  const { data, isLoading, error } = useDoctorDashboardQuery();
  return {
    kpis: (data?.kpis ?? []) as KPIData[],
    isLoading,
    error,
  };
}
