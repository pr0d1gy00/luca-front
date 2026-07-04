"use client";

import type { Appointment } from "../types";
import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientAppointments(): Appointment[] {
  const { data } = usePatientDashboardQuery();

  if (!data?.next_appointment) {
    return [];
  }

  const nextAppt = data.next_appointment;

  return [
    {
      id: "next-appt",
      doctorName: nextAppt.doctor_name,
      specialty: nextAppt.doctor_specialty,
      type: "Cita médica",
      date: new Date(nextAppt.date_raw),
      time: nextAppt.time,
      location: nextAppt.type === "Telemedicina" ? "virtual" : "presencial",
      status: nextAppt.status === "Confirmada" ? "confirmed" : "pending",
    },
  ];
}
