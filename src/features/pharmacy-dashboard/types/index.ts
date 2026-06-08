import type { ComponentType } from "react";

export type OrderStatus = "pendiente" | "en-preparacion" | "listo";
export type FulfillmentType = "presencial" | "delivery";
export type NotificationType = "stock-alert" | "prescription-error";
export type QuickActionVariant = "primary" | "secondary" | "outline";
export type TrendDirection = "up" | "down" | "stable";

export interface PharmacyKPI {
  label: string;
  value: number | string;
  trend: number;
  trendDirection: TrendDirection;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
}

export interface PharmacyOrder {
  id: string;
  patientName: string;
  prescription: string;
  time: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
}

export interface PharmacyNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionText: string;
  actionHref: string;
}

export interface PharmacyQuickAction {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  count?: number;
  variant?: QuickActionVariant;
}
