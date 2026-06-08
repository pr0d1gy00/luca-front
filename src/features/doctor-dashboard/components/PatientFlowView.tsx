"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useDoctorAgenda } from "../hooks/useDoctorAgenda";
import { useDoctorActions } from "../hooks/useDoctorActions";
import { cn } from "@/lib/utils";
import {
  Clock,
  UserCheck,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AgendaItem } from "./AgendaItem";
import { ActionChecklist } from "./ActionChecklist";

export function PatientFlowView() {
  const appointments = useDoctorAgenda();
  const { actions, toggleAction } = useDoctorActions();

  const waitingPatients = appointments.filter((a) => a.status === "en-espera");
  const currentPatient = appointments.find((a) => a.status === "en-curso");
  const completedToday = appointments.filter(
    (a) => a.status === "finalizada",
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Waiting */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">En Espera</h3>
            <span className="ml-auto text-xs font-medium text-amber-500">
              {waitingPatients.length}
            </span>
          </div>
        </div>
        <div className="p-3 space-y-1">
          {waitingPatients.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No hay pacientes esperando
            </p>
          ) : (
            waitingPatients.map((apt) => (
              <AgendaItem key={apt.id} appointment={apt} />
            ))
          )}
        </div>
      </motion.div>

      {/* Current consultation */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Consulta Activa
            </h3>
          </div>
        </div>

        {currentPatient ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {currentPatient.patientName}
                </p>
                <p className="text-xs text-slate-400">{currentPatient.type}</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: FileText,
                  label: "Historia Clínica",
                  color: "text-pharmako-care",
                },
                {
                  icon: FlaskConical,
                  label: "Ordenar Laboratorio",
                  color: "text-violet-500",
                },
                {
                  icon: FileText,
                  label: "Emitir Receta",
                  color: "text-emerald-500",
                },
                {
                  icon: CalendarIcon,
                  label: "Agendar Seguimiento",
                  color: "text-amber-500",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <action.icon className={cn("w-4 h-4", action.color)} />
                  <span className="text-sm text-slate-600">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-xs text-slate-400 text-center py-6">
              No hay consulta activa
            </p>
          </div>
        )}
      </motion.div>

      {/* Post-consultation */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">
              Post-Consulta
            </h3>
            <span className="ml-auto text-xs font-medium text-pharmako-care">
              {completedToday} completadas
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-400 font-medium mb-2 px-1">
            Pendientes
          </p>
          <ActionChecklist
            actions={actions.filter((a) => !a.completed)}
            onToggle={toggleAction}
          />
        </div>
      </motion.div>
    </div>
  );
}
