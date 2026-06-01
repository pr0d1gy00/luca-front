"use client";

import { Container } from "@/components/ui/Container";
import { ActiveConsultationView } from "@/features/consultations/components/ActiveConsultationView";
import type { Patient, Doctor, Medication, HistoryEntry, Vitals } from "@/features/consultations/schemas";

// Mock Doctor
const MOCK_DOCTOR: Doctor = {
  name: "Dr. Julián Rodríguez",
  specialty: "Medicina General",
  mpps: "12345-V",
  cm: "67890-CMP",
};

// Mock Patient
const MOCK_PATIENT: Patient = {
  id: "p-001",
  firstName: "María Elena",
  lastName: "González",
  documentId: "28.456.789",
  birthDate: new Date("1985-03-15"),
  biologicalSex: "FEMALE" as const,
  phone: "+54 11 4567-8901",
  email: "maria.gonzalez@mail.com",
  address: "Av. Santa Fe 2345, Buenos Aires",
  bloodType: "O_POSITIVE",
  allergies: ["Penicilina", "Mariscos"],
  chronicConditions: ["Hipertensión arterial"],
  emergencyContactName: "Carlos González",
  emergencyContactPhone: "+54 11 9876-5432",
};

// Mock Vitals
const MOCK_VITALS: Vitals = {
  weight: "68 kg",
  bloodPressure: "130/85 mmHg",
  heartRate: "78 bpm",
  temperature: "36.5 °C",
};

// Mock Medications (catalog for the form selector)
const MOCK_MEDICATIONS: Medication[] = [
  { commercialName: "Amoxil", activePrinciple: "Amoxicilina", concentration: "500mg", presentation: "CAPSULA", administrationRoute: "ORAL" },
  { commercialName: "Ibuprofeno MK", activePrinciple: "Ibuprofeno", concentration: "400mg", presentation: "TABLETA", administrationRoute: "ORAL" },
  { commercialName: "Paracetamol Labs", activePrinciple: "Paracetamol", concentration: "500mg/ml", presentation: "JARABE", administrationRoute: "ORAL" },
  { commercialName: "Koldex Colirio", activePrinciple: "Cloranfenicol", concentration: "0.5%", presentation: "GOTAS", administrationRoute: "OFTALMICA" },
  { commercialName: "Diprogenta", activePrinciple: "Betametasona", concentration: "0.05%", presentation: "CREMA", administrationRoute: "TOPICA" },
  { commercialName: "Omeprazol Gador", activePrinciple: "Omeprazol", concentration: "20mg", presentation: "CAPSULA", administrationRoute: "ORAL" },
  { commercialName: "Glucophage", activePrinciple: "Metformina", concentration: "850mg", presentation: "TABLETA", administrationRoute: "ORAL" },
  { commercialName: "Cozaar", activePrinciple: "Losartán", concentration: "50mg", presentation: "TABLETA", administrationRoute: "ORAL" },
];

// Mock History Entries
const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "h-001",
    date: new Date("2025-11-15"),
    motivo: "Dolor de cabeza recurrente",
    diagnostico: "Cefalea tensional",
    doctorName: "Dr. Pedro Sánchez",
  },
  {
    id: "h-002",
    date: new Date("2025-08-20"),
    motivo: "Control de presión arterial",
    diagnostico: "Hipertensión arterial controlada",
    doctorName: "Dr. Julián Rodríguez",
  },
  {
    id: "h-003",
    date: new Date("2025-05-10"),
    motivo: "Infección respiratoria alta",
    diagnostico: "Faringitis aguda",
    doctorName: "Dra. Carolina Mehta",
  },
];

export default function DoctorConsultationsPage() {
  return (
    <Container variant="fluid" className="flex flex-col gap-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-luca-muted-dark">
          Consulta Activa
        </h1>
        <p className="text-sm text-luca-muted">
          Espacio de trabajo clínico en tiempo real
        </p>
      </div>

      <ActiveConsultationView
        patient={MOCK_PATIENT}
        vitals={MOCK_VITALS}
        historyEntries={MOCK_HISTORY}
        doctor={MOCK_DOCTOR}
        medications={MOCK_MEDICATIONS}
      />
    </Container>
  );
}