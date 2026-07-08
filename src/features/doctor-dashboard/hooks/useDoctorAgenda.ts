"use client";

import { useDoctorDashboardQuery } from "./useDoctorDashboardQuery";
import type { Appointment, AppointmentStatus } from "../types";

function mapStatus(status: string): AppointmentStatus {
  const norm = status.toLowerCase().replace("_", "-");
  if (norm === "completed" || norm === "finalizada") return "finalizada";
  if (norm === "in-progress" || norm === "in_room" || norm === "en-curso" || norm === "in-room") return "en-curso";
  return "en-espera";
}

export function useDoctorAgenda() {
  const { data, isLoading, error } = useDoctorDashboardQuery();

  const appointments: Appointment[] = (data?.agenda ?? []).map((apt: any) => ({
    id: apt.id,
    patientName: apt.patientName,
    type: apt.type,
    time: apt.time,
    status: mapStatus(apt.status),
  }));

  return {
    appointments,
    isLoading,
    error,
  };
}
