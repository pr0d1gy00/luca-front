"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface ToolboxItemProps {
  blockType: string;
  label: string;
  icon: string;
  description?: string;
  onAdd?: () => void;
}

export function ToolboxItem({
  blockType,
  label,
  icon,
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
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        bg-slate-50 hover:bg-slate-100 border border-slate-100
        hover:border-slate-200 transition-all cursor-grab active:cursor-grabbing
        group
        ${isDragging ? "opacity-50 ring-2 ring-blue-100" : ""}
      `}
    >
      {/* Icon */}
      <span className="text-base flex-shrink-0" aria-hidden>
        {icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* Grab hint */}
      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
    </div>
  );
}
