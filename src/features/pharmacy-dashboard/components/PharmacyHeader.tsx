"use client";

import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PharmacyHeader() {
  const name = useAuthStore((s) => s.name);
  const pharmacyName = name || "Farmacia Central";
  const today = new Date();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {pharmacyName}
        </h1>
        <p className="text-luca-muted text-sm mt-1">
          {formatDate(today)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </div>
        <button
          type="button"
          className="bg-luca-primary text-luca-fg-on-primary rounded-xl px-4 py-2 font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          Nueva Orden
        </button>
      </div>
    </div>
  );
}
