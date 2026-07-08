"use client";

import { useDoctorDashboardQuery } from "./useDoctorDashboardQuery";
import type { NextPatient } from "../types";

export function useDoctorNextPatient() {
  const { data, isLoading, error } = useDoctorDashboardQuery();
  return {
    nextPatient: (data?.next_patient ?? null) as NextPatient | null,
    isLoading,
    error,
  };
}
