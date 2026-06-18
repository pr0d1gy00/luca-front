"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, EyeOff, Asterisk } from "lucide-react";
import type { CanvasElement, HeaderBlock } from "../types";

interface CanvasBlockProps {
  element: CanvasElement;
  isSelected: boolean;
  isOverlay?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export function CanvasBlock({
  element,
  isSelected,
  isOverlay = false,
  onSelect,
  onDelete,
}: CanvasBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      type: "canvas-item",
      element,
    },
    disabled: element.locked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const borderClass = isSelected
    ? "border-pharmako-care ring-2 ring-pharmako-care-light"
    : isDragging
      ? "border-pharmako-care/40 border-dashed opacity-60"
      : "border-slate-100 hover:border-slate-200";

  const shadowClass = isDragging ? "shadow-lg" : "hover:shadow-sm";

  // ─── Block Type Visual ─────────────────────────────
  function renderBlockPreview(el: CanvasElement) {
    switch (el.type) {
      case "header": {
        const headerEl = el as HeaderBlock;
        return (
          <div
            className={`p-4 rounded-xl border border-slate-150 ${
              headerEl.style === "boxed" ? "bg-slate-50" : "bg-white"
            } ${headerEl.style === "bordered" ? "border-2" : ""}`}
          >
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 ${
                headerEl.logoPosition === "right"
                  ? "sm:flex-row-reverse"
                  : headerEl.logoPosition === "center"
                    ? "sm:flex-col text-center"
                    : ""
              }`}
            >
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {headerEl.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={headerEl.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">[Logo]</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">
                  {headerEl.titleText || "Nombre de la Clínica / Profesional"}
                </h3>
                {headerEl.subtitleText && (
                  <p className="text-xs text-slate-500 font-medium">
                    {headerEl.subtitleText}
                  </p>
                )}
                {headerEl.contactInfo && (
                  <p className="text-[10px] text-slate-400 mt-1 whitespace-pre-line">
                    {headerEl.contactInfo}
                  </p>
                )}
              </div>
            </div>
            {headerEl.showPatientData && (
              <div className="mt-4 pt-3 border-t border-dashed border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                {headerEl.patientDataFields?.includes("name") && (
                  <div>
                    <strong>Paciente:</strong>{" "}
                    <span className="text-slate-400">Juan Pérez</span>
                  </div>
                )}
                {headerEl.patientDataFields?.includes("idNumber") && (
                  <div>
                    <strong>DNI / ID:</strong>{" "}
                    <span className="text-slate-400">12.345.678</span>
                  </div>
                )}
                {headerEl.patientDataFields?.includes("age") && (
                  <div>
                    <strong>Edad:</strong>{" "}
                    <span className="text-slate-400">35 años</span>
                  </div>
                )}
                {headerEl.patientDataFields?.includes("date") && (
                  <div>
                    <strong>Fecha:</strong>{" "}
                    <span className="text-slate-400">18/06/2026</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      case "text-short":
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100" />
        );
      case "text-paragraph":
        return (
          <div className="h-16 bg-slate-50 rounded-lg border border-slate-100" />
        );
      case "number":
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2">
            <span className="text-xs text-slate-400">0</span>
          </div>
        );
      case "datetime":
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2 gap-1.5">
            <span className="text-xs text-slate-400">📅</span>
            <span className="text-xs text-slate-400">Seleccionar fecha</span>
          </div>
        );
      case "toggle":
        return (
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 rounded-full bg-slate-200" />
            <span className="text-xs text-slate-400">
              {el.labelOff ?? "No"}
            </span>
          </div>
        );
      case "dropdown":
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">Seleccionar...</span>
            <span className="text-xs text-slate-400">▼</span>
          </div>
        );
      case "checkbox-multiple":
        return (
          <div className="space-y-1">
            {(el.options ?? []).slice(0, 3).map((opt) => (
              <div key={opt.value} className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border border-slate-300" />
                <span className="text-xs text-slate-400">{opt.label}</span>
              </div>
            ))}
          </div>
        );
      case "vital-signs":
        return (
          <div className="grid grid-cols-2 gap-2">
            {el.fields?.slice(0, 4).map((field) => (
              <div
                key={field.key}
                className="h-10 bg-slate-50 rounded-lg border border-slate-100 p-2"
              >
                <p className="text-[10px] text-slate-400">{field.label}</p>
                <p className="text-xs text-slate-600 font-medium">
                  -- {field.unit}
                </p>
              </div>
            ))}
          </div>
        );
      case "cie10-selector":
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2 gap-1.5">
            <span className="text-xs text-slate-400">🔍</span>
            <span className="text-xs text-slate-400">
              Buscar diagnóstico CIE-10...
            </span>
          </div>
        );
      case "file-upload":
        return (
          <div className="h-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-xs text-slate-400">📎 Adjuntar archivos</span>
          </div>
        );
      case "grid-row":
        return (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${el.columns}, 1fr)` }}
          >
            {Array.from({ length: el.columns }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center"
              >
                <span className="text-xs text-slate-400">Col {i + 1}</span>
              </div>
            ))}
          </div>
        );
      case "section":
        return (
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="space-y-1">
              {el.children?.slice(0, 2).map((child) => (
                <div
                  key={child.id}
                  className="h-6 bg-slate-50 rounded border border-slate-100"
                />
              ))}
            </div>
          </div>
        );
      case "section-title":
        return <div className="h-6 bg-slate-100 rounded w-2/3" />;
      case "visual-separator":
        return <div className="h-px bg-slate-200" />;
      default:
        return (
          <div className="h-8 bg-slate-50 rounded-lg border border-slate-100" />
        );
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`
        relative bg-white rounded-xl border ${borderClass} ${shadowClass}
        transition-all cursor-pointer group
        ${isOverlay ? "shadow-xl cursor-grabbing" : ""}
        ${element.locked ? "opacity-75" : ""}
      `}
    >
      {/* ── Header Row ────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        {/* Drag Handle */}
        {!element.locked && (
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-0.5 -ml-2 rounded text-slate-300 hover:text-slate-500
                       hover:bg-slate-100 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-slate-700 truncate">
              {element.title || "Sin título"}
            </p>
            {element.required && (
              <Asterisk className="w-3 h-3 text-pharmako-care flex-shrink-0" />
            )}
          </div>
          {element.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {element.description}
            </p>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {element.locked && (
            <span className="p-1 rounded bg-amber-50 text-amber-500">
              <Lock className="w-3 h-3" />
            </span>
          )}
          {element.hidden && (
            <span className="p-1 rounded bg-slate-100 text-slate-400">
              <EyeOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* ── Block Type Badge ──────────────────────── */}
      <div className="px-4 pb-2">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-medium">
          {element.type}
        </span>
      </div>

      {/* ── Preview / Children ────────────────────── */}
      <div className="px-4 pb-4">{renderBlockPreview(element)}</div>

      {/* ── Delete Button ──────────────────────────── */}
      {isSelected && !element.locked && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium
                     bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
