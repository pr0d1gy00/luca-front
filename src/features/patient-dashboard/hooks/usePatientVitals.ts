import { Heart, Thermometer, Waves } from "lucide-react";
import type { VitalSign } from "../types";

export function usePatientVitals(): VitalSign[] {
  return [
    {
      id: "vs-1",
      name: "Presión Arterial",
      value: "120/80",
      unit: "mmHg",
      time: "10:30 AM",
      status: "stable",
      icon: Heart,
    },
    {
      id: "vs-2",
      name: "Frecuencia Cardíaca",
      value: "72",
      unit: "bpm",
      time: "10:30 AM",
      status: "stable",
      icon: Heart,
    },
    {
      id: "vs-3",
      name: "Temperatura",
      value: "38.5",
      unit: "°C",
      time: "10:30 AM",
      status: "alert",
      icon: Thermometer,
    },
    {
      id: "vs-4",
      name: "Saturación de Oxígeno",
      value: "98",
      unit: "%",
      time: "10:30 AM",
      status: "stable",
      icon: Waves,
    },
  ];
}
