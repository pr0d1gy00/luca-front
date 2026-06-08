"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useAuthStore } from "@/store/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export function DoctorGreeting() {
  const name = useAuthStore((s) => s.name);
  const doctorName = name || "Doctor";
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {getGreeting()}, {doctorName}
        </h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pharmako-care-light text-pharmako-care">
          Médico
        </span>
      </div>
      <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
    </motion.div>
  );
}
