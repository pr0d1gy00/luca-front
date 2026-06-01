import { BellIcon, CalendarIcon, FileText, LayoutList, Eye, Users, Stethoscope } from "lucide-react";
import React from "react";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";

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
    title: "Mis Recipes",
    name: "recipes",
    href: "/recipes",
    icon: IoNewspaperOutline,
    roles: ["patient"],
  },
  {
    title: "Mis Reminders",
    name: "reminders",
    href: "/reminders",
    icon: BellIcon,
    roles: ["patient"],
  },
  {
    title: "Mi Cita",
    name: "appointment",
    href: "/appointment",
    icon: CalendarIcon,
    roles: ["doctor", "patient"],
  },
  {
    title: "Mis Citas",
    name: "appointments",
    href: "/appointments",
    icon: CalendarIcon,
    roles: ["clinic"],
  },
  {
    title: "Historial",
    name: "history",
    href: "/history",
    icon: CalendarIcon,
    roles: ["doctor"],
  },
  {
    title: "Recetas",
    name: "recipes",
    href: "/recipes",
    icon: CalendarIcon,
    roles: ["doctor"],
  },
  {
    title: "Historia Clínica",
    name: "clinical-history-list",
    href: "/features/clinical-history",
    icon: LayoutList,
    roles: ["doctor", "clinic"],
  },
  {
    title: "Constructor de HC",
    name: "clinical-history-builder",
    href: "/features/clinical-history/builder",
    icon: FileText,
    roles: ["doctor", "clinic"],
  },
  {
    title: "Previsualizar HC",
    name: "clinical-history-preview",
    href: "/features/clinical-history/preview/template-001",
    icon: Eye,
    roles: ["doctor", "clinic"],
  },
  {
    title: "Pacientes",
    name: "patients",
    href: "/doctor/patients",
    icon: Users,
    roles: ["doctor"],
  },
  {
    title: "Consulta Activa",
    name: "consultations",
    href: "/doctor/consultations",
    icon: Stethoscope,
    roles: ["doctor"],
  },
  {
    title: "Citas",
    name: "appointments",
    href: "/doctor/appointments",
    icon: CalendarIcon,
    roles: ["doctor", "patient", "clinic"],
  },
  {
    title: "Medicamentos",
    name: "medications",
    href: "/doctor/medications",
    icon: FileText,
    roles: ["doctor"],
  },
];
