"use client";

import { useDraggable } from "@dnd-kit/core";

export function ToolboxItem({ type, label }: { type: string; label: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `tool-${type}`,
    data: {
      fromToolbox: true,
      type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-grab transition active:cursor-grabbing shadow-sm"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">
        +
      </div>

      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}
