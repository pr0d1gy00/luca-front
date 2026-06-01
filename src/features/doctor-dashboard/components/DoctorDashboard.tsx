"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { useDoctorKPIs } from "../hooks/useDoctorKPIs";
import { useDoctorAgenda } from "../hooks/useDoctorAgenda";
import { useDoctorNotifications } from "../hooks/useDoctorNotifications";
import { KpiCards } from "./KpiCards";
import { DailyAgenda } from "./DailyAgenda";
import { QuickActions } from "./QuickActions";
import { CriticalNotifications } from "./CriticalNotifications";
import { Container } from "@/components/ui/Container";

export function DoctorDashboard() {
  const kpis = useDoctorKPIs();
  const appointments = useDoctorAgenda();
  const notifications = useDoctorNotifications();

  return (
    <Container variant="fluid" className="flex flex-col gap-12">
      <KpiCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DailyAgenda appointments={appointments} />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActions />
          <CriticalNotifications notifications={notifications} />
        </div>
      </div>
    </Container>
  );
}
