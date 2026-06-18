"use client";

import { useState } from "react";
import {
  X,
  Columns2,
  Columns3,
  FolderOpen,
  Minus,
  Heading,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  ToggleLeft,
  Heart,
  Stethoscope,
  Paperclip,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ActiveToolboxTab, ActivePanelTab } from "../types";
import type { CanvasElement } from "../types";
import { ToolboxItem } from "./ToolboxItem";

interface MobilePanelsProps {
  activeToolboxTab: ActiveToolboxTab;
  onToolboxTabChange: (tab: ActiveToolboxTab) => void;
  onAddElement: (element: CanvasElement) => void;
  canvasElements: CanvasElement[];
  selectedElement: CanvasElement | null;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  activePanelTab: ActivePanelTab;
  onPanelTabChange: (tab: ActivePanelTab) => void;
  onSelectElement: (id: string | null) => void;
}

const TOOLBOX_BLOCKS = {
  structural: [
    {
      type: "grid-row",
      label: "Fila de 2 Columnas",
      icon: Columns2,
      description: "Divide el espacio en 2 columnas",
    },
    {
      type: "grid-row",
      label: "Fila de 3 Columnas",
      icon: Columns3,
      description: "Divide el espacio en 3 columnas",
    },
    {
      type: "section",
      label: "Sección / Acordeón",
      icon: FolderOpen,
      description: "Grupo collapsible de campos",
    },
    {
      type: "visual-separator",
      label: "Separador Visual",
      icon: Minus,
      description: "Línea o espacio divisor",
    },
    {
      type: "section-title",
      label: "Título de Sección",
      icon: Heading,
      description: "Encabezado decorativo",
    },
  ],
  basic: [
    {
      type: "text-short",
      label: "Texto Corto",
      icon: Type,
      description: "Campo de una línea",
    },
    {
      type: "text-paragraph",
      label: "Párrafo",
      icon: AlignLeft,
      description: "Área de texto multilínea",
    },
    {
      type: "number",
      label: "Número",
      icon: Hash,
      description: "Campo numérico con validación",
    },
    {
      type: "datetime",
      label: "Fecha / Hora",
      icon: Calendar,
      description: "Selector de fecha y/u hora",
    },
    {
      type: "checkbox-multiple",
      label: "Checkbox Múltiple",
      icon: CheckSquare,
      description: "Selección múltiple de opciones",
    },
    {
      type: "dropdown",
      label: "Desplegable",
      icon: ChevronDown,
      description: "Selector de una opción",
    },
    {
      type: "toggle",
      label: "Interruptor (Toggle)",
      icon: ToggleLeft,
      description: "Encendido / Apagado",
    },
  ],
  clinical: [
    {
      type: "vital-signs",
      label: "Signos Vitales",
      icon: Heart,
      description: "Grupo de signos vitales integrados",
    },
    {
      type: "cie10-selector",
      label: "Diagnóstico CIE-10",
      icon: Stethoscope,
      description: "Selector de diagnóstico CIE-10",
    },
    {
      type: "file-upload",
      label: "Subida de Archivos",
      icon: Paperclip,
      description: "Adjunta imágenes o documentos",
    },
  ],
};

export function MobileToolboxPanel({
  activeTab,
  onTabChange,
  onAddElement,
}: {
  activeTab: ActiveToolboxTab;
  onTabChange: (tab: ActiveToolboxTab) => void;
  onAddElement: (element: CanvasElement) => void;
}) {
  const categories: { id: ActiveToolboxTab; label: string }[] = [
    { id: "structural", label: "Estructura" },
    { id: "basic", label: "Campos" },
    { id: "clinical", label: "Clínicos" },
  ];

  const blocks = TOOLBOX_BLOCKS[activeTab];

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-4 py-3 border-b border-slate-100">
        <SheetTitle className="text-sm font-semibold text-slate-900">
          Herramientas
        </SheetTitle>
      </SheetHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onTabChange(cat.id)}
            className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === cat.id
                ? "text-pharmako-primary border-b-2 border-pharmako-primary bg-pharmako-primary-light"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {blocks.map((block) => (
          <ToolboxItem
            key={`${block.type}-${block.label}`}
            blockType={block.type}
            label={block.label}
            icon={block.icon}
            description={block.description}
            onAdd={() =>
              onAddElement({
                id: `mobile-${Date.now()}`,
                type: block.type,
                title: block.label,
              } as unknown as CanvasElement)
            }
          />
        ))}
      </div>
    </div>
  );
}

export function MobilePropertiesPanel({
  selectedElement,
  onUpdate,
  onDelete,
  activeTab,
  onTabChange,
}: {
  selectedElement: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  activeTab: ActivePanelTab;
  onTabChange: (tab: ActivePanelTab) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-4 py-3 border-b border-slate-100">
        <SheetTitle className="text-sm font-semibold text-slate-900">
          Propiedades
        </SheetTitle>
      </SheetHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => onTabChange("properties")}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "properties"
              ? "text-pharmako-primary border-b-2 border-pharmako-primary bg-pharmako-primary-light"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Propiedades
        </button>
        <button
          onClick={() => onTabChange("layers")}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "layers"
              ? "text-pharmako-primary border-b-2 border-pharmako-primary bg-pharmako-primary-light"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Capas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedElement ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Título
              </label>
              <input
                type="text"
                value={selectedElement.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Descripción
              </label>
              <textarea
                value={selectedElement.description ?? ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600">
                Obligatorio
              </label>
              <button
                onClick={() =>
                  onUpdate({ required: !selectedElement.required })
                }
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  selectedElement.required
                    ? "bg-pharmako-primary"
                    : "bg-slate-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                    selectedElement.required ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Ancho
              </label>
              <select
                value={selectedElement.width ?? "full"}
                onChange={(e) =>
                  onUpdate({ width: e.target.value as CanvasElement["width"] })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
              >
                <option value="full">Ancho Completo</option>
                <option value="2/3">2/3</option>
                <option value="1/2">1/2</option>
                <option value="1/3">1/3</option>
                <option value="1/4">1/4</option>
              </select>
            </div>

            <button
              onClick={() => onDelete(selectedElement.id)}
              className="w-full mt-2 px-3 py-2 rounded-xl text-sm font-medium bg-pharmako-danger-light text-pharmako-danger hover:bg-pharmako-danger-light/80 transition-colors"
            >
              Eliminar bloque
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-sm text-slate-500">Sin bloque seleccionado</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Toca un bloque del lienzo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV BAR FOR MOBILE ─────────────────────────────────
export function MobileBottomNav({
  onOpenToolbox,
  onOpenProperties,
}: {
  onOpenToolbox: () => void;
  onOpenProperties: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-1.5">
      <button
        onClick={onOpenToolbox}
        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        Bloques
      </button>
      <button
        onClick={onOpenProperties}
        className="px-4 py-2 rounded-xl text-sm font-medium text-pharmako-primary bg-pharmako-primary-light transition-colors"
      >
        Editar
      </button>
    </div>
  );
}

// ─── COMPOSED MOBILE SHEETS WRAPPER ────────────────────────────
export function MobileBuilderSheets({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
