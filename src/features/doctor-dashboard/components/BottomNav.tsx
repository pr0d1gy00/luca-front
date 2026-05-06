"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Pill,
  type LucideIcon,
} from "lucide-react";

interface BottomNavTab {
  label: string;
  href: string;
  icon: LucideIcon;
}

const TABS: BottomNavTab[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mi Cita", href: "/appointment", icon: Calendar },
  { label: "Historial", href: "/history", icon: ClipboardList },
  { label: "Recetas", href: "/recipes", icon: Pill },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden min-h-[56px] bg-white border-t border-slate-100 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="flex h-full max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = tab.href === pathname;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[44px] transition-colors duration-200 ${
                isActive
                  ? "text-luca-primary"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon
                className={`size-5 transition-colors ${
                  isActive ? "text-luca-primary" : ""
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-luca-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
