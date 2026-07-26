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
    <div className="flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl w-fit">
      {VIEWS.map((view) => (
        <button
          key={view.id}
          onClick={() => onChange(view.id)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs transition-colors duration-150 shadow-none font-medium",
            activeView === view.id
              ? "bg-white text-slate-900 font-semibold border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 border border-transparent",
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
