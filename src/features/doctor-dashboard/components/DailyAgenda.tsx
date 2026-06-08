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
      className="h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-pharmako-care" />
          <h3 className="text-sm font-semibold text-slate-800">
            Agenda del día
          </h3>
        </div>
        <Link
          href="#"
          className="text-xs font-medium text-pharmako-care hover:text-pharmako-care transition-colors"
        >
          Ver todo →
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 pb-3 pt-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-pharmako-care py-10">
            <Calendar className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs font-medium">
              No hay citas programadas para hoy
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerChildrenVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {appointments.map((apt) => (
              <AgendaItem key={apt.id} appointment={apt} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
