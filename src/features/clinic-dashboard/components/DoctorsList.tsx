"use client";

import { motion } from "motion/react";
import { UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import { useClinicDoctors } from "../hooks/useClinicDoctors";
import type { ClinicDoctor } from "../types";

export function DoctorsList() {
  const doctors = useClinicDoctors();
  const isEmpty = doctors.length === 0;

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <div className="bg-pharmako-care-light rounded-lg p-1.5">
          <UserCheck className="w-4 h-4 text-pharmako-care" />
        </div>
        Doctores activos
      </h3>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <UserCheck className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No hay doctores activos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const doctorStatusConfig: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-600",
  busy: "bg-amber-50 text-amber-600",
  off: "bg-slate-50 text-slate-500",
};

function DoctorCard({ doctor }: { doctor: ClinicDoctor }) {
  const { name, specialty, patientsSeen, status } = doctor;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-pharmako-care-light flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-pharmako-care">
          {name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className="text-xs text-slate-500">{specialty}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-500">{patientsSeen} pacientes</span>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
            doctorStatusConfig[status],
          )}
        >
          {status === "available"
            ? "Disponible"
            : status === "busy"
              ? "Ocupado"
              : "Ausente"}
        </span>
      </div>
    </div>
  );
}
