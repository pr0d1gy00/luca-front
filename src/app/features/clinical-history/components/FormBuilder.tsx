"use client";

import { useState } from "react";
import { BuilderCanvas } from "./BuilderCanvas";
import { FieldEditor } from "./FieldEditor";
import { mockTemplate } from "../data/mockForm";
import { ToolboxItem } from "./ToolBoxItem";
export function FormBuilder() {
  const [template, setTemplate] = useState(mockTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedField = template?.groups
    ?.flatMap((g) => g.fields)
    ?.find((f) => f.id === selectedId);

  const updateField = (key: string, value: string | boolean) => {
    setTemplate((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({
        ...g,
        fields: g.fields.map((f) =>
          f.id === selectedId ? { ...f, [key]: value } : f,
        ),
      })),
    }));
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-slate-100 min-h-screen">
      {/* TOOLBOX */}
      <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">Campos</h3>

        <div className="space-y-2">
          <ToolboxItem type="short_text" label="Texto corto" />
          <ToolboxItem type="long_text" label="Texto largo" />
          <ToolboxItem type="number" label="Número" />
          <ToolboxItem type="select" label="Selección" />
        </div>
      </div>

      {/* CANVAS */}
      <div className="col-span-6">
        <BuilderCanvas
          template={template}
          setTemplate={setTemplate}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      </div>

      {/* EDITOR */}
      <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <FieldEditor field={selectedField} onChange={updateField} />
      </div>
    </div>
  );
}
