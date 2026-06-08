"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useClinicGreeting } from "../hooks/useClinicGreeting";

export function ClinicGreeting() {
  const { name, date } = useClinicGreeting();

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Buenos días, {name}
        </h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pharmako-care-light text-pharmako-care">
          Clínica
        </span>
      </div>
      <p className="text-sm text-slate-500 capitalize">{date}</p>
    </motion.div>
  );
}
