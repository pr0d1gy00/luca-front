"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUpVariant } from "@/app/lib/animations";
import { useConsultationList } from "@/features/consultations/hooks/useConsultationList";
import type { ConsultationListItem } from "@/features/consultations/hooks/useConsultationList";

export default function ConsultationListPage() {
  const consultations = useConsultationList();
  const router = useRouter();

  const isEmpty = consultations.length === 0;

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Consultas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {consultations.length} consulta{consultations.length !== 1 ? "s" : ""}{" "}
          registrada{consultations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <Stethoscope className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            No hay consultas registradas
          </p>
          <p className="text-xs text-slate-400">
            Las consultas que realices aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {consultations.map((c) => (
              <ConsultationRow
                key={c.id}
                consultation={c}
                onClick={() => router.push(`/dashboard/consultations/${c.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completada",
    className: "bg-emerald-50 text-emerald-600",
  },
  "in-progress": {
    label: "En curso",
    className: "bg-pharmako-care-light text-pharmako-care",
  },
  pending: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-600",
  },
};

function ConsultationRow({
  consultation,
  onClick,
}: {
  consultation: ConsultationListItem;
  onClick: () => void;
}) {
  const { patientName, patientDocument, date, type, diagnosis, status } =
    consultation;
  const sc = statusConfig[status];

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{patientName}</p>
          <span className="text-xs text-slate-400">{patientDocument}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{type}</span>
          <span className="text-slate-300">·</span>
          <Calendar className="w-3 h-3 text-slate-400" />
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {status === "in-progress" && (
          <div className="flex items-center gap-1 text-xs text-pharmako-care">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>En curso</span>
          </div>
        )}
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
            sc.className,
          )}
        >
          {sc.label}
        </span>
      </div>
    </button>
  );
}
