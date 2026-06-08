import type { PrescriptionDetail } from "../types";

const MOCK_PRESCRIPTIONS: Record<string, PrescriptionDetail> = {
  "ord-1": {
    id: "ord-1",
    patientName: "María López",
    patientDocument: "V-25.432.123",
    patientAge: 34,
    doctorName: "Dr. Ricardo García",
    doctorSpecialty: "Medicina General",
    date: new Date("2026-06-08"),
    medications: [
      {
        name: "Amoxicilina 500mg",
        dosage: "1 cápsula",
        frequency: "Cada 8 horas",
        duration: "7 días",
        quantity: 21,
      },
      {
        name: "Ibuprofeno 400mg",
        dosage: "1 comprimido",
        frequency: "Cada 12 horas",
        duration: "5 días",
        quantity: 10,
      },
    ],
    publicToken: "RX-A1B2C3D4",
  },
  "ord-2": {
    id: "ord-2",
    patientName: "Carlos Pérez",
    patientDocument: "V-18.765.890",
    patientAge: 45,
    doctorName: "Dra. Carmen Vega",
    doctorSpecialty: "Cardiología",
    date: new Date("2026-06-07"),
    medications: [
      {
        name: "Enalapril 10mg",
        dosage: "1 comprimido",
        frequency: "Cada 24 horas",
        duration: "30 días",
        quantity: 30,
      },
    ],
    publicToken: "RX-E5F6G7H8",
  },
  "ord-3": {
    id: "ord-3",
    patientName: "Ana Rodríguez",
    patientDocument: "V-22.111.456",
    patientAge: 28,
    doctorName: "Dr. Ricardo García",
    doctorSpecialty: "Medicina General",
    date: new Date("2026-06-08"),
    medications: [
      {
        name: "Lorazepam 1mg",
        dosage: "1 comprimido",
        frequency: "Cada 24 horas",
        duration: "15 días",
        quantity: 15,
      },
      {
        name: "Omeprazol 20mg",
        dosage: "1 cápsula",
        frequency: "Cada 24 horas",
        duration: "30 días",
        quantity: 30,
      },
    ],
    publicToken: "RX-I9J0K1L2",
  },
};

export function usePharmacyPrescription(
  orderId: string | null,
): PrescriptionDetail | null {
  if (!orderId) return null;
  return MOCK_PRESCRIPTIONS[orderId] ?? null;
}
