import type { Consultation } from "../../consultations/schemas";

export interface ConsultationListItem {
  id: string;
  patientName: string;
  patientDocument: string;
  date: Date;
  type: string;
  diagnosis: string;
  status: "completed" | "in-progress" | "pending";
}

export function useConsultationList(): ConsultationListItem[] {
  return [
    {
      id: "con-001",
      patientName: "María López",
      patientDocument: "V-25.432.123",
      date: new Date("2026-06-08"),
      type: "Control general",
      diagnosis: "Gripe común",
      status: "completed",
    },
    {
      id: "con-002",
      patientName: "Carlos Fuentes",
      patientDocument: "V-18.765.890",
      date: new Date("2026-06-08"),
      type: "Cardiología",
      diagnosis: "Hipertensión controlada",
      status: "in-progress",
    },
    {
      id: "con-003",
      patientName: "Ana Torres",
      patientDocument: "V-22.111.456",
      date: new Date("2026-06-08"),
      type: "Dermatología",
      diagnosis: "Dermatitis por contacto",
      status: "pending",
    },
    {
      id: "con-004",
      patientName: "Pedro Jiménez",
      patientDocument: "V-19.333.789",
      date: new Date("2026-06-07"),
      type: "Revisión general",
      diagnosis: "Migraña crónica",
      status: "completed",
    },
    {
      id: "con-005",
      patientName: "Sofía Ramírez",
      patientDocument: "V-27.888.456",
      date: new Date("2026-06-07"),
      type: "Pediatría",
      diagnosis: "Amigdalitis",
      status: "completed",
    },
    {
      id: "con-006",
      patientName: "Diego Herrera",
      patientDocument: "V-21.555.123",
      date: new Date("2026-06-06"),
      type: "Control general",
      diagnosis: "Diabetes tipo 2",
      status: "completed",
    },
  ];
}
