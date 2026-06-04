"use client";

import { motion } from "motion/react";

interface AuthTabsProps {
  active: "login" | "register";
  onSelect: (tab: "login" | "register") => void;
}

export function AuthTabs({ active, onSelect }: AuthTabsProps) {
  const tabs = [
    { key: "login" as const, label: "Iniciar Sesión" },
    { key: "register" as const, label: "Crear Cuenta" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl p-1">
      {tabs.map((tab) => (
        <motion.button
          key={tab.key}
          onClick={() => onSelect(tab.key)}
          className={`relative flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 ${
            active === tab.key
              ? "text-pharmako-primary bg-white"
              : "text-pharmako-text-muted hover:text-pharmako-text-secondary"
          }`}
        >
          {tab.label}
          {active === tab.key && (
            <motion.div
              layoutId="activeAuthTab"
              className="absolute bottom-0 -translate-x-1/2 left-1/2 right-1/2 h-0.5 w-1/2 bg-pharmako-primary rounded-full"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
