import type { ComponentType } from "react";

export type AppointmentStatus = "finalizada" | "en-curso" | "en-espera";
export type NotificationType = "critical-lab" | "missed-appointment";
export type QuickActionVariant = "primary" | "secondary" | "outline";

export interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  type: string;
  time: string;
  status: AppointmentStatus;
}

export interface KPIData {
  label: string;
  value: number;
  trend: number;
  subtitle: string;
}

export interface Notification {
  id: string;
  patientName: string;
  type: NotificationType;
  message: string;
  actionText: string;
  actionHref: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  count?: number;
  variant?: QuickActionVariant;
}
