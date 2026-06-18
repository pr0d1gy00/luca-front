import { MdOutlineDashboard } from "react-icons/md";
import { PiPillBold, PiUsersBold } from "react-icons/pi";
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
];
