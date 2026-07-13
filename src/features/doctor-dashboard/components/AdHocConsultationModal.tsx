"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, X, AlertCircle } from "lucide-react";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useCreateAppointment } from "@/features/appointments/hooks/useAppointments";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { getLocalTodayString } from "@/lib/utils";
import { toast } from "sonner";

interface AdHocConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdHocConsultationModal({ isOpen, onClose }: AdHocConsultationModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const createAppointment = useCreateAppointment();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      p.nationalId.toLowerCase().includes(term)
    );
  });

  const selectedPatient = patients.find((p) => p.uuid === selectedPatientUuid);

  const handleStart = async () => {
    if (!selectedPatientUuid || !user?.uuid) {
      toast.error("Por favor, selecciona un paciente.");
      return;
    }

    try {
      const today = getLocalTodayString();
      const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false }).substring(0, 5);

      const apt = await createAppointment.mutateAsync({
        patientUuid: selectedPatientUuid,
        doctorUuid: user.uuid,
        date: today,
        time: nowTime,
        type: "EXCEPTION",
        reason: "Consulta Excepcional / Ad-hoc",
        notes: notes || undefined,
      });

      toast.success("Consulta excepcional iniciada correctamente.");
      
      // Reset state
      setSelectedPatientUuid(null);
      setSearchTerm("");
      setNotes("");
      
      onClose();
      router.push(`/dashboard/consultations/${apt.uuid}`);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo iniciar la consulta excepcional.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-pharmako-care-light rounded-xl p-2 text-pharmako-care">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Consulta Excepcional / Ad-hoc
              </h3>
              <p className="text-xs text-slate-500">
                Iniciar consulta inmediata sin reservar turno en agenda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Informative Alert */}
          <div className="flex gap-2.5 p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block">Modo de Consulta Excepcional</span>
              <p className="mt-0.5 text-amber-700/90 leading-relaxed">
                Esta opción creará un registro de consulta inmediata para el paciente seleccionado, saltándose las restricciones de disponibilidad de agenda del día.
              </p>
            </div>
          </div>

          {/* Select Patient */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Seleccionar Paciente
            </label>
            
            {selectedPatient ? (
              <div className="bg-pharmako-care-light/10 border border-pharmako-care-light/35 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    C.I. {selectedPatient.nationalId}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatientUuid(null)}
                  className="h-8 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar paciente por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 transition-all"
                  />
                </div>
                
                {/* Patients search list */}
                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[180px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/30">
                  {isLoadingPatients ? (
                    <div className="p-4 text-center text-xs text-slate-400">Cargando pacientes...</div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No se encontraron pacientes.
                    </div>
                  ) : (
                    filteredPatients.map((p) => (
                      <button
                        key={p.uuid}
                        type="button"
                        onClick={() => setSelectedPatientUuid(p.uuid)}
                        className="w-full p-2.5 hover:bg-slate-50 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-slate-400 block mt-0.5">
                            C.I. {p.nationalId}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-pharmako-care">
                          Seleccionar →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Notas u Observaciones (Opcional)
            </label>
            <textarea
              placeholder="Ej. Paciente ingresa de urgencia o consulta especial pactada..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 outline-none hover:border-slate-300 focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 transition-all resize-none"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/40">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStart}
            disabled={!selectedPatientUuid || createAppointment.isPending}
            className="h-10 rounded-xl px-5 font-semibold text-white bg-pharmako-care hover:bg-pharmako-care/90 active:bg-pharmako-care"
          >
            {createAppointment.isPending ? "Iniciando..." : "Iniciar Consulta"}
          </Button>
        </div>

      </div>
    </div>
  );
}
