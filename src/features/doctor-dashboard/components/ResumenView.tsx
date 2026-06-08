"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { fadeUpVariant } from "@/app/lib/animations";
import { useDoctorKPIs } from "../hooks/useDoctorKPIs";
import { useDoctorAgenda } from "../hooks/useDoctorAgenda";
import { useDoctorNextPatient } from "../hooks/useDoctorNextPatient";
import { useDoctorActions } from "../hooks/useDoctorActions";
import { KpiCards } from "./KpiCards";
import { NextPatientCard } from "./NextPatientCard";
import { ActionChecklist } from "./ActionChecklist";
import { DailyAgenda } from "./DailyAgenda";
import { QuickActions } from "./QuickActions";

export function ResumenView() {
  const kpis = useDoctorKPIs();
  const appointments = useDoctorAgenda();
  const nextPatient = useDoctorNextPatient();
  const { actions, toggleAction } = useDoctorActions();
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
        <KpiCards kpis={kpis} />
      </motion.div>

      {/* Next Patient + Checklist */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <NextPatientCard patient={nextPatient} />
        <ActionChecklist actions={actions} onToggle={toggleAction} />
      </motion.div>

      {/* Agenda + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="md:col-span-2"
        >
          <DailyAgenda
            appointments={appointments}
            onAppointmentClick={(_id) =>
              router.push(`/dashboard/consultations/con-001`)
            }
          />
        </motion.div>
        <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
          <QuickActions />
        </motion.div>
      </div>
    </div>
  );
}
