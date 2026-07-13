"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicalHistoryTimeline } from "./ClinicalHistoryTimeline";
import { ClinicalNotesForm } from "./ClinicalNotesForm";
import type { HistoryEntry, Consultation, Patient, Doctor } from "../schemas";

interface ConsultationTabsProps {
  historyEntries: HistoryEntry[];
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => void;
  patient?: Patient;
  doctor?: Doctor;
  defaultValues?: {
    motivoConsulta: string;
    examenFisico: string;
    diagnostico: string;
    prescriptions?: {
      medicationId: string;
      dose: string;
      frequency: string;
      duration: string;
      notes?: string;
    }[];
  };
  medicationsCatalog?: {
    id: string;
    activePrinciple: string;
    concentration: string;
    presentation: string;
  }[];
  isSubmitting?: boolean;
}

export function ConsultationTabs({
  historyEntries,
  onSubmit,
  onGeneratePrescription,
  patient,
  doctor,
  defaultValues,
  medicationsCatalog,
  isSubmitting,
}: ConsultationTabsProps) {
  return (
    <Tabs defaultValue="consultation" className="w-full">
      <TabsList className="w-full justify-start gap-1">
        <TabsTrigger
          value="history"
          className="text-pharmako-text-secondary hover:text-pharmako-text-primary data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-pharmako-care data-[state=active]:text-pharmako-care "
        >
          Historial Clínico
        </TabsTrigger>
        <TabsTrigger
          value="consultation"
          className="text-pharmako-text-secondary hover:text-pharmako-text-primary data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-pharmako-care data-[state=active]:text-pharmako-care "
        >
          Consulta Actual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" forceMount className="mt-6 data-[state=inactive]:hidden">
        <ClinicalHistoryTimeline entries={historyEntries} />
      </TabsContent>

      <TabsContent value="consultation" forceMount className="mt-6 data-[state=inactive]:hidden">
        <ClinicalNotesForm
          onSubmit={onSubmit}
          onGeneratePrescription={onGeneratePrescription}
          patient={patient}
          doctor={doctor}
          defaultValues={defaultValues}
          medicationsCatalog={medicationsCatalog}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  );
}
