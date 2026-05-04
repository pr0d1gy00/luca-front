"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import {
  FieldType,
  FieldWidth,
  FormField,
  Group,
  Template,
} from "../types/index";
import { SortableField } from "./SortableField";
import { DroppableGroup } from "./DroppableGroup";

import { Dispatch, SetStateAction } from "react";

export function BuilderCanvas({
  template,
  setTemplate,
  selectedId,
  setSelectedId,
}: {
  template: Template;
  setTemplate: Dispatch<SetStateAction<Template>>;
  selectedId: string | null;
  setSelectedId: (selectedId: string) => void;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const isFromToolbox = active.data.current?.fromToolbox;

    setTemplate((prev: Template) => {
      // 🔵 CASO 1: viene del toolbox
      if (isFromToolbox) {
        const type = active.data.current?.type;

        return {
          ...prev,
          groups: prev.groups.map((group) => {
            if (group.id === over.id) {
              return {
                ...group,
                fields: [
                  {
                    id: crypto.randomUUID(),
                    type: type as FieldType,
                    label: "Nuevo campo",
                    required: false,
                    width: 12 as FieldWidth,
                  },
                ] as FormField[],
              };
            }
            return group;
          }) as Group[],
        };
      }

      // 🟡 CASO 2: mover campos (lo que ya tenías)
      let sourceGroup: Group | undefined;
      let targetGroup: Group | undefined;

      prev.groups.forEach((g: Group) => {
        if (g.fields.some((f: FormField) => f.id === active.id)) {
          sourceGroup = g;
        }
        if (g.id === over.id || g.fields.some((f) => f.id === over.id)) {
          targetGroup = g;
        }
      });

      if (!sourceGroup || !targetGroup) return prev;

      const sourceIndex = sourceGroup.fields.findIndex(
        (f) => f.id === active.id,
      );

      const item = sourceGroup.fields[sourceIndex];

      if (sourceGroup.id === targetGroup.id) {
        const overIndex = targetGroup.fields.findIndex((f) => f.id === over.id);

        sourceGroup.fields = arrayMove(
          sourceGroup.fields,
          sourceIndex,
          overIndex,
        );
      } else {
        sourceGroup.fields = sourceGroup.fields.filter(
          (f) => f.id !== active.id,
        );
        targetGroup.fields.push(item);
      }

      return { ...prev };
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* 🧾 CONTENEDOR TIPO DOCUMENTO */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-6 min-h-[600px]">
        {/* TÍTULO */}
        <h1 className="text-xl font-bold text-slate-800">{template.name}</h1>
        {template.groups.every((g: Group) => g.fields.length === 0) && (
          <div className="text-center text-slate-400 text-sm py-6">
            Agrega o arrastra campos para comenzar
          </div>
        )}
        {template.groups.map((group: Group) => (
          <DroppableGroup key={group.id} id={group.id}>
            {/* HEADER DEL GRUPO */}
            <h3 className="text-sm font-semibold text-slate-600 mb-4 border-b pb-2">
              {group.name}
            </h3>

            <SortableContext
              items={group.fields.map((f) => f.id)}
              strategy={rectSortingStrategy}
            >
              {/* GRID */}
              <div className="grid grid-cols-12 gap-4 min-h-[100px]">
                {group.fields.length === 0 && (
                  <div className="col-span-12 text-center text-slate-400 text-sm py-6">
                    Arrastra campos aquí
                  </div>
                )}
                {group.fields.map((field: FormField) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onRemove={() => {}}
                    onChangeWidth={() => {}}
                  />
                ))}
              </div>
            </SortableContext>
          </DroppableGroup>
        ))}
      </div>
    </DndContext>
  );
}
