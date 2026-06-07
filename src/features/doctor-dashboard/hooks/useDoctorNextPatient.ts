"use client";

import type { NextPatient } from "../types";

const MOCK_NEXT_PATIENT: NextPatient = {
  name: "Ana Martínez",
  time: "11:00",
  type: "Presencial",
  reason: "Control rutinario — hipertensión",
  alerts: [
    { type: "allergy", label: "Alergia: Penicilina" },
    { type: "chronic", label: "Diabetes tipo 2" },
    { type: "critical-lab", label: "Pendiente: HbA1c" },
    { type: "last-visit", label: "Última visita: 12/05" },
  ],
};

export function useDoctorNextPatient(): NextPatient {
  return MOCK_NEXT_PATIENT;
}
