"use client";

import { motion } from "motion/react";
import { Calendar, MapPin, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import { usePatientAppointments } from "../hooks/usePatientAppointments";

export function NextAppointmentCard() {
  const appointments = usePatientAppointments();
  const next = appointments[0];

  if (!next) {
    return (
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <Calendar className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No tenés citas programadas</p>
        </div>
      </motion.div>
    );
  }

  const dateStr = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(next.date);

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-pharmako-care-light rounded-lg p-2">
          <Calendar className="w-4 h-4 text-pharmako-care" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Próxima cita</h3>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-bold text-slate-900">{next.doctorName}</p>
        <p className="text-sm text-slate-500">{next.specialty}</p>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{dateStr}</span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-sm font-medium text-slate-700">
            {next.time}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
              next.location === "presencial"
                ? "bg-pharmako-care-light text-pharmako-care"
                : "bg-slate-50 text-slate-500",
            )}
          >
            {next.location === "presencial" ? (
              <MapPin className="w-3 h-3" />
            ) : (
              <Video className="w-3 h-3" />
            )}
            {next.location === "presencial" ? "Presencial" : "Virtual"}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pharmako-care-light text-pharmako-care">
            Confirmada
          </span>
        </div>

        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors mt-3">
          Ver todas las citas
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
