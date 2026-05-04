"use client";

import { useEffect } from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import { Container } from "@/components/ui/Container";
import { useAuthStore } from "@/store/auth";
import { DoctorDashboard } from "@/features/doctor-dashboard";
import ConsultationHistory from "./ConsultationHistory";
import ActiveTreatment from "./ActiveTreatment";
import VitalSigns from "./VitalSigns";

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

  return (
    <Container variant="fluid" className="flex flex-col gap-12">
      <HeaderDashboard user="Carlos" />
      <div className="flex gap-4 items-center justify-evenly">
        <ActiveTreatment />
        <VitalSigns />
      </div>
      <div className="flex gap-4 items-center justify-evenly">
        <ConsultationHistory />
        <div className="w-[45%] h-40 bg-white rounded-2xl"></div>
      </div>
    </Container>
  );
}
