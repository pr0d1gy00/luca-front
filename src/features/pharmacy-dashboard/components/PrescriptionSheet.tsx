"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Pill, User, Calendar, Hash, Stethoscope } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { PrescriptionDetail } from "../types";

interface PrescriptionSheetProps {
  prescription: PrescriptionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionSheet({
  prescription,
  open,
  onOpenChange,
}: PrescriptionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 border-l border-slate-200"
      >
        <AnimatePresence mode="wait">
          {prescription && (
            <PrescriptionContent
              key={prescription.id}
              prescription={prescription}
              onClose={() => onOpenChange(false)}
            />
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

function PrescriptionContent({
  prescription,
  onClose,
}: {
  prescription: PrescriptionDetail;
  onClose: () => void;
}) {
  const {
    patientName,
    patientDocument,
    patientAge,
    doctorName,
    doctorSpecialty,
    date,
    medications,
    publicToken,
  } = prescription;

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Receta Digital
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Token: {publicToken}</p>
        </div>
        <button
          onClick={onClose}
          className="size-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Doctor section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-pharmako-care-light rounded-lg p-1.5">
              <Stethoscope className="w-4 h-4 text-pharmako-care" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Médico tratante
            </h3>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{doctorName}</p>
            <p className="text-sm text-slate-500">{doctorSpecialty}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Patient section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-pharmako-care-light rounded-lg p-1.5">
              <User className="w-4 h-4 text-pharmako-care" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Paciente</h3>
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900">{patientName}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>CI: {patientDocument}</span>
              <span>·</span>
              <span>{patientAge} años</span>
            </div>
          </div>
        </div>

        {/* Medications section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-pharmako-care-light rounded-lg p-1.5">
              <Pill className="w-4 h-4 text-pharmako-care" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Medicamentos
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {medications.map((med, index) => (
              <MedicationRow key={index} medication={med} />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Hash className="w-3 h-3" />
            <span>Receta electrónica verificable · {publicToken}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MedicationRow({
  medication,
}: {
  medication: PrescriptionDetail["medications"][number];
}) {
  const { name, dosage, frequency, duration, quantity } = medication;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-sm font-bold text-slate-900">{name}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5">
        <div>
          <span className="text-xs text-slate-400">Dosis</span>
          <p className="text-sm text-slate-700">{dosage}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Frecuencia</span>
          <p className="text-sm text-slate-700">{frequency}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Duración</span>
          <p className="text-sm text-slate-700">{duration}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Cantidad</span>
          <p className="text-sm font-semibold text-slate-900">
            {quantity} {quantity === 1 ? "unidad" : "unidades"}
          </p>
        </div>
      </div>
    </div>
  );
}
