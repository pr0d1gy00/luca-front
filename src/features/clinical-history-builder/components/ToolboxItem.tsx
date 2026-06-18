"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ComponentType } from "react";

interface ToolboxItemProps {
  blockType: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  onAdd?: () => void;
}

export function ToolboxItem({
  blockType,
  label,
  icon: Icon,
  description,
  onAdd,
}: ToolboxItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `toolbox-${blockType}-${label}`,
      data: {
        type: "toolbox-item",
        elementType: blockType,
        isNew: true,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      className={`
        w-full flex items-center gap-3 p-2 rounded-xl text-left
        bg-white hover:bg-slate-50 border border-slate-100/60 hover:border-slate-200
        transition-all cursor-grab active:cursor-grabbing
        group select-none
        ${isDragging ? "opacity-50 ring-2 ring-pharmako-primary-light shadow-sm" : ""}
      `}
    >
      {/* Icon */}
      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 group-hover:text-pharmako-primary group-hover:bg-pharmako-primary-light group-hover:border-pharmako-primary-muted transition-colors shrink-0">
        <Icon className="w-4 h-full max-h-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-none">
          {label}
        </p>
        {description && (
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* Grab hint */}
      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
    </div>
  );
}
