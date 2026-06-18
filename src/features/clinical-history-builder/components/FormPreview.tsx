"use client";

import { useState } from "react";
import { Eye, FileText, User, Printer } from "lucide-react";
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
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h1 className="text-xl font-bold text-slate-900">
                {schema.name}
              </h1>
              {schema.description && (
                <p className="text-sm text-slate-500 mt-1">
                  {schema.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-semibold">
                  VERSIÓN {schema.version}
                </span>
                {schema.specialty && (
                  <span className="px-2 py-0.5 rounded-full bg-pharmako-care-light text-[10px] text-pharmako-care font-semibold">
                    {schema.specialty.toUpperCase()}
                  </span>
                )}
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
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Patient Header Stamp */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                  Mi Portal Luca
                </span>
                <h2 className="text-xl font-bold mt-1">Mi Historial Clínico</h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Ficha registrada y firmada digitalmente por tu médico
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold block">
                  {schema.specialty || "Consulta General"}
                </span>
                <span className="text-[10px] text-white/70">
                  Actualizado hoy
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
