import { MdOutlineDashboard } from "react-icons/md";
import {
  PiPillBold,
  PiUsersBold,
  PiFileTextBold,
  PiCalendarBold,
  PiClockBold,
  PiCreditCardBold,
} from "react-icons/pi";
import React from "react";

export type NavItem = {
  title: string;
  name: string;
  href: string;
  icon: React.ElementType;
  roles: ("doctor" | "patient" | "clinic" | "pharmacy")[];
};

export type NavItemGroup = {
  title: string;
  items: NavItem[];
};

export const navigationConfig: NavItem[] = [
  {
    title: "Dashboard",
    name: "dashboard",
    href: "/dashboard",
    icon: MdOutlineDashboard,
    roles: ["patient", "doctor", "clinic", "pharmacy"],
  },
  {
    title: "Agendar Cita",
    name: "booking",
    href: "/dashboard/booking",
    icon: PiCalendarBold,
    roles: ["patient"],
  },
  {
    title: "Mis Citas",
    name: "appointments",
    href: "/dashboard/appointments",
    icon: PiClockBold,
    roles: ["patient"],
  },
  {
    title: "Mis Recetas",
    name: "recetas",
    href: "/dashboard/recetas",
    icon: PiPillBold,
    roles: ["patient"],
  },
  {
    title: "Mis Consultas",
    name: "consultas",
    href: "/dashboard/consultas",
    icon: PiFileTextBold,
    roles: ["patient"],
  },
  {
    title: "Mis Estudios",
    name: "lab-results",
    href: "/dashboard/lab-results",
    icon: PiFileTextBold,
    roles: ["patient"],
  },
  {
    title: "Mis Facturas",
    name: "invoices",
    href: "/dashboard/invoices",
    icon: PiCreditCardBold,
    roles: ["patient"],
  },
  {
    title: "Mis Documentos",
    name: "medical-documents",
    href: "/dashboard/medical-documents",
    icon: PiFileTextBold,
    roles: ["patient"],
  },
  {
    title: "Pacientes",
    name: "patients",
    href: "/dashboard/patients",
    icon: PiUsersBold,
    roles: ["doctor"],
  },
  {
    title: "Medicamentos",
    name: "medications",
    href: "/dashboard/medications",
    icon: PiPillBold,
    roles: ["doctor"],
  },
  {
    title: "Historias Clínicas",
    name: "clinical-history",
    href: "/dashboard/clinical-history",
    icon: PiFileTextBold,
    roles: ["doctor"],
  },
];
