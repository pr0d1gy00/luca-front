"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search, Dna, FileText, Check } from "lucide-react";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useCreateLabRequest, useUpdateLabRequest } from "../hooks/useLabRequests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { LabRequest } from "@/features/offline/database/schema";

const COMMON_EXAMS = [
  "Hemograma Completo (CBC)",
  "Perfil Lipídico (Colesterol, Triglicéridos)",
  "Glucemia en Ayunas",
  "Urea y Creatinina (Función Renal)",
  "Perfil Hepático (TGO, TGP, Bilirrubinas)",
  "Examen General de Orina (EGO)",
  "Perfil Tiroideo (TSH, T3, T4)",
  "Electrolitos Séricos (Na, K, Cl)",
  "Ácido Úrico",
  "Hemoglobina Glicosilada (HbA1c)",
];

interface LabRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUuid?: string; // Preselected patient if called inside consultation/timeline
  consultationUuid?: string | null; // Preselected consultation if called inside consultation
  existingRequest?: LabRequest | null; // Preselected request if editing
  onSave?: (data: { uuid?: string; examsList: string[]; instructions: string }) => void;
}

export function LabRequestModal({
  isOpen,
  onClose,
  patientUuid,
  consultationUuid = null,
  existingRequest = null,
  onSave,
}: LabRequestModalProps) {
  const { data: patients = [] } = usePatients();
  const createMutation = useCreateLabRequest();
  const updateMutation = useUpdateLabRequest();

  // Form State
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string>("");
  const [patientSearch, setPatientSearch] = useState<string>("");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [customExam, setCustomExam] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");

  // Sync state if editing
  useEffect(() => {
    if (isOpen) {
      if (existingRequest) {
        setSelectedPatientUuid(existingRequest.patientUuid);
        setSelectedExams(existingRequest.examsList || []);
        setInstructions(existingRequest.instructions || "");
      } else {
        setSelectedPatientUuid(patientUuid || "");
        setSelectedExams([]);
        setCustomExam("");
        setInstructions("");
      }
      setPatientSearch("");
    }
  }, [isOpen, existingRequest, patientUuid]);

  // Handle patient selection when preselected
  useEffect(() => {
    if (patientUuid) {
      setSelectedPatientUuid(patientUuid);
    }
  }, [patientUuid]);

  const handleToggleExam = (exam: string) => {
    setSelectedExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customExam.trim();
    if (!trimmed) return;
    if (!selectedExams.includes(trimmed)) {
      setSelectedExams((prev) => [...prev, trimmed]);
    }
    setCustomExam("");
  };

  const handleRemoveExam = (exam: string) => {
    setSelectedExams((prev) => prev.filter((e) => e !== exam));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedPatientUuid) {
      toast.error("Por favor, selecciona un paciente.");
      return;
    }

    if (selectedExams.length === 0) {
      toast.error("Por favor, selecciona al menos un examen de laboratorio.");
      return;
    }

    try {
      if (onSave) {
        onSave({
          uuid: existingRequest?.uuid,
          examsList: selectedExams,
          instructions,
        });
      } else {
        if (existingRequest) {
          // Update
          await updateMutation.mutateAsync({
            uuid: existingRequest.uuid,
            examsList: selectedExams,
            instructions,
          });
          toast.success("Pedido de laboratorio actualizado correctamente.");
        } else {
          // Create
          await createMutation.mutateAsync({
            patientUuid: selectedPatientUuid,
            consultationUuid,
            examsList: selectedExams,
            instructions,
            isCompleted: false,
          });
          toast.success("Pedido de laboratorio generado correctamente.");
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pedido de laboratorio.");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = patientSearch.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.nationalId.includes(term)
    );
  });

  const selectedPatientData = patients.find((p) => p.uuid === selectedPatientUuid);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] xl:max-w-[768px] 2xl:max-w-[968px] w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="text-pharmako-care rounded-lg p-1.5">
              <Dna className="w-6 h-6" />
            </div>
            {existingRequest ? "Editar Pedido de Laboratorio" : "Nuevo Pedido de Laboratorio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Patient Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Paciente</label>
              {patientUuid ? (
                // Display Read-only preselected patient
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-slate-800">
                      {selectedPatientData ? `${selectedPatientData.firstName} ${selectedPatientData.lastName}` : "Cargando..."}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      DNI: {selectedPatientData?.nationalId}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-teal-50/50 border-teal-150 text-pharmako-care">
                    Preseleccionado
                  </Badge>
                </div>
              ) : (
                // Patient Selector Search List
                <div className="space-y-3">
                  {!selectedPatientUuid ? (
                    <div className="space-y-2">
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Buscar paciente por nombre o DNI..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20"
                        />
                      </div>

                      {patientSearch && (
                        <div className="border border-slate-150 rounded-xl max-h-48 overflow-y-auto bg-white divide-y divide-slate-100 shadow-sm">
                          {filteredPatients.length === 0 ? (
                            <p className="p-3 text-center text-xs text-slate-400">
                              No se encontraron pacientes
                            </p>
                          ) : (
                            filteredPatients.map((p) => (
                              <button
                                key={p.uuid}
                                type="button"
                                onClick={() => {
                                  setSelectedPatientUuid(p.uuid);
                                  setPatientSearch("");
                                }}
                                className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between text-sm transition-colors"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900">
                                    {p.firstName} {p.lastName}
                                  </span>
                                  <span className="text-xs text-slate-400 block mt-0.5">
                                    DNI: {p.nationalId}
                                  </span>
                                </div>
                                <span className="text-xs text-teal-600 font-semibold">Seleccionar</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-teal-50/20 border border-teal-100 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">
                          {selectedPatientData ? `${selectedPatientData.firstName} ${selectedPatientData.lastName}` : "Cargando..."}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          DNI: {selectedPatientData?.nationalId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientUuid("")}
                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Exam Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Exámenes de Laboratorio</label>

              {/* List of common exams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_EXAMS.map((exam) => {
                  const isChecked = selectedExams.includes(exam);
                  return (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => handleToggleExam(exam)}
                      className={`p-2.5 rounded-xl border text-left text-sm font-semibold flex items-center justify-between transition-all duration-150 ${isChecked
                        ? "border-pharmako-care bg-pharmako-care-light text-pharmako-care h-10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-350"
                        }`}
                    >
                      <span>{exam}</span>
                      {isChecked && <Check className="w-4 h-4 text-pharmako-care shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom exam input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar otro examen personalizado (ej: Glucosa postprandial)..."
                    value={customExam}
                    onChange={(e) => setCustomExam(e.target.value)}
                    className="h-10 px-3 flex-1 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-450 outline-none focus:border-teal-605"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomExam}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </Button>
                </div>
              </div>

              {/* Selected Exams Badges */}
              {selectedExams.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Exámenes seleccionados ({selectedExams.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    {selectedExams.map((exam) => (
                      <Badge
                        key={exam}
                        variant="secondary"
                        className="bg-white border border-slate-200 text-slate-800 rounded-lg py-1 pl-2.5 pr-1.5 flex items-center gap-1.5 text-sm h-10"
                      >
                        {exam}
                        <button
                          type="button"
                          onClick={() => handleRemoveExam(exam)}
                          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Indicaciones / Preparación</label>
              <textarea
                placeholder="Indica si requiere ayuno de 8 horas, abstinencia, o alguna otra preparación..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-605"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl h-12"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-pharmako-care hover:bg-pharmako-care-hover text-white rounded-xl font-bold flex items-center gap-2 h-12"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {existingRequest
                ? "Guardar Cambios"
                : onSave
                ? "Guardar Examen"
                : "Emitir Receta de Exámenes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
