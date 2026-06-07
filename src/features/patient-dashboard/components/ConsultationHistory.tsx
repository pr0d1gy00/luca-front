"use client";

import { motion } from "motion/react";
import { BriefcaseMedical } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import type { Consultation } from "../types";

interface ConsultationHistoryProps {
  consultations: Consultation[];
}

export function ConsultationHistory({
  consultations,
}: ConsultationHistoryProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Historial de consultas
      </h2>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <BriefcaseMedical className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            No tenés consultas registradas
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col">
          {/* Timeline line — hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200" />

          <div className="flex flex-col gap-8">
            {consultations.map((consultation, index) => (
              <ConsultationRow
                key={consultation.id}
                consultation={consultation}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ConsultationRow({
  consultation,
  isEven,
}: {
  consultation: Consultation;
  isEven: boolean;
}) {
  const { date, time, type, reason, diagnosis } = consultation;

  return (
    <>
      {/* Desktop: alternating timeline */}
      <div
        className={cn(
          "hidden lg:flex items-stretch w-full",
          !isEven && "flex-row-reverse",
        )}
      >
        {/* Date side */}
        <div
          className={cn(
            "flex-1 flex flex-col justify-center",
            isEven ? "items-end pr-10" : "items-start pl-10",
          )}
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900">{date}</h3>
            <p className="text-sm text-slate-500">{time}</p>
          </div>
        </div>

        {/* Center node */}
        <div className="w-10 shrink-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-700 rounded-full z-10 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        {/* Card side */}
        <div className={cn("flex-1", isEven ? "pl-10" : "pr-10")}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pharmako-care-light rounded-xl p-2.5">
                <BriefcaseMedical className="w-5 h-5 text-pharmako-care" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{type}</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Motivo:
                </span>
                <span className="text-sm text-slate-600">{reason}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Diagnóstico:
                </span>
                <span className="text-sm text-slate-600">{diagnosis}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: linear list */}
      <div className="lg:hidden flex items-start gap-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-900">{type}</h3>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{date}</span>
            </div>
            <p className="text-xs text-slate-600">
              {reason} — {diagnosis}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
