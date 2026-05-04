"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Calendar } from "lucide-react";
import { AgendaItem } from "./AgendaItem";
import type { Appointment } from "../types";
import Link from "next/link";

interface DailyAgendaProps {
  appointments: Appointment[];
}

export function DailyAgenda({ appointments }: DailyAgendaProps) {
  const isEmpty = appointments.length === 0;

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Agenda del día</h3>
        <Link
          href="#"
          className="text-sm font-medium text-luca-primary hover:underline transition-colors"
        >
          Ver todo →
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-luca-muted">
          <Calendar className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">
            No hay citas programadas para hoy
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerChildrenVariant}
          initial="hidden"
          animate="visible"
          className="flex flex-col divide-y divide-slate-50"
        >
          {appointments.map((apt) => (
            <AgendaItem key={apt.id} appointment={apt} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
