"use client";

import { Button } from "@/components/ui/button";
import { Plus, BedDouble, Calendar, Activity } from "lucide-react";

interface AdmissionsBoardProps {
  boardColumns: Record<string, { id: string; title: string; items: any[] }>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenNew: () => void;
}

export function AdmissionsBoard({ boardColumns, searchQuery, setSearchQuery, onOpenNew }: AdmissionsBoardProps) {
  const columnsList = Object.values(boardColumns);

  return (
    <div className="space-y-6 flex flex-col h-full min-h-[calc(100vh-100px)]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Hospitalización (Admissions)</h2>
          <p className="text-sm text-slate-500">Gestione los ingresos, altas y ocupación de camas.</p>
        </div>
        <Button
          onClick={onOpenNew}
          className="bg-pharmako-care text-white hover:bg-[#1dbec3] shadow-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ingresar Paciente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 border border-slate-200 rounded-md shrink-0">
        <input
          type="text"
          placeholder="Buscar paciente por ID..."
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-pharmako-care"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columnsList.map((col) => (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-50 border border-slate-200 rounded-lg">
            {/* COLUMN HEADER */}
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-100/50 rounded-t-lg">
              <h3 className="text-sm font-semibold text-slate-800">{col.title}</h3>
              <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full font-medium">
                {col.items.length}
              </span>
            </div>
            
            {/* CARDS CONTAINER */}
            <div className="flex-1 p-2 space-y-3 overflow-y-auto min-h-[200px]">
              {col.items.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-slate-200 border-dashed rounded bg-slate-50/50">
                  Sin pacientes
                </div>
              ) : (
                col.items.map((adm) => (
                  <AdmissionCard key={adm.id || adm.uuid} admission={adm} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdmissionCard({ admission }: { admission: any }) {
  // Format dates simply for display
  const admDate = admission.admission_date || admission.admissionDate;
  const displayDate = admDate ? new Date(admDate).toLocaleDateString() : "No date";

  return (
    <div className="bg-white p-3 border border-slate-200 rounded shadow-none hover:border-pharmako-care/50 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[140px]">
          {admission.patient_account_id || admission.patientUuid?.split("-")[0]}
        </span>
        {admission._syncStatus === "created" && (
          <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Offline
          </span>
        )}
      </div>

      <div className="space-y-1.5 mt-3">
        <div className="flex items-center text-xs text-slate-600">
          <BedDouble className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span className="truncate">{admission.roomName} - Cama {admission.bedNumber}</span>
        </div>
        <div className="flex items-center text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span>Ingreso: {displayDate}</span>
        </div>
        <div className="flex items-center text-xs text-slate-600">
          <Activity className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span className="truncate" title={admission.reason}>{admission.reason || "Sin motivo registrado"}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-medium text-pharmako-care">Ver detalles →</span>
      </div>
    </div>
  );
}
