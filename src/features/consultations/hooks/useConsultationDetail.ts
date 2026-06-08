import type {
  Consultation,
  Patient,
  Doctor,
  HistoryEntry,
  Medication,
} from "../schemas";

export interface ConsultationDetail {
  consultation: Consultation;
  patient: Patient;
  doctor: Doctor;
  history: HistoryEntry[];
  medications: Medication[];
}

const MOCK_DETAIL: Record<string, ConsultationDetail> = {
  "con-001": {
    consultation: {
      motivoConsulta: "Fiebre, tos y malestar general desde hace 3 días",
      examenFisico:
        "Temperatura 38.2°C, faringe eritematosa, pulmones limpios, TA 120/80",
      diagnostico: "Gripe común",
      prescriptions: [
        {
          medicationId: "Amoxicilina 500mg",
          dose: "1 cápsula",
          frequency: "Cada 8 horas",
          duration: "7 días",
        },
      ],
    },
    patient: {
      id: "pat-001",
      firstName: "María",
      lastName: "López",
      documentId: "V-25.432.123",
      birthDate: new Date("1992-03-15"),
      biologicalSex: "FEMALE",
      phone: "+58 414-123-4567",
      email: "maria.lopez@email.com",
      address: "Av. Principal, Edif. Las Flores, Piso 3",
      bloodType: "A_POSITIVE",
      allergies: ["Penicilina"],
      chronicConditions: [],
      emergencyContactName: "Carlos López",
      emergencyContactPhone: "+58 414-987-6543",
    },
    doctor: {
      name: "Dr. Ricardo García",
      specialty: "Medicina General",
      mpps: "MPPS-12345",
      cm: "CM-67890",
    },
    history: [
      {
        id: "hist-1",
        date: new Date("2026-01-10"),
        motivo: "Dolor de garganta",
        diagnostico: "Faringitis aguda",
        doctorName: "Dr. Ricardo García",
      },
      {
        id: "hist-2",
        date: new Date("2025-08-22"),
        motivo: "Control de rutina",
        diagnostico: "Sin hallazgos patológicos",
        doctorName: "Dr. Ricardo García",
      },
    ],
    medications: [
      {
        activePrinciple: "Amoxicilina",
        concentration: "500mg",
        presentation: "CAPSULA",
        administrationRoute: "ORAL",
        commercialName: "Amoxil",
      },
    ],
  },
};

export function useConsultationDetail(
  id: string | null,
): ConsultationDetail | null {
  if (!id) return null;
  return MOCK_DETAIL[id] ?? null;
}
