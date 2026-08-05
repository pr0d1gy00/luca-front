"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import type { DashboardView } from "../types";

interface DashboardSwitcherProps {
  activeView: DashboardView;
  onChange: (view: DashboardView) => void;
}

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "flujo", label: "Flujo Pacientes" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "servicios", label: "Servicios" },
];

const STORAGE_KEY = "pharmako-dashboard-view";

export function DashboardSwitcher({
  activeView,
  onChange,
}: DashboardSwitcherProps) {
  return (
    <div className="flex items-center p-1 w-full">
      {VIEWS.map((view) => (
        <button
          key={view.id}
          onClick={() => onChange(view.id)}
          className={cn(
            "px-3.5 py-1.5 text-sm transition-colors duration-150 shadow-none font-medium",
            activeView === view.id
              ? "border-pharmako-care border-b-2 font-semibold text-pharmako-care"
              : "border-b border-slate-300",
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}

export function useDashboardView(): [
  DashboardView,
  (view: DashboardView) => void,
] {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);
  const getSnapshot = useCallback((): DashboardView => {
    const stored = localStorage.getItem(STORAGE_KEY) as DashboardView | null;
    if (
      stored &&
      ["resumen", "flujo", "seguimiento", "servicios"].includes(stored)
    ) {
      return stored;
    }
    return "resumen";
  }, []);
  const getServerSnapshot = useCallback((): DashboardView => "resumen", []);

  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleChange = useCallback((newView: DashboardView) => {
    localStorage.setItem(STORAGE_KEY, newView);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: newView,
      }),
    );
  }, []);

  return [view, handleChange];
}
