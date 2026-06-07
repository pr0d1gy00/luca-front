"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PharmacyDashboard } from "@/features/pharmacy-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);

  // Expose setRole on window for dev console testing per spec AR scenario
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Record<string, unknown>).__setRole =
        useAuthStore.getState().setRole;
    }
  }, []);

  if (role === "doctor") {
    return <DoctorDashboard />;
  }
  if (role === "pharmacy") {
    return <PharmacyDashboard />;
  }
  if (role === "patient") {
    return <PatientDashboard />;
  }

  // Fallback for clinic and unknown roles
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <p className="text-slate-500">Dashboard no disponible para este rol</p>
      </div>
    </div>
  );
}
