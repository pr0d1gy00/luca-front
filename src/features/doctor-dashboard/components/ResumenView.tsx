"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useDoctorKPIs } from "../hooks/useDoctorKPIs";
import { useDoctorAgenda } from "../hooks/useDoctorAgenda";
import { useDoctorNextPatient } from "../hooks/useDoctorNextPatient";
import { useDoctorActions } from "../hooks/useDoctorActions";
import { NextPatientCard } from "./NextPatientCard";
import { ActionChecklist } from "./ActionChecklist";
import { DailyAgenda } from "./DailyAgenda";
import { QuickActions } from "./QuickActions";
import { Users, Calendar } from "lucide-react";

export function ResumenView() {
  const kpis = useDoctorKPIs();
  const appointments = useDoctorAgenda();
  const nextPatient = useDoctorNextPatient();
  const { actions, toggleAction, pendingCount } = useDoctorActions();

  const totalPatients = kpis.reduce((sum, k) => sum + k.value, 0);

  return (
    <div className="space-y-5">
      {/* Briefing Row */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Total patients today */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-xl p-5 flex items-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-xl bg-pharmako-care-light shrink-0">
            <Users className="w-6 h-6 text-pharmako-care" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pacientes Hoy
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
            <p className="text-xs text-slate-400">
              {kpis[0]?.value} en consulta · {kpis[2]?.value} pendientes
            </p>
          </div>
        </div>

        {/* Next Patient */}
        <NextPatientCard patient={nextPatient} />
      </motion.div>

      {/* Quick Actions — debajo del briefing */}
      <QuickActions />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Checklist — 1 col */}
        <div>
          <ActionChecklist actions={actions} onToggle={toggleAction} />
        </div>

        {/* Agenda — 2 col */}
        <div className="md:col-span-2">
          <DailyAgenda appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
