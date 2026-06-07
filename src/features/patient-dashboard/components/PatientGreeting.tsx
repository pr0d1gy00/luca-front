"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { usePatientGreeting } from "../hooks/usePatientGreeting";

export function PatientGreeting() {
  const { name, date } = usePatientGreeting();

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hola, {name}
        </h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-400">
          Paciente
        </span>
      </div>
      <p className="text-sm text-slate-500 capitalize">{date}</p>
    </motion.div>
  );
}
