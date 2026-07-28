"use client";

import { Button } from "@/components/ui/button";
import { Plus, Scissors, Clock, ArrowRight, PackagePlus } from "lucide-react";

interface OperationsListProps {
  operationsList: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  onOpenSchedule: () => void;
  onOpenSupplyOrder: (op: any) => void;
}

export function OperationsList({
  operationsList,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onOpenSchedule,
  onOpenSupplyOrder,
}: OperationsListProps) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Agenda Quirúrgica</h2>
          <p className="text-sm text-slate-500">Programe intervenciones y gestione solicitudes de insumos.</p>
        </div>
        <Button
          onClick={onOpenSchedule}
          className="bg-pharmako-care text-white hover:bg-[#1dbec3] shadow-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Programar Cirugía
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 border border-slate-200 rounded-md">
        <input
          type="text"
          placeholder="Buscar por ID de paciente..."
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-pharmako-care"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-pharmako-care bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          <option value="SCHEDULED">Programada</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      {/* OPERATIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operationsList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-slate-200 border-dashed rounded-md bg-slate-50">
            No hay cirugías programadas.
          </div>
        ) : (
          operationsList.map((op) => {
            const dateStr = op.scheduled_date || op.scheduledDate;
            const isOffline = op._syncStatus === "created";
            
            return (
              <div
                key={op.id || op.uuid}
                className="p-4 bg-white border border-slate-200 rounded-md hover:border-pharmako-care/50 transition-colors flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Pte: {op.patient_account_id || op.patientUuid?.split("-")[0]}
                      </h3>
                      <p className="text-xs text-slate-500">{op.roomName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={op.status} />
                    {isOffline && (
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <span>Duración est.</span>
                    <span className="font-medium">{op.estimated_duration || op.estimatedDuration} min</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onOpenSupplyOrder(op)}
                    className="h-8 text-xs border-slate-200 text-slate-600 hover:text-pharmako-care"
                  >
                    <PackagePlus className="w-3 h-3 mr-1" />
                    Pedir Insumos
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 hover:text-slate-900">
                    Ver Detalles
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cn: string }> = {
    SCHEDULED: { label: "Programada", cn: "bg-blue-50 text-blue-600 border-blue-200" },
    IN_PROGRESS: { label: "En Progreso", cn: "bg-amber-50 text-amber-600 border-amber-200" },
    COMPLETED: { label: "Completada", cn: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    CANCELLED: { label: "Cancelada", cn: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  const info = map[status] || { label: status, cn: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium border rounded ${info.cn}`}>
      {info.label}
    </span>
  );
}
