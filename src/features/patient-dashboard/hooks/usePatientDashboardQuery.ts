"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface DashboardResponse {
  patient_name: string;
  current_date: string;
  kpis: {
    upcoming_appointments: { value: number; change: string };
    active_treatments: { value: number; change: string };
    pending_labs: { value: number; change: string };
    active_prescriptions: { value: number; change: string };
  };
  next_appointment: {
    doctor_name: string;
    doctor_specialty: string;
    date: string;
    date_raw: string;
    time: string;
    type: string;
    status: string;
  } | null;
  active_treatments: Array<{
    name: string;
    instructions: string;
    progress: number;
    next_dose: string;
  }>;
  vitals: {
    blood_pressure: string;
    blood_pressure_status: string;
    heart_rate: number;
    heart_rate_status: string;
    temperature: number;
    temperature_status: string;
    oxygen_saturation: number;
    oxygen_saturation_status: string;
    measured_at: string;
  } | null;
  consultations_history: Array<{
    date: string;
    time: string;
    title: string;
    reason: string;
    diagnosis: string;
  }>;
}

export function usePatientDashboardQuery() {
  return useQuery<DashboardResponse>({
    queryKey: ["patient-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardResponse>(
        "/patients/me/dashboard",
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache stale durante 5 minutos
  });
}
