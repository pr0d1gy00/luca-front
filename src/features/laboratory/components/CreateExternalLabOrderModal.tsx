"use client";

import { useState } from "react";
import { UserPlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateExternalLabOrder } from "../hooks/useLabQuotes";

interface CreateExternalLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateExternalLabOrderModal({
  isOpen,
  onClose,
}: CreateExternalLabOrderModalProps) {
  const createExternalOrderMutation = useCreateExternalLabOrder();

  const [patientName, setPatientName] = useState<string>("");
  const [patientDocument, setPatientDocument] = useState<string>("");
  const [exams, setExams] = useState<string[]>(["Hemograma Completo"]);
  const [newExamName, setNewExamName] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");

  if (!isOpen) return null;

  const handleAddExam = () => {
    if (newExamName.trim()) {
      setExams((prev) => [...prev, newExamName.trim()]);
      setNewExamName("");
    }
  };

  const handleRemoveExam = (index: number) => {
    setExams((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || exams.length === 0) return;

    await createExternalOrderMutation.mutateAsync({
      external_patient_name: patientName,
      external_patient_document: patientDocument,
      exams_list: exams,
      instructions,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-none my-8 overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Orden Externa (&quot;Walk-in&quot;)
              </h2>
              <p className="text-xs text-slate-500">
                Ingreso manual de examen recibido por mostrador fuera de
                Pharmako
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Nombre Completo del Paciente
              </label>
              <Input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ej: Carlos Rodríguez"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 bg-white shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Cédula / Documento de Identidad
              </label>
              <Input
                type="text"
                value={patientDocument}
                onChange={(e) => setPatientDocument(e.target.value)}
                placeholder="Ej: V-18.293.041"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 bg-white shadow-none"
              />
            </div>
          </div>

          {/* List of Exams */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Exámenes Solicitados
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                placeholder="Escribí un examen (ej: Glicemia en ayunas)"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 bg-white shadow-none"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExam}
                className="border-slate-200 bg-white rounded-xl px-4 shadow-none text-xs font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-1.5 pt-2">
              {exams.map((ex, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <span>● {ex}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExam(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Notas u Observaciones del Mostrador
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Ej: Orden médica física entregada en caja."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createExternalOrderMutation.isPending}
              className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-6"
            >
              {createExternalOrderMutation.isPending
                ? "Guardando..."
                : "Registrar Orden Externa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
