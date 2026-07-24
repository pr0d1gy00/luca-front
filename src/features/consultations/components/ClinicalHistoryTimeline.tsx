"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, X, Stethoscope, Pill, FileText, Dna } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "../schemas";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";

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
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setPreviewData(null);
      return;
    }

    if (selectedId.startsWith("hist-")) {
      setPreviewData(MOCK_FULL_HISTORY[selectedId] ?? null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoadingPreview(true);
      try {
        let detailData: any = null;

        // 1. Intentar buscar en Dexie local
        const localConsult = await db.consultations.where("uuid").equals(selectedId).first();
        if (localConsult) {
          const localVitals = await db.vitalSigns.where("consultationUuid").equals(selectedId).first();
          const allPrescriptions = await db.prescriptions.toArray();
          const localPrescriptions = allPrescriptions.filter(
            (rx) => rx.consultationUuid === selectedId
          );
          const items: any[] = [];

          for (const rx of localPrescriptions) {
            const rxItems = await db.prescriptionItems.where("prescriptionUuid").equals(rx.uuid).toArray();
            for (const item of rxItems) {
              const med = await db.medications.where("uuid").equals(item.medicationUuid).first();
              items.push({
                name: med ? `${med.activePrinciple} (${med.commercialName})` : "Medicamento",
                dose: item.dose || "",
                freq: item.frequency || "",
                dur: item.duration || "",
              });
            }
          }

          const vitalsList: { label: string; value: string }[] = [];
          if (localVitals) {
            if (localVitals.weight) vitalsList.push({ label: "Peso", value: `${localVitals.weight} kg` });
            if (localVitals.height) vitalsList.push({ label: "Talla", value: `${localVitals.height} m` });
            if (localVitals.systolicBp && localVitals.diastolicBp) {
              vitalsList.push({ label: "Presión Arterial", value: `${localVitals.systolicBp}/${localVitals.diastolicBp} mmHg` });
            }
            if (localVitals.heartRate) vitalsList.push({ label: "Frecuencia Cardíaca", value: `${localVitals.heartRate} bpm` });
            if (localVitals.temperature) vitalsList.push({ label: "Temperatura", value: `${localVitals.temperature} °C` });
            if (localVitals.oxygenSat) vitalsList.push({ label: "Saturación O₂", value: `${localVitals.oxygenSat} %` });
          }

          const allLabRequests = await db.labRequests.toArray();
          const localLabs = allLabRequests.filter(
            (req) => req.consultationUuid === selectedId && !req.deletedAt
          );
          const labsList = localLabs.map((l) => ({
            examsList: l.examsList || [],
            instructions: l.instructions || "",
          }));

          detailData = {
            motivo: localConsult.reason || "Sin motivo registrado",
            examenFisico: localConsult.physicalExam || "Sin hallazgos registrados",
            diagnostico: localConsult.diagnosis || "Sin diagnóstico registrado",
            tratamiento: localConsult.treatmentPlan || "Sin indicaciones registradas",
            medicamentos: items,
            vitalSigns: vitalsList,
            laboratorios: labsList,
          };
        }

        // 2. Intentar buscar en la API online para tener los datos frescos
        try {
          const { data: res } = await apiClient.get(`/consultations/${selectedId}`);
          const apiConsult = res.data;

          if (apiConsult) {
            const vitalsList: { label: string; value: string }[] = [];
            const apiVitals = apiConsult.vital_sign;
            if (apiVitals) {
              if (apiVitals.weight) vitalsList.push({ label: "Peso", value: `${apiVitals.weight} kg` });
              if (apiVitals.height) vitalsList.push({ label: "Talla", value: `${apiVitals.height} m` });
              if (apiVitals.systolic_bp && apiVitals.diastolic_bp) {
                vitalsList.push({ label: "Presión Arterial", value: `${apiVitals.systolic_bp}/${apiVitals.diastolic_bp} mmHg` });
              }
              if (apiVitals.heart_rate) vitalsList.push({ label: "Frecuencia Cardíaca", value: `${apiVitals.heart_rate} bpm` });
              if (apiVitals.temperature) vitalsList.push({ label: "Temperatura", value: `${apiVitals.temperature} °C` });
              if (apiVitals.oxygen_sat) vitalsList.push({ label: "Saturación O₂", value: `${apiVitals.oxygen_sat} %` });
            }

            const items: any[] = [];
            const apiRx = apiConsult.prescription;
            if (apiRx && apiRx.items) {
              for (const item of apiRx.items) {
                const med = item.medication;
                items.push({
                  name: med ? `${med.active_principle} (${med.commercial_name})` : "Medicamento",
                  dose: item.dose || "",
                  freq: item.frequency || "",
                  dur: item.duration || "",
                });
              }
            }

            const labsList: { examsList: string[], instructions: string }[] = [];
            const apiLab = apiConsult.lab_request;
            if (apiLab) {
              labsList.push({
                examsList: apiLab.exams_list || [],
                instructions: apiLab.instructions || "",
              });
            }

            detailData = {
              motivo: apiConsult.reason || "Sin motivo registrado",
              examenFisico: apiConsult.physical_exam || "Sin hallazgos registrados",
              diagnostico: apiConsult.diagnosis || "Sin diagnóstico registrado",
              tratamiento: apiConsult.treatment_plan || "Sin indicaciones registradas",
              medicamentos: items,
              vitalSigns: vitalsList,
              laboratorios: labsList,
            };
          }
        } catch (apiErr) {
          console.warn("Could not fetch consultation detail from API, using local/cached version:", apiErr);
        }

        if (detailData) {
          setPreviewData(detailData);
        }
      } catch (err) {
        console.error("Error fetching consultation detail:", err);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchDetail();
  }, [selectedId]);

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
                <div className="absolute left-[-9px] top-[50%] size-4 rounded-full bg-pharmako-care ring-4 ring-white" />

                <button
                  onClick={() => setSelectedId(entry.id)}
                  className="w-full text-left rounded-2xl p-5 border border-slate-200 hover:bg-pharmako-care/10 hover:border-pharmako-care transition-all cursor-pointer"
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
        <DialogContent
          className="sm:max-w-[560px] 2xl:max-w-[800px] p-0 border-slate-200 bg-white rounded-xl overflow-hidden"
          showCloseButton={false}
        >
          <AnimatePresence mode="wait">
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3 bg-white min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pharmako-care"></div>
                <span className="text-xs text-slate-500 font-medium">Cargando detalles de consulta...</span>
              </div>
            ) : previewData ? (
              <ConsultationPreview
                key={selectedId}
                data={previewData}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-16 gap-3 bg-white min-h-[300px]">
                <span className="text-xs text-slate-400 font-medium">No se encontraron detalles para esta consulta.</span>
              </div>
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
      className="flex flex-col max-h-[85vh] w-full"
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
              <div className="rounded-lg p-1.5">
                <Stethoscope className="w-6 h-6 text-pharmako-care" />
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
            <div className="rounded-lg p-1.5">
              <FileText className="w-6 h-6 text-pharmako-care" />
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
              <div className="rounded-lg p-1.5">
                <Pill className="w-6 h-6 text-pharmako-care" />
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

        {/* Laboratorios */}
        {data.laboratorios && data.laboratorios.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5">
                <Dna className="w-6 h-6 text-pharmako-care" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Exámenes de Laboratorios Solicitados
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {data.laboratorios.map((l: any, i: number) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(l.examsList || []).map((exam: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                  {l.instructions && (
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-semibold text-slate-700">Indicaciones: </span>
                      {l.instructions}
                    </p>
                  )}
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
