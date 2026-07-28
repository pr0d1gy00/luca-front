"use client";

import { Pill, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicationScheduleProps {
  medications: any[];
}

export function MedicationSchedule({ medications }: MedicationScheduleProps) {
  if (!medications || medications.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-200 border-dashed rounded bg-slate-50">
        No hay medicamentos programados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map((med) => (
        <div key={med.id || med.uuid} className="bg-white border border-slate-200 p-3 rounded-md flex justify-between items-center group hover:border-pharmako-care/50 transition-colors">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${med.status === 'ADMINISTERED' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900">{med.medicationName || "Medicamento"}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Dosis: {med.dosage} • Vía: {med.route}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(med.scheduledTime || med.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {med.status === "ADMINISTERED" && (
                  <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Administrado a las {new Date(med.administeredTime || med.administered_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {med.status !== "ADMINISTERED" && (
            <Button size="sm" variant="outline" className="text-xs h-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-pharmako-care">
              Administrar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
