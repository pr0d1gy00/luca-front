"use client";

import { useState } from "react";
import {
  Eye,
  FileText,
  User,
  Printer,
  Building2,
  Calendar,
  Lock,
} from "lucide-react";
import type { ClinicalHistorySchema } from "../types";
import { FormRenderer } from "./FormRenderer";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  schema: ClinicalHistorySchema | null;
  isLoading?: boolean;
  onSave?: (values: Record<string, unknown>) => void;
}

export function FormPreview({ schema, isLoading, onSave }: FormPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"doctor" | "pdf" | "patient">(
    "doctor",
  );
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-sm text-slate-500">Cargando esquema...</p>
        </div>
      </div>
    );
  }

  function handleFormChange(values: Record<string, unknown>) {
    setFormValues(values);
  }

  function handleSubmit(values: Record<string, unknown>) {
    setSubmitted(values);
    onSave?.(values);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sub-header inside preview for mode switching */}
      <div className="bg-white border-b border-slate-100 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setPreviewMode("doctor")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              previewMode === "doctor"
                ? "bg-white text-pharmako-care shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Vista Médico
          </button>
          <button
            onClick={() => setPreviewMode("pdf")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              previewMode === "pdf"
                ? "bg-white text-pharmako-care shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Vista PDF / Impresión
          </button>
          <button
            onClick={() => setPreviewMode("patient")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              previewMode === "patient"
                ? "bg-white text-pharmako-care shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <User className="w-3.5 h-3.5" />
            Vista Paciente
          </button>
        </div>

        {previewMode === "pdf" && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Descargar PDF
          </button>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {/* DOCTOR VIEW MODE */}
        {previewMode === "doctor" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-pharmako-care-light text-pharmako-care shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-pharmako-care-light text-[9px] text-pharmako-care font-bold tracking-wider uppercase">
                      {schema.specialty?.replace("-", " ") || "General"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      v{schema.version}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {schema.name}
                  </h1>
                  {schema.description && (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {schema.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Tipo de Registro
                </span>
                <span className="text-sm font-semibold text-slate-700 block mt-0.5">
                  Plantilla de Historia Clínica
                </span>
              </div>
            </div>

            {/* Live Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
              <FormRenderer
                elements={schema.canvas.elements}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                mode="doctor"
                onValuesChange={handleFormChange}
              />
            </div>

            {submitted && (
              <details className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                <summary className="text-xs font-medium text-slate-500 cursor-pointer">
                  Ver datos enviados ({Object.keys(submitted).length} campos)
                </summary>
                <pre className="mt-2 text-xs text-slate-650 overflow-x-auto">
                  {JSON.stringify(submitted, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* PDF / PRINT VIEW MODE (A4 sheet replica) */}
        {previewMode === "pdf" && (
          <div className="w-full max-w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-2xl p-[1.5cm] sm:p-[2cm] border border-slate-200 aspect-[1/1.414] rounded-sm print:shadow-none print:p-0 print:border-none print:max-w-full print:min-h-0">
            <div className="h-full flex flex-col justify-between">
              <div>
                {/* PDF Label stamp */}
                <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 print:hidden">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Hoja de Impresión Clínica (A4)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Vista Vectorial PDF
                  </span>
                </div>

                {/* Form Elements Rendered in PDF style (Read-only) */}
                <div className="space-y-6">
                  <FormRenderer
                    elements={schema.canvas.elements}
                    mode="pdf"
                    defaultValues={formValues}
                  />
                </div>
              </div>

              {/* PDF Footer */}
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>
                  Generado automáticamente por LUCA Health OS · Ficha Clínica
                </span>
                <span>Página 1 de 1</span>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT VIEW MODE (Luca Patient Portal styling) */}
        {previewMode === "patient" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Patient Header Stamp */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start gap-4">
                {/* Clean page icon */}
                <div className="shrink-0 p-2.5 bg-pharmako-care/10 text-slate-400 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center w-12 h-12">
                  <User className="w-5 h-5 text-pharmako-care" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      Mi Portal Luca
                    </span>
                    {schema.specialty && (
                      <span className="px-2 py-0.5 rounded bg-pharmako-care-light text-[9px] text-pharmako-care font-bold uppercase tracking-wider">
                        {schema.specialty.replace("-", " ")}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Mi Historial Clínico
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-light leading-relaxed">
                    Ficha clínica oficial registrada y firmada digitalmente por
                    tu médico tratante.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-4 text-[10px] text-slate-400 font-medium pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pharmako-care" />
                  Actualizado hoy
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pharmako-care" />
                  Registro Protegido
                </span>
              </div>
            </div>

            {/* Patient Card View */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
              <FormRenderer
                elements={schema.canvas.elements}
                mode="patient"
                defaultValues={formValues}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
