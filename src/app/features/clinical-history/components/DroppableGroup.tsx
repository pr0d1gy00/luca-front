"use client";

import { useDroppable } from "@dnd-kit/core";

export function DroppableGroup({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-6 transition-all ${
        isOver
          ? "border-blue-400 bg-blue-50 shadow-md"
          : "border-slate-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}
