import { BellIcon, CalendarIcon } from "lucide-react";
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
];
