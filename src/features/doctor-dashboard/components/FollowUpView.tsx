"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useDoctorKPIs } from "../hooks/useDoctorKPIs";
import { useDoctorNextPatient } from "../hooks/useDoctorNextPatient";
import { useDoctorActions } from "../hooks/useDoctorActions";
import { NextPatientCard } from "./NextPatientCard";
import { ActionChecklist } from "./ActionChecklist";
import { QuickActions } from "./QuickActions";
import { Sun, Users } from "lucide-react";

export function FollowUpView() {
  const kpis = useDoctorKPIs();
  const nextPatient = useDoctorNextPatient();
  const { actions, toggleAction, pendingCount } = useDoctorActions();

  const totalPatients = kpis.reduce((sum, k) => sum + k.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left 2/3: Summary + Next Patient */}
      <div className="lg:col-span-2 space-y-5">
        {/* Smart summary card */}
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center size-10 rounded-xl bg-amber-50">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Buen día, doctor
              </h2>
              <p className="text-sm text-slate-400">
                Tienes{" "}
                <span className="font-medium text-slate-600">
                  {totalPatients} pacientes
                </span>{" "}
                hoy &middot;{" "}
                <span className="font-medium text-slate-600">
                  {pendingCount} acciones
                </span>{" "}
                pendientes
              </p>
            </div>
          </div>

          {/* Mini stat pills */}
          <div className="flex flex-wrap gap-2">
            {kpis.map((kpi) => (
              <span
                key={kpi.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-600"
              >
                {kpi.value}
                <span className="text-slate-400">|</span>
                {kpi.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Next Patient */}
        <NextPatientCard patient={nextPatient} />
      </div>

      {/* Right 1/3: Actions + Quick */}
      <div className="space-y-4">
        <ActionChecklist actions={actions} onToggle={toggleAction} />
        <QuickActions />
      </div>
    </div>
  );
}
