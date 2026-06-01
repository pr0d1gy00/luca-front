'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, GripVertical, Eye, EyeOff, Lock } from 'lucide-react';
import type { CanvasElement } from '../types';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

interface TreeItemProps {
  element: CanvasElement;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  depth: number;
}

function TreeItem({
  element,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDelete,
  onMove,
  depth,
}: TreeItemProps) {
  const hasChildren = 'children' in element && element.children.length > 0;
  const isContainer = hasChildren;

  return (
    <div className="select-none">
      {/* Row */}
      <div
        onClick={onSelect}
        className={`
          group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand toggle */}
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-0.5 rounded hover:bg-slate-200"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Drag handle */}
        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />

        {/* Type icon */}
        <span className="text-xs flex-shrink-0 w-4 text-center">
          {getBlockIcon(element.type)}
        </span>

        {/* Title */}
        <span className={`flex-1 text-xs truncate ${isSelected ? 'text-teal-700 font-medium' : 'text-slate-600'}`}>
          {element.title || 'Sin título'}
        </span>

        {/* Status icons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleHidden();
            }}
            className="p-1 rounded hover:bg-slate-200"
            title={element.hidden ? 'Mostrar' : 'Ocultar'}
          >
            {element.hidden ? (
              <EyeOff className="w-3 h-3 text-slate-400" />
            ) : (
              <Eye className="w-3 h-3 text-slate-400" />
            )}
          </button>
          {element.locked && <Lock className="w-3 h-3 text-amber-400" />}
        </div>

        {/* Move buttons */}
        <div className="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove('up');
            }}
            className="px-1 py-0.5 rounded text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove('down');
            }}
            className="px-1 py-0.5 rounded text-[10px] text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Children */}
      {isContainer && isExpanded && (
        <div>
          {'children' in element &&
            (element.children as CanvasElement[]).map((child, idx) => (
              <TreeItem
                key={child.id}
                element={child}
                isSelected={false}
                isExpanded={false}
                onToggleExpand={() => {}}
                onSelect={() => {}}
                onToggleHidden={() => {}}
                onDelete={() => {}}
                onMove={() => {}}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function getBlockIcon(type: string): string {
  const icons: Record<string, string> = {
    'text-short': 'T',
    'text-paragraph': '¶',
    'number': '#',
    'datetime': '📅',
    'checkbox-multiple': '☑',
    'dropdown': '▼',
    'toggle': '◉',
    'vital-signs': '❤️',
    'cie10-selector': '🔍',
    'file-upload': '📎',
    'grid-row': '⊞',
    'section': '📂',
    'visual-separator': '―',
    'section-title': 'T',
  };
  return icons[type] ?? '◇';
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleHidden,
  onDelete,
  onMove,
}: LayersPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <p className="text-sm text-slate-500">Lienzo vacío</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Arrastra bloques para ver las capas
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {elements.map((element) => (
        <TreeItem
          key={element.id}
          element={element}
          isSelected={selectedId === element.id}
          isExpanded={expandedIds.has(element.id)}
          onToggleExpand={() => toggleExpand(element.id)}
          onSelect={() => onSelect(element.id)}
          onToggleHidden={() => onToggleHidden(element.id)}
          onDelete={() => onDelete(element.id)}
          onMove={(dir) => onMove(element.id, dir)}
          depth={0}
        />
      ))}
    </div>
  );
}
