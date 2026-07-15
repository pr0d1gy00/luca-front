"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Share2, Loader2, CheckCircle2 } from "lucide-react";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useShareClinicalHistorySchema } from "@/lib/api/clinical-history/schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Patient {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  email?: string;
}

interface ShareTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateUuid: string;
  templateName: string;
}

export function ShareTemplateModal({
  isOpen,
  onClose,
  templateUuid,
  templateName,
}: ShareTemplateModalProps) {
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const shareMutation = useShareClinicalHistorySchema();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string | null>(
    null,
  );

  // Filter patients by search term
  const filteredPatients = (patients as Patient[]).filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const doc = patient.national_id?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || doc.includes(search);
  });

  async function handleShare() {
    if (!selectedPatientUuid) {
      toast.error("Por favor, selecciona un paciente.");
      return;
    }

    try {
      await shareMutation.mutateAsync({
        patient_uuid: selectedPatientUuid,
        form_template_uuid: templateUuid,
      });
      toast.success("Plantilla compartida correctamente con el paciente.");
      onClose();
      // Reset state
      setSelectedPatientUuid(null);
      setSearchTerm("");
    } catch {
      toast.error("Error al compartir la plantilla.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" />
            Compartir Plantilla
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Envía la plantilla{" "}
            <strong className="text-slate-800">
              &quot;{templateName}&quot;
            </strong>{" "}
            a un paciente para que la complete desde su portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nombre o DNI..."
              className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-xs text-slate-950 placeholder:text-slate-400 transition-all outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          {/* Patients List */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {isLoadingPatients ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  Cargando pacientes...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No se encontraron pacientes.
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatientUuid === patient.uuid;
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => setSelectedPatientUuid(patient.uuid)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center justify-between text-left transition-colors text-xs",
                        isSelected
                          ? "bg-teal-50/60"
                          : "hover:bg-slate-50 bg-white",
                      )}
                    >
                      <div>
                        <span className="block font-bold text-slate-900">
                          {patient.first_name} {patient.last_name}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          DNI: {patient.national_id || "No registrado"} •{" "}
                          {patient.email || "Sin email"}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-250 bg-white" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 rounded-xl text-xs px-4 text-slate-500 hover:bg-slate-100"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleShare}
            disabled={!selectedPatientUuid || shareMutation.isPending}
            className="h-10 rounded-xl text-xs px-5 bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none font-semibold flex items-center gap-2"
          >
            {shareMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Compartir Formulario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
