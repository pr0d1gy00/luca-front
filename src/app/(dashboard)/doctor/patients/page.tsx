"use client";

import { Container } from "@/components/ui/Container";
import { PatientCrudLayout } from "@/features/patients/components/PatientCrudLayout";

const MOCK_PATIENTS = [
  {
    firstName: "María Elena",
    lastName: "González",
    documentId: "28.456.789",
    birthDate: new Date("1985-03-15"),
    biologicalSex: "FEMALE" as const,
    phone: "+54 11 4567-8901",
    email: "maria.gonzalez@mail.com",
    address: "Av. Santa Fe 2345, Buenos Aires",
    bloodType: "O_POSITIVE" as const,
    allergies: ["Penicilina", "Mariscos"],
    chronicConditions: ["Hipertensión"],
    emergencyContactName: "Carlos González",
    emergencyContactPhone: "+54 11 9876-5432",
  },
  {
    firstName: "Juan Roberto",
    lastName: "Rodríguez",
    documentId: "12.345.678",
    birthDate: new Date("1972-08-22"),
    biologicalSex: "MALE" as const,
    phone: "+54 11 2345-6789",
    email: "juan.rodriguez@mail.com",
    address: "Calle Corrientes 1234, Buenos Aires",
    bloodType: "A_NEGATIVE" as const,
    allergies: [],
    chronicConditions: ["Diabetes Tipo 2", "Colesterol alto"],
    emergencyContactName: "Ana Rodríguez",
    emergencyContactPhone: "+54 11 5555-1234",
  },
  {
    firstName: "Sofía Martina",
    lastName: "López",
    documentId: "45.678.901",
    birthDate: new Date("1998-11-30"),
    biologicalSex: "FEMALE" as const,
    phone: "+54 11 7890-1234",
    email: "sofia.lopez@mail.com",
    address: "Av. Rivadavia 5678, Buenos Aires",
    bloodType: "B_POSITIVE" as const,
    allergies: ["Latex"],
    chronicConditions: [],
    emergencyContactName: "Pedro López",
    emergencyContactPhone: "+54 11 4444-5678",
  },
];

export default function DoctorPatientsPage() {
  return (
    <Container variant="fluid" className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-luca-muted-dark">
          Pacientes
        </h1>
        <p className="text-sm text-luca-muted">
          Gestión de pacientes del médico
        </p>
      </div>

      <PatientCrudLayout patients={MOCK_PATIENTS} />
    </Container>
  );
}