"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
} from "lucide-react";
import { AgendaItem } from "./AgendaItem";
import { ActionChecklist } from "./ActionChecklist";

export function PatientFlowView() {
  const appointments = useDoctorAgenda();
  const { actions, toggleAction } = useDoctorActions();
  const router = useRouter();

  const waitingPatients = appointments.filter((a) => a.status === "en-espera");
  const currentPatient = appointments.find((a) => a.status === "en-curso");
  const completedToday = appointments.filter((a) => a.status === "finalizada");
  const pendingActions = actions.filter((a) => !a.completed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Column 1: En Espera */}
      <Column
        title="En Espera"
        icon={Clock}
        iconColor="text-amber-500"
        count={waitingPatients.length}
      >
        {waitingPatients.length === 0 ? (
          <EmptyState icon={Clock} message="No hay pacientes esperando" />
        ) : (
          <div className="space-y-1">
            {waitingPatients.map((apt) => (
              <AgendaItem
                key={apt.id}
                appointment={apt}
                onClick={() => router.push(`/dashboard/consultations/con-001`)}
              />
            ))}
          </div>
        )}
      </Column>

      {/* Column 2: Consulta Activa */}
      <Column
        title="Consulta Activa"
        icon={Stethoscope}
        iconColor="text-emerald-500"
      >
        {currentPatient ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {currentPatient.patientName}
                </p>
                <p className="text-xs text-slate-400">{currentPatient.type}</p>
              </div>
            </div>

            <div className="space-y-1.5">
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
                  <action.icon
                    className={cn("w-4 h-4 shrink-0", action.color)}
                  />
                  <span className="text-sm text-slate-600">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState icon={Stethoscope} message="No hay consulta activa" />
        )}
      </Column>

      {/* Column 3: Post-Consulta */}
      <Column
        title="Post-Consulta"
        icon={CheckCircle2}
        iconColor="text-pharmako-care"
        count={completedToday.length}
        countLabel="completadas"
      >
        <div className="p-4 space-y-4">
          {/* Completed today summary */}
          {completedToday.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-medium text-emerald-700">
                {completedToday.length} paciente
                {completedToday.length !== 1 ? "s" : ""} atendido
                {completedToday.length !== 1 ? "s" : ""} hoy
              </p>
            </div>
          )}

          {/* Checklist */}
          {pendingActions.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                Pendientes
              </p>
              <ActionChecklist
                actions={pendingActions}
                onToggle={toggleAction}
              />
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} message="Todo al día" />
          )}
        </div>
      </Column>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function Column({
  title,
  icon: Icon,
  iconColor,
  count,
  countLabel,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  count?: number;
  countLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 p-4 border-b border-slate-100">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {count !== undefined && (
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {count}
            {countLabel && (
              <span className="ml-1 text-slate-400">{countLabel}</span>
            )}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 px-4">
      <div className="bg-slate-50 rounded-xl p-3">
        <Icon className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}
