"use client";

import { Clock } from "lucide-react";
import type { HistoryEntry } from "../schemas";

interface ClinicalHistoryTimelineProps {
  entries: HistoryEntry[];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function ClinicalHistoryTimeline({
  entries,
}: ClinicalHistoryTimelineProps) {
  return (
    <div className="flex flex-col gap-0">
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="size-10 text-slate-200 mb-3" />
          <p className="text-sm text-slate-500">Sin consultas previas</p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-slate-200 ml-4 space-y-6">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8">
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-blue-700 ring-4 ring-white" />

              {/* Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 hover: transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <time className="text-xs font-medium text-pharmako-care">
                    {formatDate(new Date(entry.date))}
                  </time>
                  <span className="text-xs text-slate-500">
                    {entry.doctorName}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                      Motivo
                    </p>
                    <p className="text-sm text-slate-700">{entry.motivo}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                      Diagnóstico
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {entry.diagnostico}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
