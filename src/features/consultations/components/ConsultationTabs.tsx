"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicalHistoryTimeline } from "./ClinicalHistoryTimeline";
import { ClinicalNotesForm } from "./ClinicalNotesForm";
import type { HistoryEntry, Consultation } from "../schemas";

interface ConsultationTabsProps {
  historyEntries: HistoryEntry[];
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => void;
}

export function ConsultationTabs({ historyEntries, onSubmit, onGeneratePrescription }: ConsultationTabsProps) {
  return (
    <Tabs defaultValue="consultation" className="w-full">
      <TabsList className="w-full justify-start rounded-2xl bg-slate-100 p-1 gap-1">
        <TabsTrigger
          value="history"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-luca-muted-dark"
        >
          Historial Clínico
        </TabsTrigger>
        <TabsTrigger
          value="consultation"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-luca-muted-dark"
        >
          Consulta Actual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-6">
        <ClinicalHistoryTimeline entries={historyEntries} />
      </TabsContent>

      <TabsContent value="consultation" className="mt-6">
        <ClinicalNotesForm onSubmit={onSubmit} onGeneratePrescription={onGeneratePrescription} />
      </TabsContent>
    </Tabs>
  );
}