"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useConsultationDetail } from "@/features/consultations/hooks/useConsultationDetail";
import { PatientContextCard } from "@/features/consultations/components/PatientContextCard";
import { ConsultationTabs } from "@/features/consultations/components/ConsultationTabs";

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const detail = useConsultationDetail(id);
  const router = useRouter();

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">Consulta no encontrada</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-700 hover:text-blue-800 mt-2"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const { consultation, patient, doctor, history } = detail;

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Consulta
          </h1>
          <p className="text-sm text-slate-500">{formattedDate}</p>
        </div>
      </div>

      {/* Main grid: Patient + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient context */}
        <div className="lg:col-span-1">
          <PatientContextCard
            patient={patient}
            vitals={{
              systolicBP: 120,
              diastolicBP: 80,
              heartRate: 72,
              temperature: 38.2,
              oxygenSat: 98,
            }}
          />
        </div>

        {/* Right: Consultation Tabs (Historial + Consulta Actual) */}
        <div className="lg:col-span-2">
          <ConsultationTabs
            historyEntries={history}
            onSubmit={(data) => {
              console.log("[Consultation] Submitted:", data);
            }}
            onGeneratePrescription={(data) => {
              console.log("[Consultation] Generate prescription:", data);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
