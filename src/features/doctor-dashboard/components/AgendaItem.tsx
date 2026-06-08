"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import type { Appointment } from "../types";

interface AgendaItemProps {
  appointment: Appointment;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export function AgendaItem({ appointment, onClick }: AgendaItemProps) {
  const { patientName, type, time, status } = appointment;

  return (
    <motion.div
      variants={fadeUpVariant}
      onClick={onClick}
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <Avatar size="sm">
        <AvatarFallback className="bg-pharmako-care-light text-pharmako-care text-xs font-semibold">
          {getInitials(patientName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {patientName}
        </p>
        <p className="text-xs text-slate-500">{type}</p>
      </div>

      <span className="text-sm font-medium text-slate-500 tabular-nums">
        {time}
      </span>

      <StatusBadge status={status} />
    </motion.div>
  );
}
