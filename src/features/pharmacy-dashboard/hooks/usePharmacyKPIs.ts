"use client";

import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { PharmacyKPI } from "../types";

const MOCK_KPIS: PharmacyKPI[] = [
  {
    label: "Órdenes pendientes",
    value: 8,
    trend: -4,
    trendDirection: "down",
    subtitle: "hoy",
    icon: Package,
  },
  {
    label: "Órdenes completadas hoy",
    value: 23,
    trend: 5,
    trendDirection: "up",
    subtitle: "hoy",
    icon: CheckCircle,
  },
  {
    label: "Tiempo promedio de espera",
    value: "12 min",
    trend: -2,
    trendDirection: "down",
    subtitle: "por orden",
    icon: Clock,
  },
  {
    label: "Alertas de stock activas",
    value: 3,
    trend: 1,
    trendDirection: "up",
    subtitle: "requieren atención",
    icon: AlertTriangle,
  },
];

export function usePharmacyKPIs(): PharmacyKPI[] {
  return MOCK_KPIS;
}
