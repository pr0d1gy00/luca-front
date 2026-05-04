"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField, FieldWidth } from "../types/index";
const colSpanMap: Record<number, string> = {
  3: "col-span-3",
  4: "col-span-4",
  6: "col-span-6",
  12: "col-span-12",
};
export function SortableField({
  field,
  onRemove,
  onChangeWidth,
  selectedId,
  onSelect,
}: {
  field: FormField;
  onRemove: (id: string) => void;
  onChangeWidth: (id: string, width: FieldWidth) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const isSelected = selectedId === field.id;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`
    ${colSpanMap[field.width]}
    group
    bg-white
    border
    rounded-xl
    p-4
    shadow-sm
    hover:shadow-md
    transition
    cursor-pointer
    ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}
  `}
      onClick={() => onSelect(field.id)}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        {/* LABEL */}
        <span className="text-sm font-medium text-slate-800">
          {field.label}
        </span>

        {/* DELETE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(field.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-red-500 text-xs transition"
        >
          ✕
        </button>
      </div>

      {/* TYPE */}
      <div className="text-xs text-slate-400 mb-3">{field.type}</div>

      {/* WIDTH CONTROLS */}
      <div className="flex gap-1">
        {[3, 4, 6, 12].map((w) => (
          <button
            key={w}
            onClick={(e) => {
              e.stopPropagation();
              onChangeWidth(field.id, w as FieldWidth);
            }}
            className={`
          text-xs px-2 py-1 rounded border transition
          ${
            field.width === w
              ? "bg-blue-500 text-white border-blue-500"
              : "border-slate-200 hover:bg-slate-100"
          }
        `}
          >
            {w}
          </button>
        ))}
      </div>

      {/* DRAG HANDLE */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-2 text-xs text-slate-400 cursor-grab opacity-0 group-hover:opacity-100"
      >
        ⠿
      </div>
    </div>
  );
}
