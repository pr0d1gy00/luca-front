import type { Consultation } from "../types";

export function usePatientConsultations(): Consultation[] {
  return [
    {
      id: "con-1",
      date: "Oct. 12, 2024",
      time: "14:30 - 15:00",
      type: "Consulta General",
      reason: "Resfriado común",
      diagnosis: "Gripe común",
    },
    {
      id: "con-2",
      date: "Oct. 15, 2024",
      time: "09:00 - 09:30",
      type: "Revisión General",
      reason: "Dolor de cabeza",
      diagnosis: "Migraña",
    },
    {
      id: "con-3",
      date: "Nov. 02, 2024",
      time: "11:15 - 11:45",
      type: "Dermatología",
      reason: "Alergia cutánea",
      diagnosis: "Dermatitis por contacto",
    },
  ];
}
