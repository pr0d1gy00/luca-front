"use client";

import type { PharmacyNotification } from "../types";

const MOCK_NOTIFICATIONS: PharmacyNotification[] = [
  {
    id: "not-1",
    type: "stock-alert",
    title: "Stock bajo: Ibuprofeno 400mg",
    message: "Quedan 5 unidades. Reabastecer pronto.",
    actionText: "Revisar inventario",
    actionHref: "#",
  },
  {
    id: "not-2",
    type: "prescription-error",
    title: "Receta #8472 — Fecha vencida",
    message: "La receta de Carlos Fuentes necesita renovación.",
    actionText: "Ver receta",
    actionHref: "#",
  },
];

export function usePharmacyNotifications(): PharmacyNotification[] {
  return MOCK_NOTIFICATIONS;
}
