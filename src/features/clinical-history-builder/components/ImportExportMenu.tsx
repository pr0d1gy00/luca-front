'use client';

import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import type { ClinicalHistorySchema, CanvasElement } from '../types';

interface ImportExportMenuProps {
  schema: ClinicalHistorySchema;
  elements: CanvasElement[];
  onImport: (elements: CanvasElement[]) => void;
}

export function ImportExportMenu({ schema, elements, onImport }: ImportExportMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const exportData: ClinicalHistorySchema = {
      ...schema,
      canvas: { elements },
      updatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_').toLowerCase()}_v${schema.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.canvas?.elements && Array.isArray(data.canvas.elements)) {
          onImport(data.canvas.elements);
        } else {
          window.alert('Archivo JSON inválido. No se encontró canvas.elements');
        }
      } catch {
        window.alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleExport}
        title="Exportar como JSON"
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        title="Importar desde JSON"
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
      >
        <Upload className="w-4 h-4" />
      </button>
    </div>
  );
}
