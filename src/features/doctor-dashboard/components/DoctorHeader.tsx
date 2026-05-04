"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoctorHeaderProps {
  doctorName: string;
}

function formatDate(): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function DoctorHeader({ doctorName }: DoctorHeaderProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between w-full flex-wrap gap-4"
    >
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-luca-primary">
          Hola, {doctorName}
        </h2>
        <p className="text-lg text-luca-muted font-medium mt-1 capitalize">
          {formatDate()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Notificaciones"
          className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-luca-muted-dark" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-luca-accent rounded-full border-2 border-luca-surface-light" />
        </button>

        <Button className="bg-luca-primary hover:bg-luca-primary-hover text-luca-fg-on-primary font-semibold rounded-full px-5 py-6 shadow-sm hover:scale-105 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>
    </motion.div>
  );
}
