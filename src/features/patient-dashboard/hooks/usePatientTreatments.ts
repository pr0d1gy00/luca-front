import type { Treatment } from "../types";

export function usePatientTreatments(): Treatment[] {
  return [
    {
      id: "trt-1",
      medication: "Amoxicilina 500mg",
      dosage: "1 cápsula cada 8 horas",
      frequency: "Cada 8 horas",
      duration: "7 días",
      progress: 71, // 5/7
      status: "active",
      nextDose: "20:00",
    },
    {
      id: "trt-2",
      medication: "Ibuprofeno 400mg",
      dosage: "1 comprimido cada 12 horas",
      frequency: "Cada 12 horas",
      duration: "5 días",
      progress: 40, // 2/5
      status: "active",
      nextDose: "22:00",
    },
  ];
}
