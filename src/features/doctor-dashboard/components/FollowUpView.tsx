"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useDoctorKPIs } from "../hooks/useDoctorKPIs";
import { useDoctorNextPatient } from "../hooks/useDoctorNextPatient";
import { useDoctorActions } from "../hooks/useDoctorActions";
import { NextPatientCard } from "./NextPatientCard";
import { ActionChecklist } from "./ActionChecklist";
import { QuickActions } from "./QuickActions";
import { ClipboardList, Clock, Calendar } from "lucide-react";
import { ScheduleFollowUpModal } from "@/features/consultations/components/ScheduleFollowUpModal";

export function FollowUpView() {
  const { kpis = [] } = useDoctorKPIs();
  const { nextPatient = null } = useDoctorNextPatient();
  const { actions, toggleAction, pendingCount } = useDoctorActions();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2/3: Summary + Next Patient */}
      <div className="lg:col-span-2 space-y-6">
        {/* Resumen del día */}
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-pharmako-care-light rounded-xl p-3">
                <ClipboardList className="w-5 h-5 text-pharmako-care" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Resumen del día
                </h2>
                <p className="text-sm text-slate-500">
                  {pendingCount} acciones pendientes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="bg-teal-650 hover:bg-teal-700 text-white px-4 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              Nuevo Seguimiento
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-slate-50 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
              </div>
            ))}
            {/* Pending actions stat */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-slate-500">Pendientes</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Patient */}
        <NextPatientCard patient={nextPatient} />
      </div>

      {/* Right 1/3: Checklist + Quick Actions */}
      <div className="space-y-5">
        <ActionChecklist actions={actions} onToggle={toggleAction} />
        <QuickActions />
      </div>

      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
