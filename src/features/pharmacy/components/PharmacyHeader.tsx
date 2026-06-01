"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const pharmacyName = "Farmacia Botánica";
  const today = new Date();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A3626]">
          {getGreeting()}, {pharmacyName}
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 capitalize">
          {formatDate(today)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar medicamientos..."
            className="pl-10 pr-4 h-10 bg-white border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:ring-[#1A3626] focus:border-[#1A3626]"
          />
        </div>

        {/* Bell button */}
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4 text-stone-600" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1A3626] rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
}
