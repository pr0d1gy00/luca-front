"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormPreview } from "@/features/clinical-history-builder/components/FormPreview";
import { useClinicalHistorySchema } from "@/lib/api/clinical-history/schema";

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useClinicalHistorySchema(id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="h-14 flex items-center gap-3 px-4 bg-white border-b border-slate-100 flex-shrink-0">
        <Link
          href="/features/clinical-history/builder"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600
                     hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Builder
        </Link>

        <div className="w-px h-5 bg-slate-200" />

        <div>
          <h1 className="text-sm font-semibold text-slate-900">Vista Previa</h1>
          <p className="text-xs text-slate-500">
            Completar historia clínica para paciente
          </p>
        </div>
      </header>

      {/* Preview */}
      <div className="py-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-slate-500">Cargando formulario...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
              Error al cargar el formulario: {(error as Error).message}
            </div>
          </div>
        )}

        {data?.schema && (
          <FormPreview
            schema={data.schema}
            isLoading={isLoading}
            onSave={(values) => {
              console.log("[Preview] Submitted values:", values);
              // TODO: POST to /api/clinical-history
            }}
          />
        )}
      </div>
    </div>
  );
}
