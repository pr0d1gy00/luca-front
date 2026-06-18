"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type { SelectorOption } from "../types";

interface FieldOptionsEditorProps {
  options: SelectorOption[];
  onChange: (options: SelectorOption[]) => void;
  minOptions?: number;
}

export function FieldOptionsEditor({
  options,
  onChange,
  minOptions = 1,
}: FieldOptionsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function addOption() {
    const newOption: SelectorOption = {
      value: `opt-${Date.now()}`,
      label: `Nueva opción ${options.length + 1}`,
    };
    onChange([...options, newOption]);
    setEditingIndex(options.length);
  }

  function removeOption(index: number) {
    if (options.length <= minOptions) return;
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
    if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  }

  function updateOption(index: number, field: "label" | "value", raw: string) {
    const updated = options.map((opt, i) => {
      if (i !== index) return opt;
      const value =
        field === "value"
          ? raw
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : raw;
      return { ...opt, [field]: value };
    });
    onChange(updated);
  }

  function moveOption(from: number, to: number) {
    if (to < 0 || to >= options.length) return;
    onChange(arrayMove(options, from, to));
    setEditingIndex(to);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Opciones</span>
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                     text-pharmako-primary bg-pharmako-primary-light hover:bg-pharmako-primary-muted/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Agregar
        </button>
      </div>

      {options.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          Sin opciones. Haz clic en &quot;Agregar&quot;.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {options.map((opt, idx) => (
            <li key={opt.value} className="group flex items-center gap-2">
              {/* Drag handle */}
              <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

              {/* Value (code) */}
              <div className="w-20 flex-shrink-0">
                {editingIndex === idx ? (
                  <input
                    type="text"
                    defaultValue={opt.value}
                    onBlur={(e) => updateOption(idx, "value", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        updateOption(
                          idx,
                          "value",
                          (e.target as HTMLInputElement).value,
                        );
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    className="w-full px-1.5 py-1 rounded border border-slate-200 text-xs text-slate-600 bg-white
                               focus:outline-none focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                  />
                ) : (
                  <button
                    onClick={() => setEditingIndex(idx)}
                    className="w-full text-left px-1.5 py-1 rounded text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 truncate"
                    title="Valor (código interno)"
                  >
                    {opt.value}
                  </button>
                )}
              </div>

              {/* Arrow separator */}
              <span className="text-slate-300 flex-shrink-0">→</span>

              {/* Label */}
              <div className="flex-1 min-w-0">
                {editingIndex === idx ? (
                  <input
                    type="text"
                    defaultValue={opt.label}
                    autoFocus
                    onBlur={(e) => updateOption(idx, "label", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        updateOption(
                          idx,
                          "label",
                          (e.target as HTMLInputElement).value,
                        );
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    className="w-full px-2 py-1 rounded border border-pharmako-primary-muted text-xs text-slate-700 bg-white
                               focus:outline-none focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                  />
                ) : (
                  <button
                    onClick={() => setEditingIndex(idx)}
                    className="w-full text-left px-2 py-1 rounded text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 truncate"
                    title="Haz clic para editar"
                  >
                    {opt.label}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveOption(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-0.5 rounded text-slate-300 hover:text-slate-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOption(idx, idx + 1)}
                  disabled={idx === options.length - 1}
                  className="p-0.5 rounded text-slate-300 hover:text-slate-600 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  disabled={options.length <= minOptions}
                  className="p-0.5 rounded text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {options.length < minOptions && (
        <p className="text-xs text-amber-500 mt-1">
          Se requiere al menos {minOptions} opción{minOptions > 1 ? "es" : ""}.
        </p>
      )}
    </div>
  );
}
