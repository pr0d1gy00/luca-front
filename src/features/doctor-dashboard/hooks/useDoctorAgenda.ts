"use client";

import type { Appointment } from "../types";

const MOCK_AGENDA: Appointment[] = [
  {
    id: "apt-1",
    patientName: "María García",
    type: "Presencial",
    time: "09:30",
    status: "finalizada",
  },
  {
    id: "apt-2",
    patientName: "Carlos López",
    type: "Virtual",
    time: "10:15",
    status: "en-curso",
  },
  {
    id: "apt-3",
    patientName: "Ana Martínez",
    type: "Presencial",
    time: "11:00",
    status: "en-espera",
  },
  {
    id: "apt-4",
    patientName: "Pedro Rodríguez",
    type: "Presencial",
    time: "11:45",
    status: "en-espera",
  },
  {
    id: "apt-5",
    patientName: "Sofía Hernández",
    type: "Virtual",
    time: "14:00",
    status: "en-espera",
  },
  {
    id: "apt-6",
    patientName: "Diego Fernández",
    type: "Presencial",
    time: "15:30",
    status: "en-espera",
  },
  {
    id: "apt-7",
    patientName: "Valentina Torres",
    type: "Virtual",
    time: "16:45",
    status: "en-espera",
  },
];

export function useDoctorAgenda(): Appointment[] {
  return MOCK_AGENDA;
}
