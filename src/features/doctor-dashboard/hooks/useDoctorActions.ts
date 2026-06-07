"use client";

import { useState } from "react";
import type { ActionItem } from "../types";

const MOCK_ACTIONS: ActionItem[] = [
  {
    id: "act-1",
    label: "Revisar resultado crítico de laboratorio",
    type: "lab",
    patientName: "Roberto Suárez",
    completed: false,
  },
  {
    id: "act-2",
    label: "Llamar a paciente que no asistió",
    type: "call",
    patientName: "Carmen Vega",
    completed: false,
  },
  {
    id: "act-3",
    label: "Firmar recetas pendientes",
    type: "prescription",
    patientName: "—",
    completed: false,
  },
  {
    id: "act-4",
    label: "Agendar seguimiento con cardiología",
    type: "follow-up",
    patientName: "Pedro Rodríguez",
    completed: false,
  },
];

export function useDoctorActions() {
  const [actions, setActions] = useState<ActionItem[]>(MOCK_ACTIONS);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    );
  };

  const pendingCount = actions.filter((a) => !a.completed).length;

  return { actions, toggleAction, pendingCount };
}
