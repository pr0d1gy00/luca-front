"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Calendar, Clock, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useCreateFollowUp } from "../hooks/useConsultationMutations";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUuid?: string;
  consultationUuid?: string;
}

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  patientUuid,
  consultationUuid,
}: ScheduleFollowUpModalProps) {
  const isOnline = useOnlineStatus();
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const createFollowUp = useCreateFollowUp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string | null>(null);
  const [latestConsultations, setLatestConsultations] = useState<any[]>([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  
  const [selectedConsultationUuid, setSelectedConsultationUuid] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL">("MANUAL_CALL");
  const [messageTemplate, setMessageTemplate] = useState("");

  // Lock selected patient if patientUuid prop is supplied
  useEffect(() => {
    if (patientUuid) {
      setSelectedPatientUuid(patientUuid);
    } else {
      setSelectedPatientUuid(null);
    }
  }, [patientUuid, isOpen]);

  // Lock selected consultation if consultationUuid prop is supplied
  useEffect(() => {
    if (consultationUuid) {
      setSelectedConsultationUuid(consultationUuid);
    } else {
      setSelectedConsultationUuid(null);
    }
  }, [consultationUuid, isOpen]);

  // Set default date to today + 7 days
  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setScheduledDate(defaultDate.toISOString().split("T")[0]);
      setChannel("MANUAL_CALL");
      setMessageTemplate("");
    }
  }, [isOpen]);

  // Fetch consultations when patient changes
  useEffect(() => {
    const fetchConsultations = async () => {
      const activePatientUuid = patientUuid || selectedPatientUuid;
      if (!activePatientUuid) {
        setLatestConsultations([]);
        return;
      }

      setIsLoadingConsultations(true);
      try {
        if (!isOnline) {
          // Fetch from Dexie
          const localCons = await db.consultations
            .where("patientUuid")
            .equals(activePatientUuid)
            .toArray();
          // Sort by date desc and take top 4
          const sorted = localCons
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4);
          setLatestConsultations(sorted);
        } else {
          // Fetch from API
          const { data } = await apiClient.get("/consultations", {
            params: {
              patient_uuid: activePatientUuid,
            },
          });
          const apiItems = data?.data?.data ?? data?.data ?? [];
          setLatestConsultations(apiItems.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching consultations:", err);
      } finally {
        setIsLoadingConsultations(false);
      }
    };

    fetchConsultations();
  }, [selectedPatientUuid, patientUuid, isOnline]);

  // Update default message template when patient, date, or consultation changes
  useEffect(() => {
    const activePatientUuid = patientUuid || selectedPatientUuid;
    if (!activePatientUuid) return;

    const patientObj = patients.find((p) => p.uuid === activePatientUuid);
    const patientName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : "Paciente";
    
    let diagnosis = "su tratamiento";
    if (selectedConsultationUuid) {
      const selectedCons = latestConsultations.find((c) => c.uuid === selectedConsultationUuid);
      if (selectedCons) {
        diagnosis = selectedCons.diagnosis || selectedCons.reason || "su tratamiento";
      }
    }

    setMessageTemplate(
      `Hola ${patientName}, te saluda el equipo médico de LUCA OS. Queremos dar seguimiento a tu evolución de "${diagnosis}". ¿Cómo te has sentido?`
    );
  }, [selectedPatientUuid, patientUuid, selectedConsultationUuid, latestConsultations, patients]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(term) || p.nationalId.toLowerCase().includes(term);
  });

  const activePatientUuid = patientUuid || selectedPatientUuid;
  const selectedPatient = patients.find((p) => p.uuid === activePatientUuid);

  const handleSave = async () => {
    if (!activePatientUuid) {
      toast.error("Por favor, selecciona un paciente.");
      return;
    }
    if (!scheduledDate) {
      toast.error("Por favor, selecciona una fecha de contacto.");
      return;
    }

    try {
      await createFollowUp.mutateAsync({
        patientUuid: activePatientUuid,
        consultationUuid: selectedConsultationUuid,
        scheduledDate,
        channel,
        messageTemplate: channel !== "MANUAL_CALL" ? messageTemplate : null,
      });

      // Reset local state if not locked
      if (!patientUuid) setSelectedPatientUuid(null);
      if (!consultationUuid) setSelectedConsultationUuid(null);
      setSearchTerm("");
      
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl bg-white border border-slate-200 max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl text-left">
        <DialogHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-50 rounded-xl p-2.5 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 text-lg font-bold">
                Programar Seguimiento Clínico
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                Define cuándo y cómo volver a contactar al paciente después de su consulta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* 1. Seleccionar Paciente */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Paciente
            </label>

            {selectedPatient ? (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-800">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5 font-medium">
                    DNI: {selectedPatient.nationalId} | Teléfono: {selectedPatient.phone}
                  </span>
                </div>
                {!patientUuid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatientUuid(null);
                      setSelectedConsultationUuid(null);
                    }}
                    className="h-8 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Cambiar
                  </Button>
                )}
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
                    className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/10"
                  />
                </div>
                {searchTerm && (
                  <div className="border border-slate-200 rounded-xl bg-white max-h-40 overflow-y-auto divide-y divide-slate-100 shadow-sm">
                    {filteredPatients.length === 0 ? (
                      <div className="p-3.5 text-center text-xs text-slate-400 italic">
                        No se encontraron pacientes
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.uuid}
                          type="button"
                          onClick={() => setSelectedPatientUuid(p.uuid)}
                          className="w-full text-left p-3 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-between"
                        >
                          <span className="text-slate-800 font-bold">{p.firstName} {p.lastName}</span>
                          <span className="text-xs text-slate-400 font-medium">CI: {p.nationalId}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Seleccionar Consulta */}
          {selectedPatient && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Vincular a Consulta Reciente
              </label>

              {isLoadingConsultations ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Cargando consultas previas...
                </div>
              ) : latestConsultations.length === 0 ? (
                <div className="flex gap-2.5 p-3 bg-slate-50 border border-slate-150 rounded-xl text-slate-500 text-xs italic">
                  <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
                  No se registran consultas médicas previas para este paciente. El seguimiento será general.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {latestConsultations.map((cons) => {
                    const isSelected = selectedConsultationUuid === cons.uuid;
                    const dateFormatted = new Date(cons.date || cons.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    });
                    return (
                      <button
                        key={cons.uuid}
                        type="button"
                        onClick={() => setSelectedConsultationUuid(isSelected ? null : cons.uuid)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/40 text-teal-700 font-semibold"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">{dateFormatted}</span>
                          {isSelected && <span className="text-[10px] font-bold text-teal-600">Vinculado</span>}
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {cons.diagnosis || cons.reason || "Consulta médica"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Formulario de Seguimiento */}
          {selectedPatient && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Fecha de Contacto
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Canal de Comunicación
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "MANUAL_CALL", label: "Llamada" },
                      { value: "WHATSAPP", label: "WhatsApp" },
                      { value: "EMAIL", label: "Correo" },
                      { value: "INTERNAL_CHAT", label: "Chat LUCA" },
                    ].map((chan) => {
                      const isSelected = channel === chan.value;
                      return (
                        <button
                          key={chan.value}
                          type="button"
                          onClick={() => setChannel(chan.value as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "border-teal-600 bg-teal-50/50 text-teal-600"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xs font-bold">{chan.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {channel !== "MANUAL_CALL" && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Mensaje / Plantilla a Enviar
                  </label>
                  <textarea
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Redactá el mensaje de control para el paciente..."
                    className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[100px]"
                  />
                  <p className="text-xxs text-slate-400">
                    Podés usar tags como <code className="font-semibold text-slate-500">{"{{paciente}}"}</code> o <code className="font-semibold text-slate-500">{"{{diagnostico}}"}</code>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-11 px-6 font-semibold hover:bg-slate-50 transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedPatient || createFollowUp.isPending}
            className="rounded-xl bg-pharmako-care hover:bg-pharmako-care h-11 text-white font-semibold px-6 transition-all"
          >
            {createFollowUp.isPending ? "Agendando..." : "Agendar Seguimiento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
