import type { ClinicConsultation } from "../types";

export function useClinicConsultations(): ClinicConsultation[] {
  return [
    {
      id: "con-1",
      patientName: "María López",
      doctorName: "Dr. García",
      time: "09:00",
      type: "Control general",
      status: "completed",
    },
    {
      id: "con-2",
      patientName: "Carlos Fuentes",
      doctorName: "Dra. Martínez",
      time: "09:30",
      type: "Cardiología",
      status: "in-progress",
    },
    {
      id: "con-3",
      patientName: "Ana Torres",
      doctorName: "Dr. Rodríguez",
      time: "10:00",
      type: "Dermatología",
      status: "pending",
    },
    {
      id: "con-4",
      patientName: "Pedro Jiménez",
      doctorName: "Dr. García",
      time: "10:30",
      type: "Revisión",
      status: "pending",
    },
    {
      id: "con-5",
      patientName: "Sofía Ramírez",
      doctorName: "Dra. Hernández",
      time: "11:00",
      type: "Pediatría",
      status: "pending",
    },
    {
      id: "con-6",
      patientName: "Diego Herrera",
      doctorName: "Dra. Martínez",
      time: "11:30",
      type: "Control general",
      status: "cancelled",
    },
  ];
}
