"use client";

import { useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasBlock } from "./CanvasBlock";
import type { CanvasElement, GridRowBlock as GridRowBlockType } from "../types";

interface GridRowBlockProps {
  element: GridRowBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<GridRowBlockType>) => void;
  onUpdateChildren: (children: CanvasElement[]) => void;
  onDropOnColumn: (columnIndex: number, element: CanvasElement) => void;
}

const COLUMN_GRID: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-4",
};

const GAP_SIZE: Record<"none" | "sm" | "md" | "lg", string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export function GridRowBlock({
  element,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onUpdateChildren,
  onDropOnColumn,
}: GridRowBlockProps) {
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(
    new Set(Array.from({ length: element.columns }, (_, i) => i)),
  );

  function toggleColumn(index: number) {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleColumnDrop(columnIndex: number, element: CanvasElement) {
    onDropOnColumn(columnIndex, element);
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "bg-white rounded-xl border transition-all",
        isSelected
          ? "border-pharmako-primary ring-2 ring-pharmako-primary-light"
          : "border-slate-100 hover:border-slate-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Fila de {element.columns} columnas
        </span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500">
          {element.columns} cols
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

      {/* Columns Grid */}
      <div
        className={cn(
          "p-4 grid",
          COLUMN_GRID[element.columns],
          GAP_SIZE[element.gap ?? "md"],
        )}
      >
        {Array.from({ length: element.columns }).map((_, colIndex) => (
          <ColumnDropZone
            key={colIndex}
            columnIndex={colIndex}
            gridId={element.id}
            columnElements={element.children.filter(
              (_, i) => i % element.columns === colIndex,
            )}
            allChildren={element.children}
            isExpanded={expandedColumns.has(colIndex)}
            onToggleExpand={() => toggleColumn(colIndex)}
            onDrop={handleColumnDrop}
            onUpdateChildren={onUpdateChildren}
          />
        ))}
      </div>
    </div>
  );
}

// ─── COLUMN DROP ZONE ─────────────────────────────────────────
interface ColumnDropZoneProps {
  columnIndex: number;
  columnElements: CanvasElement[];
  allChildren: CanvasElement[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDrop: (columnIndex: number, element: CanvasElement) => void;
  onUpdateChildren: (children: CanvasElement[]) => void;
}

function ColumnDropZone({
  columnIndex,
  columnElements,
  allChildren,
  isExpanded,
  onToggleExpand,
  onDrop,
  onUpdateChildren,
  gridId, // receive grid ID from parent
}: ColumnDropZoneProps & { gridId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-dropzone-${columnIndex}`,
    data: {
      type: "column-dropzone",
      columnIndex,
      gridId, // include grid ID for drop handling
    },
  });

  const handleAdd = (element: CanvasElement) => {
    onDrop(columnIndex, element);
  };

  const handleDragDrop = (droppedElement: CanvasElement) => {
    onDrop(columnIndex, droppedElement);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] rounded-lg border-2 border-dashed transition-colors",
        isOver
          ? "border-pharmako-primary bg-pharmako-primary-light/50"
          : "border-slate-200 hover:border-slate-300",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[10px] font-medium text-slate-400">
          Columna {columnIndex + 1}
        </span>
        <button
          onClick={() =>
            handleAdd({
              id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type: "text-short",
              title: "Nuevo Campo",
            })
          }
          className="p-0.5 rounded text-slate-400 hover:text-pharmako-primary hover:bg-pharmako-primary-light transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Items in this column */}
      <div className="space-y-2 px-2 pb-2">
        {columnElements.length > 0 ? (
          columnElements.map((child) => (
            <SortableContext
              key={child.id}
              items={[child.id]}
              strategy={verticalListSortingStrategy}
            >
              <div className="relative group">
                <CanvasBlock
                  element={child}
                  isSelected={false}
                  onSelect={() => {}}
                  onDelete={() => {
                    const updated = allChildren.filter(
                      (c) => c.id !== child.id,
                    );
                    onUpdateChildren(updated);
                  }}
                />
              </div>
            </SortableContext>
          ))
        ) : (
          <div className="flex items-center justify-center h-16 text-center">
            <p className="text-xs text-slate-400">Arrastra un bloque aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}
