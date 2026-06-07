import type { Appointment } from "../types";

export function usePatientAppointments(): Appointment[] {
  return [
    {
      id: "apt-1",
      doctorName: "Dr. García",
      specialty: "Medicina General",
      type: "Control general",
      date: new Date("2026-06-10"),
      time: "10:30",
      location: "presencial",
      status: "confirmed",
    },
    {
      id: "apt-2",
      doctorName: "Dra. Martínez",
      specialty: "Dermatología",
      type: "Revisión",
      date: new Date("2026-06-18"),
      time: "15:00",
      location: "virtual",
      status: "confirmed",
    },
  ];
}
