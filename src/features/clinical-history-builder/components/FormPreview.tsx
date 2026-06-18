"use client";

import { useState } from "react";
import type { ClinicalHistorySchema } from "../types";
import { FormRenderer } from "./FormRenderer";

interface FormPreviewProps {
  schema: ClinicalHistorySchema | null;
  isLoading?: boolean;
  onSave?: (values: Record<string, unknown>) => void;
}

export function FormPreview({ schema, isLoading, onSave }: FormPreviewProps) {
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

  function handleSubmit(values: Record<string, unknown>) {
    setSubmitted(values);
    onSave?.(values);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{schema.name}</h1>
        {schema.description && (
          <p className="text-sm text-slate-500 mt-1">{schema.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">
            v{schema.version}
          </span>
          {schema.specialty && (
            <span className="px-2 py-0.5 rounded-full bg-pharmako-primary-light text-xs text-pharmako-primary">
              {schema.specialty}
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <FormRenderer
          elements={schema.canvas.elements}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Submitted data preview */}
      {submitted && (
        <details className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <summary className="text-xs font-medium text-slate-500 cursor-pointer">
            Ver datos enviados ({Object.keys(submitted).length} campos)
          </summary>
          <pre className="mt-2 text-xs text-slate-600 overflow-x-auto">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
