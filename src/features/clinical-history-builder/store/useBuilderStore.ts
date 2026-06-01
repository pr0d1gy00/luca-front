import { create } from 'zustand';
import type { CanvasElement, ClinicalHistorySchema } from '../types';

interface BuilderState {
  // Canvas state
  elements: CanvasElement[];
  setElements: (elements: CanvasElement[]) => void;

  // Selection
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;

  // Schema metadata
  schema: ClinicalHistorySchema | null;
  setSchema: (schema: ClinicalHistorySchema) => void;

  // Dirty tracking
  isDirty: boolean;
  markClean: () => void;

  // UI state
  isMobileToolboxOpen: boolean;
  isMobilePropsOpen: boolean;
  setMobileToolboxOpen: (open: boolean) => void;
  setMobilePropsOpen: (open: boolean) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  elements: [],
  setElements: (elements) => set({ elements, isDirty: true }),

  selectedElementId: null,
  selectElement: (id) => set({ selectedElementId: id }),

  schema: null,
  setSchema: (schema) => set({ schema, elements: schema.canvas.elements }),

  isDirty: false,
  markClean: () => set({ isDirty: false }),

  isMobileToolboxOpen: false,
  isMobilePropsOpen: false,
  setMobileToolboxOpen: (open) => set({ isMobileToolboxOpen: open }),
  setMobilePropsOpen: (open) => set({ isMobilePropsOpen: open }),
}));
