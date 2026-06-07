import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Patient Dashboard Types
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "stable";

export interface PatientKPI {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  trend?: TrendDirection;
  trendLabel?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  type: string;
  date: Date;
  time: string;
  location: "presencial" | "virtual";
  status: "confirmed" | "pending" | "cancelled";
}

export interface Treatment {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  progress: number; // 0–100
  status: "active" | "completed" | "paused";
  nextDose: string;
}

export interface VitalSign {
  id: string;
  name: string;
  value: string;
  unit: string;
  time: string;
  status: "stable" | "alert";
  icon: LucideIcon;
}

export interface Consultation {
  id: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  diagnosis: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "primary" | "secondary" | "outline";
  href: string;
}
