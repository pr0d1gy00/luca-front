"use client";

import { useAuthStore } from "@/store/auth";
import { PatientAppointmentsView } from "@/features/appointments/components/PatientAppointmentsView";
import { DoctorAppointmentsView } from "@/features/appointments/components/DoctorAppointmentsView";

export default function AppointmentsPage() {
  const { role } = useAuthStore();

  if (role === "doctor") {
    return <DoctorAppointmentsView />;
  }

  return <PatientAppointmentsView />;
}
