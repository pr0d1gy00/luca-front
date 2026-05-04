"use client";

import HeaderDashboard from "@/components/HeaderDashboard";
import { Container } from "@/components/ui/Container";
import ConsultationHistory from "./ConsultationHistory";
import ActiveTreatment from "./ActiveTreatment";
import VitalSigns from "./VitalSigns";

export default function DashboardPage() {
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
