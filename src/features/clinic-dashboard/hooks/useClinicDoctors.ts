import type { ClinicDoctor } from "../types";

export function useClinicDoctors(): ClinicDoctor[] {
  return [
    {
      id: "doc-1",
      name: "Dr. Ricardo García",
      specialty: "Medicina General",
      patientsSeen: 5,
      status: "busy",
    },
    {
      id: "doc-2",
      name: "Dra. Carmen Martínez",
      specialty: "Cardiología",
      patientsSeen: 3,
      status: "busy",
    },
    {
      id: "doc-3",
      name: "Dr. Luis Rodríguez",
      specialty: "Dermatología",
      patientsSeen: 2,
      status: "available",
    },
    {
      id: "doc-4",
      name: "Dra. Sofía Hernández",
      specialty: "Pediatría",
      patientsSeen: 4,
      status: "busy",
    },
  ];
}
