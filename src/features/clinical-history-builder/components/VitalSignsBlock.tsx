"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type {
  CanvasElement,
  VitalSignsBlock as VitalSignsBlockType,
  VitalSignsField,
  VitalSignsKey,
} from "../types";

interface VitalSignsBlockProps {
  element: VitalSignsBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<VitalSignsBlockType>) => void;
}

const VITAL_SIGNS_OPTIONS: {
  key: VitalSignsKey;
  label: string;
  unit: string;
}[] = [
  { key: "systolic", label: "Presión Sistólica", unit: "mmHg" },
  { key: "diastolic", label: "Presión Diastólica", unit: "mmHg" },
  { key: "heart-rate", label: "Frecuencia Cardíaca", unit: "lpm" },
  { key: "respiratory-rate", label: "Frecuencia Respiratoria", unit: "rpm" },
  { key: "temperature", label: "Temperatura", unit: "°C" },
  { key: "oxygen-saturation", label: "Saturación O₂", unit: "%" },
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "height", label: "Talla", unit: "cm" },
  { key: "bmi", label: "IMC", unit: "kg/m²" },
];

export function VitalSignsBlock({
  element,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: VitalSignsBlockProps) {
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const fields = element.fields ?? [];

  function updateField(key: VitalSignsKey, updates: Partial<VitalSignsField>) {
    const updated = fields.map((f) =>
      f.key === key ? { ...f, ...updates } : f,
    ) as VitalSignsField[];
    onUpdate({ fields: updated });
  }

  function removeField(key: VitalSignsKey) {
    onUpdate({ fields: fields.filter((f) => f.key !== key) });
  }

  function addField(key: VitalSignsKey) {
    const def = VITAL_SIGNS_OPTIONS.find((o) => o.key === key);
    if (!def || fields.find((f) => f.key === key)) return;
    onUpdate({
      fields: [...fields, { key, label: def.label, unit: def.unit }],
    });
  }

  function moveField(from: number, to: number) {
    onUpdate({ fields: arrayMove(fields, from, to) as VitalSignsField[] });
  }

  const selectedOptions = fields.map((f) => f.key);
  const availableOptions = VITAL_SIGNS_OPTIONS.filter(
    (o) => !selectedOptions.includes(o.key),
  );

  return (
    <div
      onClick={onSelect}
      className={cn(
        "bg-white rounded-xl border transition-all overflow-hidden",
        isSelected
          ? "border-pharmako-primary ring-2 ring-pharmako-primary-light"
          : "border-slate-100 hover:border-slate-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700">
            {element.title || "Signos Vitales"}
          </p>
          {element.description && (
            <p className="text-xs text-slate-400 mt-0.5">
              {element.description}
            </p>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-50 text-xs text-red-400">
          ❤️ {fields.length} campos
        </span>
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fields grid */}
      <div className="p-4">
        {fields.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {fields.map((field, idx) => (
              <div
                key={field.key}
                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                {/* Drag handle */}
                <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

                {/* Field content */}
                <div className="flex-1 min-w-0">
                  {editingLabel === field.key ? (
                    <input
                      type="text"
                      defaultValue={field.label}
                      autoFocus
                      onBlur={(e) => {
                        updateField(field.key, { label: e.target.value });
                        setEditingLabel(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateField(field.key, {
                            label: (e.target as HTMLInputElement).value,
                          });
                          setEditingLabel(null);
                        }
                        if (e.key === "Escape") setEditingLabel(null);
                      }}
                      className="w-full px-1.5 py-0.5 rounded border border-pharmako-primary-muted text-xs text-slate-700 bg-white
                                 focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20"
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLabel(field.key);
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-pharmako-primary transition-colors text-left w-full truncate"
                      title="Haz clic para editar la etiqueta"
                    >
                      {field.label}
                    </button>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={undefined}
                      placeholder="--"
                      min={field.min}
                      max={field.max}
                      onClick={(e) => e.stopPropagation()}
                      className="w-14 px-1.5 py-0.5 rounded border border-slate-100 text-xs text-slate-700 bg-white
                                 focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20 focus:border-pharmako-primary"
                    />
                    <span className="text-xs text-slate-400">{field.unit}</span>
                  </div>
                </div>

                {/* Range indicators */}
                <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(idx, idx - 1);
                    }}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-slate-300 hover:text-slate-500 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(idx, idx + 1);
                    }}
                    disabled={idx === fields.length - 1}
                    className="p-0.5 rounded text-slate-300 hover:text-slate-500 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.key);
                    }}
                    className="p-0.5 rounded text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Sin campos configurados
          </p>
        )}

        {/* Add field */}
        <div className="mt-3">
          <div className="flex items-center gap-1 flex-wrap">
            {availableOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={(e) => {
                  e.stopPropagation();
                  addField(opt.key);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500
                            bg-slate-50 border border-slate-100 hover:border-pharmako-primary-hover hover:text-pharmako-primary
                            hover:bg-pharmako-primary-light transition-colors"
              >
                <Plus className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
