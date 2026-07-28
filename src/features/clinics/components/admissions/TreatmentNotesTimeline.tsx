"use client";

import { Activity, Clock, Stethoscope } from "lucide-react";

interface TreatmentNotesTimelineProps {
  notes: any[];
}

export function TreatmentNotesTimeline({ notes }: TreatmentNotesTimelineProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-200 border-dashed rounded bg-slate-50">
        No hay notas de tratamiento registradas.
      </div>
    );
  }

  // Sort by date descending
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedNotes.map((note, index) => (
        <div key={note.id || note.uuid} className="relative pl-6 pb-4">
          {/* Timeline line */}
          {index !== sortedNotes.length - 1 && (
            <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200" />
          )}
          
          {/* Dot */}
          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-pharmako-care" />
          
          <div className="bg-white p-4 border border-slate-200 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">Dr. {note.doctorUuid?.split("-")[0] || "Desconocido"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {new Date(note.createdAt || note.created_at).toLocaleString()}
              </div>
            </div>
            
            <p className="text-sm text-slate-700 whitespace-pre-wrap mt-2 leading-relaxed">
              {note.note}
            </p>

            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                Tipo: {note.type || "General"}
              </span>
              {note._syncStatus === "created" && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-medium rounded border border-amber-200">
                  Pendiente de Sincronización
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
