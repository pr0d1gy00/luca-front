"use client";

import type { PharmacyOrder } from "../types";

const MOCK_ORDERS: PharmacyOrder[] = [
  {
    id: "ORD-001",
    patientName: "María López",
    prescription: "Amoxicilina 500mg",
    time: "09:30",
    status: "pendiente",
    fulfillmentType: "presencial",
  },
  {
    id: "ORD-002",
    patientName: "Carlos Fuentes",
    prescription: "Ibuprofeno 400mg",
    time: "09:45",
    status: "en-preparacion",
    fulfillmentType: "presencial",
  },
  {
    id: "ORD-003",
    patientName: "Ana Torres",
    prescription: "Omeprazol 20mg",
    time: "10:00",
    status: "listo",
    fulfillmentType: "delivery",
  },
  {
    id: "ORD-004",
    patientName: "Pedro Jiménez",
    prescription: "Paracetamol 1g",
    time: "10:15",
    status: "pendiente",
    fulfillmentType: "delivery",
  },
  {
    id: "ORD-005",
    patientName: "Sofía Ramírez",
    prescription: "Losartán 50mg",
    time: "10:30",
    status: "en-preparacion",
    fulfillmentType: "presencial",
  },
  {
    id: "ORD-006",
    patientName: "Diego Herrera",
    prescription: "Metformina 850mg",
    time: "11:00",
    status: "pendiente",
    fulfillmentType: "delivery",
  },
  {
    id: "ORD-007",
    patientName: "Valentina Ríos",
    prescription: "Salbutamol inhalador",
    time: "11:15",
    status: "listo",
    fulfillmentType: "presencial",
  },
  {
    id: "ORD-008",
    patientName: "Jorge Castillo",
    prescription: "Atorvastatina 20mg",
    time: "11:30",
    status: "en-preparacion",
    fulfillmentType: "delivery",
  },
];

export function usePharmacyOrders(): PharmacyOrder[] {
  return MOCK_ORDERS;
}
