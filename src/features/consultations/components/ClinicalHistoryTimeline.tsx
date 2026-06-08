"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, X, Stethoscope, Pill, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "../schemas";

interface ClinicalHistoryTimelineProps {
  entries: HistoryEntry[];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// Mock full consultation data for preview
const MOCK_FULL_HISTORY: Record<
  string,
  {
    motivo: string;
    examenFisico: string;
    diagnostico: string;
    tratamiento: string;
    medicamentos: { name: string; dose: string; freq: string; dur: string }[];
    vitalSigns: { label: string; value: string }[];
  }
> = {
  "hist-1": {
    motivo: "Dolor de garganta persistente, fiebre de 38.5°C desde hace 2 días",
    examenFisico:
      "Faringe eritematosa con exudado blanquecino, amígdalas inflamadas grado II, ganglios cervicales palpables. TA 120/80, FC 88 bpm, T 38.2°C",
    diagnostico: "Faringitis aguda bacteriana",
    tratamiento:
      "Antibioticoterapia oral, reposo por 3 días, hidratación abundante, control en 7 días",
    medicamentos: [
      {
        name: "Amoxicilina 500mg",
        dose: "1 cápsula",
        freq: "Cada 8 horas",
        dur: "7 días",
      },
    ],
    vitalSigns: [
      { label: "Presión Arterial", value: "120/80 mmHg" },
      { label: "Frecuencia Cardíaca", value: "88 bpm" },
      { label: "Temperatura", value: "38.2°C" },
      { label: "Saturación O₂", value: "98%" },
    ],
  },
  "hist-2": {
    motivo: "Control de rutina anual, sin quejas específicas",
    examenFisico:
      "Examen físico general sin hallazgos patológicos. TA 118/75, FC 72 bpm, peso 65 kg, talla 1.65 m. IMC 23.9",
    diagnostico: "Sin hallazgos patológicos. Paciente en buen estado general",
    tratamiento:
      "Continuar con hábitos saludables, control en 6 meses. Se recomienda realizar perfil lipídico y glicemia de control",
    medicamentos: [],
    vitalSigns: [
      { label: "Presión Arterial", value: "118/75 mmHg" },
      { label: "Frecuencia Cardíaca", value: "72 bpm" },
      { label: "Peso", value: "65 kg" },
      { label: "Talla", value: "1.65 m" },
    ],
  },
};

export function ClinicalHistoryTimeline({
  entries,
}: ClinicalHistoryTimelineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedData = selectedId ? MOCK_FULL_HISTORY[selectedId] : null;

  return (
    <>
      <div className="flex flex-col gap-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="size-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-500">Sin consultas previas</p>
          </div>
        ) : (
          <ol className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {entries.map((entry) => (
              <li key={entry.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-blue-700 ring-4 ring-white" />

                <button
                  onClick={() => setSelectedId(entry.id)}
                  className="w-full text-left bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <time className="text-xs font-medium text-pharmako-care">
                      {formatDate(new Date(entry.date))}
                    </time>
                    <span className="text-xs text-slate-500">
                      {entry.doctorName}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                        Motivo
                      </p>
                      <p className="text-sm text-slate-700">{entry.motivo}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                        Diagnóstico
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {entry.diagnostico}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Full preview modal */}
      <Dialog
        open={selectedId !== null}
        onOpenChange={() => setSelectedId(null)}
      >
        <DialogContent className="sm:max-w-[560px] p-0 border-slate-200">
          <AnimatePresence mode="wait">
            {selectedData && (
              <ConsultationPreview
                key={selectedId}
                data={selectedData}
                onClose={() => setSelectedId(null)}
              />
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConsultationPreview({
  data,
  onClose,
}: {
  data: NonNullable<ReturnType<typeof getPreviewData>>;
  onClose: () => void;
}) {
  const {
    motivo,
    examenFisico,
    diagnostico,
    tratamiento,
    medicamentos,
    vitalSigns,
  } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Detalle de Consulta
        </h2>
        <button
          onClick={onClose}
          className="size-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Vital Signs */}
        {vitalSigns.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-pharmako-care-light rounded-lg p-1.5">
                <Stethoscope className="w-4 h-4 text-pharmako-care" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Signos Vitales
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vitalSigns.map((v) => (
                <div key={v.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{v.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {v.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOAP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-pharmako-care-light rounded-lg p-1.5">
              <FileText className="w-4 h-4 text-pharmako-care" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Notas Clínicas
            </h3>
          </div>

          <Section label="Motivo de Consulta" text={motivo} />
          <Section label="Examen Físico" text={examenFisico} />
          <Section label="Diagnóstico" text={diagnostico} highlight />
          <Section label="Plan de Tratamiento" text={tratamiento} />
        </div>

        {/* Medications */}
        {medicamentos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-pharmako-care-light rounded-lg p-1.5">
                <Pill className="w-4 h-4 text-pharmako-care" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Medicamentos Recetados
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {medicamentos.map((m, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-bold text-slate-900">{m.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{m.dose}</span>
                    <span>·</span>
                    <span>{m.freq}</span>
                    <span>·</span>
                    <span>{m.dur}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Section({
  label,
  text,
  highlight,
}: {
  label: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-sm",
          highlight ? "font-semibold text-slate-900" : "text-slate-700",
        )}
      >
        {text}
      </p>
    </div>
  );
}

function getPreviewData(id: string | null) {
  if (!id) return null;
  return MOCK_FULL_HISTORY[id] ?? null;
}
