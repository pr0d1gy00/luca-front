"use client";

import type { Notification } from "../types";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    patientName: "Roberto Suárez",
    type: "critical-lab",
    message:
      "Hemoglobina: 6.2 g/dL — Valor crítico. Requiere atención inmediata.",
    actionText: "Revisar ficha",
    actionHref: "#",
  },
  {
    id: "not-2",
    patientName: "Carmen Vega",
    type: "missed-appointment",
    message: "No asistió a su cita programada del día 02/05/2026 a las 10:00.",
    actionText: "Llamar ahora",
    actionHref: "#",
  },
];

export function useDoctorNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS;
}
