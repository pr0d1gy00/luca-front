'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Settings, Layers, Undo2, Redo2, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { cn } from '@/lib/utils';
import { CanvasBlock } from './CanvasBlock';
import { ToolboxItem } from './ToolboxItem';
import { LayersPanel } from './LayersPanel';
import { MobileToolboxPanel, MobilePropertiesPanel, MobileBottomNav } from './MobilePanels';
import { GridRowBlock } from './GridRowBlock';
import { VitalSignsBlock } from './VitalSignsBlock';
import { createNewElement, insertElementAt, removeElementById, updateGridColumnChildren } from '../hooks/useBuilderDnd';
import { useUndoRedo, useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSaveClinicalHistorySchema, usePatchSchemaStatus } from '../../../lib/api/clinical-history/schema';
import { ImportExportMenu } from './ImportExportMenu';
import { FieldOptionsEditor } from './FieldOptionsEditor';
import type {
  CanvasElement,
  BuilderUIState,
  ActiveToolboxTab,
  ActivePanelTab,
  ClinicalHistorySchema,
  VitalSignsField,
  SelectorOption,
} from '../types';
import { clinicalHistorySchema as seedSchema } from '../schemas/clinical-history-schema';

const TOOLBOX_BLOCKS = {
  structural: [
    { type: 'grid-row', label: 'Fila de 2 Columnas', icon: '⬛⬛', description: 'Divide el espacio en 2 columnas' },
    { type: 'grid-row', label: 'Fila de 3 Columnas', icon: '⬛⬛⬛', description: 'Divide el espacio en 3 columnas' },
    { type: 'section', label: 'Sección / Acordeón', icon: '📂', description: 'Grupo collapsible de campos' },
    { type: 'visual-separator', label: 'Separador Visual', icon: '―', description: 'Línea o espacio divisor' },
    { type: 'section-title', label: 'Título de Sección', icon: 'T', description: 'Encabezado decorativo' },
  ],
  basic: [
    { type: 'text-short', label: 'Texto Corto', icon: 'T_', description: 'Campo de una línea' },
    { type: 'text-paragraph', label: 'Párrafo', icon: '¶', description: 'Área de texto multilínea' },
    { type: 'number', label: 'Número', icon: '#', description: 'Campo numérico con validación' },
    { type: 'datetime', label: 'Fecha / Hora', icon: '📅', description: 'Selector de fecha y/u hora' },
    { type: 'checkbox-multiple', label: 'Checkbox Múltiple', icon: '☑', description: 'Selección múltiple de opciones' },
    { type: 'dropdown', label: 'Desplegable', icon: '▼', description: 'Selector de una opción' },
    { type: 'radio-group', label: 'Grupo de Radio', icon: '◉', description: 'Selección única entre varias opciones' },
    { type: 'toggle', label: 'Interruptor (Toggle)', icon: '◉', description: 'Encendido / Apagado' },
  ],
  clinical: [
    { type: 'vital-signs', label: 'Signos Vitales', icon: '❤️', description: 'Grupo de signos vitales integrados' },
    { type: 'cie10-selector', label: 'Diagnóstico CIE-10', icon: '🔍', description: 'Selector de diagnóstico CIE-10' },
    { type: 'file-upload', label: 'Subida de Archivos', icon: '📎', description: 'Adjunta imágenes o documentos' },
  ],
} as const;

// ─── TOOLBOX SIDEBAR ────────────────────────────────────────
function ToolboxSidebar({
  activeTab,
  onTabChange,
  onAddElement,
}: {
  activeTab: ActiveToolboxTab;
  onTabChange: (tab: ActiveToolboxTab) => void;
  onAddElement: (element: CanvasElement) => void;
}) {
  const categories: { id: ActiveToolboxTab; label: string }[] = [
    { id: 'structural', label: 'Estructura' },
    { id: 'basic', label: 'Campos' },
    { id: 'clinical', label: 'Clínicos' },
  ];

  const blocks = TOOLBOX_BLOCKS[activeTab];

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Herramientas</h2>
        <p className="text-xs text-slate-500 mt-0.5">Arrastra al lienzo</p>
      </div>

      <div className="flex border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onTabChange(cat.id)}
            className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === cat.id
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {blocks.map((block) => (
          <ToolboxItem
            key={`${block.type}-${block.label}`}
            blockType={block.type}
            label={block.label}
            icon={block.icon}
            description={block.description}
            onAdd={() => onAddElement(createNewElement(block.type))}
          />
        ))}
      </div>
    </aside>
  );
}

// ─── CANVAS ─────────────────────────────────────────────────
function CanvasArea({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onToggleHidden,
  onMove,
  isDragOver,
  schemaName,
  schemaDescription,
  onSchemaNameChange,
  onSchemaDescriptionChange,
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isDragOver: boolean;
  schemaName: string;
  schemaDescription: string;
  onSchemaNameChange: (v: string) => void;
  onSchemaDescriptionChange: (v: string) => void;
}) {
  return (
    <main className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <input
            type="text"
            value={schemaName}
            onChange={(e) => onSchemaNameChange(e.target.value)}
            className="text-xl font-semibold text-slate-900 bg-transparent border-none outline-none
                       hover:bg-slate-100 focus:bg-white rounded-lg px-2 py-1 transition-colors w-full"
            placeholder="Nombre de la plantilla"
          />
          <input
            type="text"
            value={schemaDescription ?? ''}
            onChange={(e) => onSchemaDescriptionChange(e.target.value)}
            className="text-sm text-slate-500 mt-0.5 bg-transparent border-none outline-none
                       hover:bg-slate-100 focus:bg-white rounded-lg px-2 py-1 transition-colors w-full"
            placeholder="Descripción de la plantilla (opcional)"
          />
        </div>

        <div
          className={`min-h-[500px] bg-white rounded-2xl border-2 border-dashed transition-colors ${
            isDragOver
              ? 'border-teal-400 bg-teal-50/30'
              : elements.length === 0
                ? 'border-slate-200'
                : 'border-transparent'
          }`}
        >
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm font-medium text-slate-600">
                Arrastra bloques aquí
              </p>
              <p className="text-xs text-slate-400 mt-1">
                O haz clic en cualquier bloque del panel izquierdo
              </p>
            </div>
          ) : (
            <SortableContext
              items={elements.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-6 space-y-3">
                {elements.map((element) => {
                  if (element.type === 'grid-row') {
                    return (
                      <GridRowBlock
                        key={element.id}
                        element={element as CanvasElement & { type: 'grid-row'; columns: 2 | 3 | 4; children: CanvasElement[]; gap?: 'none' | 'sm' | 'md' | 'lg' }}
                        isSelected={selectedId === element.id}
                        onSelect={() => onSelect(element.id)}
                        onDelete={() => onDelete(element.id)}
                        onUpdate={() => {}}
                        onUpdateChildren={(children) => {
                          // Wire: update children in the parent state
                        }}
                        onDropOnColumn={(colIdx, el) => {}}
                      />
                    );
                  }

                  if (element.type === 'vital-signs') {
                    return (
                      <VitalSignsBlock
                        key={element.id}
                        element={element as CanvasElement & { type: 'vital-signs'; fields: VitalSignsField[] }}
                        isSelected={selectedId === element.id}
                        onSelect={() => onSelect(element.id)}
                        onDelete={() => onDelete(element.id)}
                        onUpdate={() => {}}
                      />
                    );
                  }

                  return (
                    <CanvasBlock
                      key={element.id}
                      element={element}
                      isSelected={selectedId === element.id}
                      onSelect={() => onSelect(element.id)}
                      onDelete={() => onDelete(element.id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── PROPERTIES PANEL ────────────────────────────────────────
function PropertiesPanel({
  selectedElement,
  onUpdate,
  onDelete,
  elements,
  selectedId,
  onSelect,
  onToggleHidden,
  onMove,
  activeTab,
  onTabChange,
  onSave,
  isSaving,
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  schema,
  onImport,
  onSchemaStatusChange,
  statusMutation,
  schemaName,
  schemaDescription,
  onSchemaNameChange,
  onSchemaDescriptionChange,
}: {
  selectedElement: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  activeTab: ActivePanelTab;
  onTabChange: (tab: ActivePanelTab) => void;
  onSave: () => void;
  isSaving: boolean;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  schema: ClinicalHistorySchema;
  onImport: (elements: CanvasElement[]) => void;
  onSchemaStatusChange: (status: 'draft' | 'published') => void;
  statusMutation: { isPending: boolean };
  schemaName: string;
  schemaDescription: string;
  onSchemaNameChange: (v: string) => void;
  onSchemaDescriptionChange: (v: string) => void;
}) {
  return (
    <aside className="w-72 bg-white border-l border-slate-100 flex flex-col h-full">
      {/* Action bar */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Shift+Z)"
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="w-4 h-4 text-slate-600" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          onClick={onPreview}
          title="Vista previa"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <ImportExportMenu
          schema={schema}
          elements={elements}
          onImport={onImport}
        />

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium
                     hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => onTabChange('properties')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'properties'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Props
        </button>
        <button
          onClick={() => onTabChange('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'layers'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Capas
        </button>
      </div>

      {activeTab === 'properties' ? (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Schema name/description editor when no element selected */}
          {!selectedElement && (
            <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre de la Plantilla</label>
                <input
                  type="text"
                  value={schemaName}
                  onChange={(e) => onSchemaNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm
                             text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
                <textarea
                  value={schemaDescription ?? ''}
                  onChange={(e) => onSchemaDescriptionChange(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm
                             text-slate-900 placeholder-slate-400 resize-none
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                  placeholder="Descripción (opcional)"
                />
              </div>
            </div>
          )}

          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Título</label>
                <input
                  type="text"
                  value={selectedElement.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm
                             text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
                <textarea
                  value={selectedElement.description ?? ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm
                             text-slate-900 placeholder-slate-400 resize-none
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-medium text-slate-600">Obligatorio</label>
                <button
                  onClick={() => onUpdate({ required: !selectedElement.required })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    selectedElement.required ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      selectedElement.required ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Ancho</label>
                <select
                  value={selectedElement.width ?? 'full'}
                  onChange={(e) =>
                    onUpdate({ width: e.target.value as CanvasElement['width'] })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm
                             text-slate-900 bg-white
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                >
                  <option value="full">Ancho Completo</option>
                  <option value="2/3">2/3</option>
                  <option value="1/2">1/2</option>
                  <option value="1/3">1/3</option>
                  <option value="1/4">1/4</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-medium text-slate-600">Oculto</label>
                <button
                  onClick={() => onUpdate({ hidden: !selectedElement.hidden })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    selectedElement.hidden ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      selectedElement.hidden ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-medium text-slate-600">Bloqueado</label>
                <button
                  onClick={() => onUpdate({ locked: !selectedElement.locked })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    selectedElement.locked ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      selectedElement.locked ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Options editor for dropdown / checkbox-multiple / radio-group */}
              {(['dropdown', 'checkbox-multiple', 'radio-group'].includes(selectedElement.type)) && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <FieldOptionsEditor
                    options={(selectedElement as { options?: SelectorOption[] }).options ?? []}
                    onChange={(newOptions) => onUpdate({ options: newOptions } as Partial<CanvasElement>)}
                    minOptions={selectedElement.type === 'checkbox-multiple' ? 2 : 1}
                  />
                </div>
              )}

              {/* Grid settings for grid-row */}
              {selectedElement.type === 'grid-row' && (
                <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Columnas</label>
                    <select
                      value={(selectedElement as { columns?: number }).columns ?? 2}
                      onChange={(e) => onUpdate({ columns: parseInt(e.target.value) as 2 | 3 | 4 } as Partial<CanvasElement>)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
                    >
                      <option value={2}>2 columnas</option>
                      <option value={3}>3 columnas</option>
                      <option value={4}>4 columnas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Espaciado</label>
                    <select
                      value={(selectedElement as { gap?: string }).gap ?? 'md'}
                      onChange={(e) => onUpdate({ gap: e.target.value as 'none' | 'sm' | 'md' | 'lg' } as Partial<CanvasElement>)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
                    >
                      <option value="none">Sin espacio</option>
                      <option value="sm">Pequeño</option>
                      <option value="md">Medio</option>
                      <option value="lg">Grande</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Template publish status */}
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Estado de la Plantilla
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSchemaStatusChange('published')}
                    disabled={statusMutation.isPending}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors',
                      schema.status === 'published'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600',
                      statusMutation.isPending && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    {statusMutation.isPending ? 'Guardando...' : '✓ Publicada'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSchemaStatusChange('draft')}
                    disabled={statusMutation.isPending}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors',
                      schema.status === 'draft'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-amber-200 hover:text-amber-600',
                      statusMutation.isPending && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    Borrador
                  </button>
                </div>
              </div>

              <button
                onClick={() => onDelete(selectedElement.id)}
                className="w-full mt-2 px-3 py-2 rounded-xl text-sm font-medium
                           bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                Eliminar bloque
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">Sin bloque seleccionado</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Haz clic en un bloque del lienzo
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={onSelect}
            onToggleHidden={onToggleHidden}
            onDelete={onDelete}
            onMove={onMove}
          />
        </div>
      )}
    </aside>
  );
}

// ─── DRAG OVERLAY ────────────────────────────────────────────
function DragOverlayContent({ elementType }: { elementType: string }) {
  return (
    <div className="w-72 bg-white rounded-xl border-2 border-teal-400 shadow-xl p-4 opacity-95">
      <p className="text-sm font-medium text-slate-700 capitalize">
        {elementType.replace(/-/g, ' ')}
      </p>
      <p className="text-xs text-teal-600 mt-0.5">Soltar para añadir</p>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export function ClinicalHistoryBuilder() {
  const [uiState, setUIState] = useState<BuilderUIState>({
    selectedElementId: null,
    activeToolboxTab: 'structural',
    activePanelTab: 'properties',
    isDragging: false,
    isMobileMenuOpen: false,
    mobileActivePanel: null,
  });

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>(
    seedSchema.canvas.elements,
  );

  const [schemaName, setSchemaName] = useState(seedSchema.name);
  const [schemaDescription, setSchemaDescription] = useState(seedSchema.description ?? '');

  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [isMobileToolboxOpen, setIsMobileToolboxOpen] = useState(false);
  const [isMobilePropsOpen, setIsMobilePropsOpen] = useState(false);
  const [schemaId] = useState(seedSchema.id);
  const [schemaStatus, setSchemaStatus] = useState<'draft' | 'published'>(seedSchema.status);

  const selectedElement =
    canvasElements.find((e) => e.id === uiState.selectedElementId) ?? null;

  // Active schema with current status and metadata
  const activeSchema: ClinicalHistorySchema = {
    ...seedSchema,
    name: schemaName,
    description: schemaDescription,
    status: schemaStatus,
    canvas: { elements: canvasElements },
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ─── Undo / Redo ─────────────────────────────────────────
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo({
    elements: canvasElements,
    onChange: setCanvasElements,
  });

  // Debounce: push state after each meaningful change (250ms)
  const pushRef = useRef(push);
  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  const debouncedPush = useRef<ReturnType<typeof setTimeout>>();
  function schedulePush() {
    clearTimeout(debouncedPush.current);
    debouncedPush.current = setTimeout(() => pushRef.current(canvasElements), 250);
  }

  // ─── API mutation ─────────────────────────────────────────
  const saveMutation = useSaveClinicalHistorySchema();
  const statusMutation = usePatchSchemaStatus();

  async function handleSave() {
    try {
      await saveMutation.mutateAsync(activeSchema);
      toast.success('Plantilla guardada correctamente');
      schedulePush();
    } catch {
      toast.error('Error al guardar la plantilla');
    }
  }

  async function handleSchemaStatusChange(newStatus: 'draft' | 'published') {
    try {
      await statusMutation.mutateAsync({ id: schemaId, data: { status: newStatus } });
      setSchemaStatus(newStatus);
      toast.success(`Plantilla marcada como ${newStatus === 'published' ? 'publicada' : 'borrador'}`);
    } catch {
      toast.error('Error al cambiar el estado de la plantilla');
    }
  }

  // ─── Element CRUD ─────────────────────────────────────────
  const handleAddElement = useCallback(
    (element: CanvasElement) => {
      setCanvasElements((prev) => [...prev, element]);
      setUIState((prev) => ({ ...prev, selectedElementId: element.id }));
    },
    [],
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      setCanvasElements((prev) => removeElementById(prev, id));
      setUIState((prev) => ({
        ...prev,
        selectedElementId:
          prev.selectedElementId === id ? null : prev.selectedElementId,
      }));
    },
    [],
  );

  const handleUpdateElement = useCallback(
    (updates: Partial<CanvasElement>) => {
      if (!uiState.selectedElementId) return;
      setCanvasElements((prev) =>
        prev.map((el) =>
          el.id === uiState.selectedElementId
            ? ({ ...el, ...updates } as CanvasElement)
            : el,
        ),
      );
    },
    [uiState.selectedElementId],
  );

  const handleToggleHidden = useCallback((id: string) => {
    setCanvasElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, hidden: !el.hidden } : el,
      ),
    );
  }, []);

  const handleMove = useCallback(
    (id: string, dir: 'up' | 'down') => {
      setCanvasElements((prev) => {
        const idx = prev.findIndex((e) => e.id === id);
        if (idx === -1) return prev;
        const newIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        return arrayMove(prev, idx, newIdx);
      });
    },
    [],
  );

  // ─── Keyboard shortcuts ───────────────────────────────────
  useKeyboardShortcuts({
    elements: canvasElements,
    selectedId: uiState.selectedElementId,
    onChange: setCanvasElements,
    onDelete: handleDeleteElement,
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
  });

  // Push to history on any canvas change
  useEffect(() => {
    schedulePush();
  }, [canvasElements]);

  // ─── DnD Handlers ────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setUIState((prev) => ({ ...prev, isDragging: true }));

    const data = active.data.current as {
      type: string;
      elementType?: string;
      element?: CanvasElement;
    };
    setActiveDragType(data.elementType ?? data.element?.type ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setUIState((prev) => ({ ...prev, isDragging: false }));
    setActiveDragType(null);

    const { active, over } = event;
    if (!over) return;

    // Check if dropping on a column drop zone (grid column)
    const overData = over.data.current as { type?: string; columnIndex?: number; gridId?: string };
    if (overData?.type === 'column-dropzone' && overData.columnIndex !== undefined && overData.gridId) {
      const activeData = active.data.current as { type: string; elementType?: string; element?: CanvasElement; isNew?: boolean };
      if (activeData.type === 'toolbox-item' && activeData.isNew && activeData.elementType) {
        const newElement = createNewElement(activeData.elementType);
        setCanvasElements((prev) =>
          updateGridColumnChildren(prev, overData.gridId!, overData.columnIndex!, newElement),
        );
        return;
      }
      if (activeData.element) {
        setCanvasElements((prev) =>
          updateGridColumnChildren(prev, overData.gridId!, overData.columnIndex!, activeData.element),
        );
        return;
      }
    }

    if (active.id !== over.id) {
      const oldIndex = canvasElements.findIndex((e) => e.id === active.id);
      const newIndex = canvasElements.findIndex((e) => e.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setCanvasElements(arrayMove(canvasElements, oldIndex, newIndex));
        return;
      }
    }

    const data = active.data.current as {
      type: string;
      elementType?: string;
      isNew?: boolean;
    };

    if (data.type === 'toolbox-item' && data.isNew && data.elementType) {
      const newElement = createNewElement(data.elementType);
      const insertIndex = over
        ? canvasElements.findIndex((e) => e.id === over.id)
        : canvasElements.length;
      setCanvasElements((prev) =>
        insertElementAt(
          prev,
          newElement,
          insertIndex === -1 ? prev.length : insertIndex,
        ),
      );
      setUIState((prev) => ({ ...prev, selectedElementId: newElement.id }));
    }
  }

  const previewUrl = `/features/clinical-history/preview/${schemaId}`;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:flex flex-1">
          <ToolboxSidebar
            activeTab={uiState.activeToolboxTab}
            onTabChange={(tab) =>
              setUIState((prev) => ({ ...prev, activeToolboxTab: tab }))
            }
            onAddElement={handleAddElement}
          />

          <CanvasArea
            elements={canvasElements}
            selectedId={uiState.selectedElementId}
            onSelect={(id) =>
              setUIState((prev) => ({ ...prev, selectedElementId: id }))
            }
            onDelete={handleDeleteElement}
            onToggleHidden={handleToggleHidden}
            onMove={handleMove}
            isDragOver={uiState.isDragging}
            schemaName={schemaName}
            schemaDescription={schemaDescription}
            onSchemaNameChange={setSchemaName}
            onSchemaDescriptionChange={setSchemaDescription}
          />

          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
            elements={canvasElements}
            selectedId={uiState.selectedElementId}
            onSelect={(id) =>
              setUIState((prev) => ({ ...prev, selectedElementId: id }))
            }
            onToggleHidden={handleToggleHidden}
            onMove={handleMove}
            activeTab={uiState.activePanelTab}
            onTabChange={(tab) =>
              setUIState((prev) => ({ ...prev, activePanelTab: tab }))
            }
            onSave={handleSave}
            isSaving={saveMutation.isPending}
            onPreview={() => window.open(previewUrl, '_blank')}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            schema={activeSchema}
            onImport={setCanvasElements}
            onSchemaStatusChange={handleSchemaStatusChange}
            statusMutation={statusMutation}
            schemaName={schemaName}
            schemaDescription={schemaDescription}
            onSchemaNameChange={setSchemaName}
            onSchemaDescriptionChange={setSchemaDescription}
          />
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden flex-1 flex-col">
          <CanvasArea
            elements={canvasElements}
            selectedId={uiState.selectedElementId}
            onSelect={(id) =>
              setUIState((prev) => ({ ...prev, selectedElementId: id }))
            }
            onDelete={handleDeleteElement}
            onToggleHidden={handleToggleHidden}
            onMove={handleMove}
            isDragOver={uiState.isDragging}
            schemaName={schemaName}
            schemaDescription={schemaDescription}
            onSchemaNameChange={setSchemaName}
            onSchemaDescriptionChange={setSchemaDescription}
          />

          <MobileBottomNav
            onOpenToolbox={() => setIsMobileToolboxOpen(true)}
            onOpenProperties={() => setIsMobilePropsOpen(true)}
          />

          <Sheet open={isMobileToolboxOpen} onOpenChange={setIsMobileToolboxOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <MobileToolboxPanel
                activeTab={uiState.activeToolboxTab}
                onTabChange={(tab) =>
                  setUIState((prev) => ({ ...prev, activeToolboxTab: tab }))
                }
                onAddElement={handleAddElement}
                canvasElements={canvasElements}
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                activePanelTab={uiState.activePanelTab}
                onPanelTabChange={(tab) =>
                  setUIState((prev) => ({ ...prev, activePanelTab: tab }))
                }
                onSelectElement={(id) =>
                  setUIState((prev) => ({ ...prev, selectedElementId: id }))
                }
              />
            </SheetContent>
          </Sheet>

          <Sheet open={isMobilePropsOpen} onOpenChange={setIsMobilePropsOpen}>
            <SheetContent side="right" className="w-72 p-0">
              <MobilePropertiesPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
                activeTab={uiState.activePanelTab}
                onTabChange={(tab) =>
                  setUIState((prev) => ({ ...prev, activePanelTab: tab }))
                }
              />
            </SheetContent>
          </Sheet>
        </div>

        <DragOverlay dropAnimation={null}>
          {uiState.isDragging && activeDragType && (
            <DragOverlayContent elementType={activeDragType} />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}