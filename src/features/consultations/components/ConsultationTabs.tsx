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
}

export function ConsultationTabs({
  historyEntries,
  onSubmit,
  onGeneratePrescription,
  patient,
  doctor,
}: ConsultationTabsProps) {
  return (
    <Tabs defaultValue="consultation" className="w-full">
      <TabsList className="w-full justify-start rounded-2xl bg-slate-100 p-1 gap-1">
        <TabsTrigger
          value="history"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]: data-[state=active]:text-slate-700"
        >
          Historial Clínico
        </TabsTrigger>
        <TabsTrigger
          value="consultation"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]: data-[state=active]:text-slate-700"
        >
          Consulta Actual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-6">
        <ClinicalHistoryTimeline entries={historyEntries} />
      </TabsContent>

      <TabsContent value="consultation" className="mt-6">
        <ClinicalNotesForm
          onSubmit={onSubmit}
          onGeneratePrescription={onGeneratePrescription}
          patient={patient}
          doctor={doctor}
        />
      </TabsContent>
    </Tabs>
  );
}
