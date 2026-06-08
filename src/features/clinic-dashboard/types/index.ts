import type { LucideIcon } from "lucide-react";

export interface ClinicKPI {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendLabel?: string;
}

export interface ClinicConsultation {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
}

export interface ClinicDoctor {
  id: string;
  name: string;
  specialty: string;
  patientsSeen: number;
  status: "available" | "busy" | "off";
}

export interface ClinicQuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "primary" | "secondary" | "outline";
  href: string;
}
