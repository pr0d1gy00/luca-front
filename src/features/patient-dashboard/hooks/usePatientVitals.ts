"use client";

import { Heart, Thermometer, Waves } from "lucide-react";
import type { VitalSign } from "../types";
import { usePatientDashboardQuery } from "./usePatientDashboardQuery";

export function usePatientVitals(): VitalSign[] {
  const { data } = usePatientDashboardQuery();

  if (!data?.vitals) {
    return [];
  }

  const v = data.vitals;

  return [
    {
      id: "vs-1",
      name: "Presión Arterial",
      value: v.blood_pressure,
      unit: "mmHg",
      time: v.measured_at,
      status: v.blood_pressure_status === "Alerta" ? "alert" : "stable",
      icon: Heart,
    },
    {
      id: "vs-2",
      name: "Frecuencia Cardíaca",
      value: String(v.heart_rate),
      unit: "bpm",
      time: v.measured_at,
      status: v.heart_rate_status === "Alerta" ? "alert" : "stable",
      icon: Heart,
    },
    {
      id: "vs-3",
      name: "Temperatura",
      value: String(v.temperature),
      unit: "°C",
      time: v.measured_at,
      status: v.temperature_status === "Alerta" ? "alert" : "stable",
      icon: Thermometer,
    },
    {
      id: "vs-4",
      name: "Saturación de Oxígeno",
      value: String(v.oxygen_saturation),
      unit: "%",
      time: v.measured_at,
      status: v.oxygen_saturation_status === "Alerta" ? "alert" : "stable",
      icon: Waves,
    },
  ];
}
