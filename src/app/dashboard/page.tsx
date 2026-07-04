"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PharmacyDashboard } from "@/features/pharmacy-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";
import { ClinicDashboard } from "@/features/clinic-dashboard";

export default function DashboardPage() {
  const { role, userType, isVerified } = useAuthStore();
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    if (useAuthStore.persist) {
      return useAuthStore.persist.hasHydrated();
    }
    return true;
  });

  useEffect(() => {
    if (hydrated) return;

    if (useAuthStore.persist) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      return unsub;
    }
  }, [hydrated]);

  console.log("[DashboardPage] Rendering!", {
    role,
    userType,
    isVerified,
    hydrated,
  });

  // Expose setRole on window for dev console testing per spec AR scenario
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__setRole =
        useAuthStore.getState().setRole;
    }
  }, []);

  // No Renderizar nada hasta que el store esté hidratado
  // Esto previene el redirect a pending-verification por valores por defecto
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    );
  }

  // Sin rol determinado (sesión limpiada o estado inicial) → no renderizar nada
  if (!role) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (role === "doctor") {
    return <DoctorDashboard />;
  }
  if (role === "pharmacy") {
    return <PharmacyDashboard />;
  }
  if (role === "patient") {
    return <PatientDashboard />;
  }
  if (role === "clinic") {
    return <ClinicDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <p className="text-slate-500">Dashboard no disponible para este rol</p>
      </div>
    </div>
  );
}
