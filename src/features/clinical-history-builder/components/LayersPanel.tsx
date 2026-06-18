"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  CheckSquare,
  ChevronDown as DropdownIcon,
  ToggleLeft,
  Heart,
  Search,
  Paperclip,
  Columns2,
  FolderOpen,
  Minus,
  Heading,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasElement } from "../types";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

interface TreeItemProps {
  element: CanvasElement;
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  depth: number;
}

function getBlockIcon(type: string, className = "w-3.5 h-3.5 text-slate-400") {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    "text-short": Type,
    "text-paragraph": AlignLeft,
    number: Hash,
    datetime: Calendar,
    "checkbox-multiple": CheckSquare,
    dropdown: DropdownIcon,
    toggle: ToggleLeft,
    "vital-signs": Heart,
    "cie10-selector": Search,
    "file-upload": Paperclip,
    "grid-row": Columns2,
    section: FolderOpen,
    "visual-separator": Minus,
    "section-title": Heading,
  };
  const IconComp = icons[type] ?? HelpCircle;
  return <IconComp className={className} />;
}

function TreeItem({
  element,
  selectedId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDelete,
  onMove,
  depth,
}: TreeItemProps) {
  const isSelected = selectedId === element.id;
  const isExpanded = expandedIds.has(element.id);
  const hasChildren = "children" in element && element.children.length > 0;
  const isContainer =
    hasChildren || element.type === "grid-row" || element.type === "section";

  return (
    <div className="select-none">
      {/* Row */}
      <div
        onClick={() => onSelect(element.id)}
        className={cn(
          "group flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all border border-transparent",
          isSelected
            ? "bg-pharmako-primary-light border-pharmako-primary-muted/65 shadow-xs"
            : "hover:bg-slate-50",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand toggle */}
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(element.id);
            }}
            className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-4.5" />
        )}

        {/* Drag handle */}
        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0 cursor-grab" />

        {/* Type icon */}
        <div
          className={cn(
            "flex items-center justify-center p-1 rounded-lg shrink-0 transition-colors border border-transparent",
            isSelected
              ? "bg-pharmako-primary-light/50 text-pharmako-primary"
              : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-pharmako-primary group-hover:bg-pharmako-primary-light group-hover:border-pharmako-primary-muted/40",
          )}
        >
          {getBlockIcon(
            element.type,
            isSelected
              ? "w-3.5 h-3.5 text-pharmako-primary"
              : "w-3.5 h-3.5 text-slate-400",
          )}
        </div>

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-xs truncate",
            isSelected
              ? "text-pharmako-primary font-semibold"
              : "text-slate-600 font-medium group-hover:text-slate-900",
          )}
        >
          {element.title || "Sin título"}
        </span>

        {/* Action buttons in hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(element.id, "up");
            }}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title="Mover arriba"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(element.id, "down");
            }}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title="Mover abajo"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleHidden(element.id);
            }}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title={element.hidden ? "Mostrar" : "Ocultar"}
          >
            {element.hidden ? (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lock indicator (if locked and not hovered) */}
        {element.locked && (
          <div className="group-hover:hidden flex items-center justify-center ml-auto shrink-0 pl-1">
            <Lock className="w-3.5 h-3.5 text-pharmako-warning" />
          </div>
        )}
      </div>

      {/* Children elements */}
      {isContainer && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {"children" in element &&
            (element.children as CanvasElement[]).map((child) => (
              <TreeItem
                key={child.id}
                element={child}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onToggleHidden={onToggleHidden}
                onDelete={onDelete}
                onMove={onMove}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleHidden,
  onDelete,
  onMove,
}: LayersPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <p className="text-sm text-slate-500">Lienzo vacío</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Arrastra bloques para ver las capas
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {elements.map((element) => (
        <TreeItem
          key={element.id}
          element={element}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onSelect={onSelect}
          onToggleHidden={onToggleHidden}
          onDelete={onDelete}
          onMove={onMove}
          depth={0}
        />
      ))}
    </div>
  );
}
