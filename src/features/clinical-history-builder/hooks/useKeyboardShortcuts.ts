'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import type { CanvasElement } from '../types';

interface HistoryEntry {
  elements: CanvasElement[];
  timestamp: number;
}

interface UseUndoRedoOptions {
  elements: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
  maxHistory?: number;
}

export function useUndoRedo({ elements, onChange, maxHistory = 50 }: UseUndoRedoOptions) {
  const historyRef = useRef<HistoryEntry[]>([]);
  const pointerRef = useRef(0);

  // Initialize history once when elements change
  useEffect(() => {
    historyRef.current = [{ elements, timestamp: Date.now() }];
    pointerRef.current = 0;
  }, [elements]);

  // Push new state when elements change (debounced — only if different from current pointer)
  const push = useCallback((newElements: CanvasElement[]) => {
    const current = historyRef.current[pointerRef.current];
    if (current && JSON.stringify(current.elements) === JSON.stringify(newElements)) {
      return; // No-op, identical to current
    }

    // Trim future if we're not at the tip
    historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    historyRef.current.push({ elements: newElements, timestamp: Date.now() });

    // Cap history size
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(-maxHistory);
    }

    pointerRef.current = historyRef.current.length - 1;
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;
    pointerRef.current -= 1;
    const entry = historyRef.current[pointerRef.current];
    onChange(entry.elements);
  }, [onChange]);

  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current += 1;
    const entry = historyRef.current[pointerRef.current];
    onChange(entry.elements);
  }, [onChange]);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return { push, undo, redo, canUndo, canRedo };
}

interface UseDuplicateShortcutOptions {
  elements: CanvasElement[];
  selectedId: string | null;
  onChange: (elements: CanvasElement[]) => void;
}

export function useDuplicateShortcut({
  elements,
  selectedId,
  onChange,
}: UseDuplicateShortcutOptions) {
  const duplicate = useCallback(() => {
    if (!selectedId) return;

    const original = elements.find((e) => e.id === selectedId);
    if (!original) return;

    const clone: CanvasElement = {
      ...original,
      id: `${original.id}-dup-${Date.now()}`,
      title: `${original.title} (copia)`,
    };

    const index = elements.findIndex((e) => e.id === selectedId);
    const next = [...elements];
    next.splice(index + 1, 0, clone);
    onChange(next);
  }, [elements, selectedId, onChange]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key === 'd') {
        e.preventDefault();
        duplicate();
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [duplicate]);
}

interface UseKeyboardShortcutsOptions {
  elements: CanvasElement[];
  selectedId: string | null;
  onChange: (elements: CanvasElement[]) => void;
  onDelete: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({
  elements,
  selectedId,
  onChange,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UseKeyboardShortcutsOptions) {
  useDuplicateShortcut({ elements, selectedId, onChange });

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (ctrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        onRedo();
        return;
      }
      if (ctrl && e.key === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }

      // Delete: Backspace / Delete
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        // Don't intercept if user is typing in an input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        e.preventDefault();
        onDelete(selectedId);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, onChange, onDelete, onUndo, onRedo]);
}
