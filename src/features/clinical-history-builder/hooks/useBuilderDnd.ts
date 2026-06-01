'use client';

import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type {
  CanvasElement,
  ClinicalHistorySchema,
  GridRowBlock,
} from '../types';
import { clinicalHistorySchema } from '../schemas/clinical-history-schema';

// ─── Generate a unique ID ─────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Default props per block type ──────────────────────────────
function getDefaultElementProps(elementType: string): Partial<CanvasElement> {
  const defaults: Record<string, Partial<CanvasElement>> = {
    'text-short': { title: 'Texto Corto', placeholder: 'Escribe aquí...' },
    'text-paragraph': { title: 'Párrafo', placeholder: 'Escribe aquí...', rows: 3 },
    'number': { title: 'Número', placeholder: '0' },
    'datetime': { title: 'Fecha / Hora' },
    'checkbox-multiple': {
      title: 'Checkbox Múltiple',
      options: [
        { value: 'opt1', label: 'Opción 1' },
        { value: 'opt2', label: 'Opción 2' },
      ],
    },
    'dropdown': {
      title: 'Desplegable',
      placeholder: 'Seleccionar...',
      options: [
        { value: 'opt1', label: 'Opción 1' },
        { value: 'opt2', label: 'Opción 2' },
      ],
    },
    'radio-group': {
      title: 'Grupo de Radio',
      options: [
        { value: 'opt1', label: 'Opción 1' },
        { value: 'opt2', label: 'Opción 2' },
      ],
    },
    'toggle': { title: 'Interruptor', labelOn: 'Sí', labelOff: 'No' },
    'vital-signs': {
      title: 'Signos Vitales',
      fields: [
        { key: 'systolic', label: 'Presión Sistólica', unit: 'mmHg', min: 60, max: 200 },
        { key: 'diastolic', label: 'Presión Diastólica', unit: 'mmHg', min: 40, max: 130 },
        { key: 'heart-rate', label: 'Frecuencia Cardíaca', unit: 'lpm', min: 30, max: 220 },
        { key: 'oxygen-saturation', label: 'Saturación O₂', unit: '%', min: 70, max: 100 },
      ],
    },
    'cie10-selector': { title: 'Diagnóstico CIE-10', placeholder: 'Buscar código CIE-10...' },
    'file-upload': { title: 'Subida de Archivos', accept: 'image/*,.pdf', maxSizeMB: 10, maxFiles: 5 },
    'grid-row': { title: 'Fila', columns: 2, children: [], gap: 'md' },
    'section': { title: 'Sección', collapsible: true, defaultOpen: true, children: [] },
    'visual-separator': { title: 'Separador', style: 'line' },
    'section-title': { title: 'Título de Sección', level: 2, alignment: 'left' },
  };
  return defaults[elementType] ?? { title: elementType };
}

// ─── Create a new element from toolbox drag ─────────────────────
export function createNewElement(elementType: string): CanvasElement {
  const defaults = getDefaultElementProps(elementType);
  const id = generateId();

  return {
    id,
    type: elementType,
    title: defaults.title ?? 'Sin título',
    placeholder: defaults.placeholder as string | undefined,
    options: defaults.options as CanvasElement['options'] | undefined,
    required: false,
    width: 'full',
    locked: false,
    hidden: false,
    ...defaults,
  } as CanvasElement;
}

// ─── Main DnD Hook ────────────────────────────────────────────
export function useBuilderDnd(
  canvasElements: CanvasElement[],
  setCanvasElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
) {
  // ─── Reorder within canvas (same level) ─────────────────────
  const handleDragEnd = useCallback(
    (event: import('@dnd-kit/core').DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = canvasElements.findIndex((e) => e.id === active.id);
      const newIndex = canvasElements.findIndex((e) => e.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      setCanvasElements(arrayMove(canvasElements, oldIndex, newIndex));
    },
    [canvasElements, setCanvasElements],
  );

  // ─── Add from toolbox to canvas ─────────────────────────────
  const handleDragStart = useCallback(
    (event: import('@dnd-kit/core').DragStartEvent) => {
      const { active } = event;
      console.log('[DnD] Drag started:', active.data.current);
    },
    [],
  );

  return {
    handleDragEnd,
    handleDragStart,
    createNewElement,
  };
}

// ─── Insert element at index ──────────────────────────────────
export function insertElementAt(
  elements: CanvasElement[],
  element: CanvasElement,
  index: number,
): CanvasElement[] {
  const copy = [...elements];
  copy.splice(index, 0, element);
  return copy;
}

// ─── Remove element by id ─────────────────────────────────────
export function removeElementById(
  elements: CanvasElement[],
  id: string,
): CanvasElement[] {
  function removeRecursive(items: CanvasElement[]): CanvasElement[] {
    return items
      .filter((item) => item.id !== id)
      .map((item) => {
        if ('children' in item && item.children) {
          return { ...item, children: removeRecursive(item.children) };
        }
        return item;
      });
  }
  return removeRecursive(elements);
}

// ─── Find element by id ────────────────────────────────────────
export function findElementById(
  elements: CanvasElement[],
  id: string,
): CanvasElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if ('children' in el && el.children) {
      const found = findElementById(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ─── Update element by id ──────────────────────────────────────
export function updateElementById(
  elements: CanvasElement[],
  id: string,
  updates: Partial<CanvasElement>,
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === id) return { ...el, ...updates } as CanvasElement;
    if ('children' in el && el.children) {
      return { ...el, children: updateElementById(el.children, id, updates) };
    }
    return el;
  });
}

// ─── Update grid column children by column index ─────────────────
export function updateGridColumnChildren(
  elements: CanvasElement[],
  gridId: string,
  columnIndex: number,
  newElement: CanvasElement,
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id !== gridId) return el;
    if (el.type !== 'grid-row') return el;
    const gridEl = el as GridRowBlock;
    // Insert element into children array at the position corresponding to columnIndex
    const childrenPerColumn = Math.ceil((gridEl.children?.length ?? 0) / gridEl.columns);
    const insertPos = columnIndex * childrenPerColumn;
    const newChildren = [...(gridEl.children ?? [])];
    newChildren.splice(insertPos, 0, newElement);
    return { ...gridEl, children: newChildren } as CanvasElement;
  });
}

// ─── Serialize schema to JSON ──────────────────────────────────
export function serializeSchema(
  schema: ClinicalHistorySchema,
  canvasElements: CanvasElement[],
): ClinicalHistorySchema {
  return {
    ...schema,
    updatedAt: new Date().toISOString(),
    canvas: { elements: canvasElements },
  };
}
