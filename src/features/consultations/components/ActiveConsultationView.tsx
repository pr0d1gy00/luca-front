"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PatientContextCard } from "./PatientContextCard";
import { ConsultationTabs } from "./ConsultationTabs";
import { DigitalPrescriptionCard } from "./DigitalPrescriptionCard";
import type {
  Patient,
  Vitals,
  HistoryEntry,
  Consultation,
  Doctor,
  Medication,
} from "../schemas";

interface ActiveConsultationViewProps {
  patient: Patient;
  vitals?: Vitals;
  historyEntries: HistoryEntry[];
  doctor: Doctor;
  medications: Medication[];
}

export function ActiveConsultationView({
  patient,
  vitals,
  historyEntries,
  doctor,
  medications,
}: ActiveConsultationViewProps) {
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [completedConsultation, setCompletedConsultation] =
    useState<Consultation | null>(null);

  const handleGeneratePrescription = (data: Consultation) => {
    setCompletedConsultation(data);
    setPrescriptionOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Patient Context (sticky) ─────────── */}
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <PatientContextCard patient={patient} vitals={vitals} />
        </div>

        {/* ── Right Column: Work Canvas ───────────────────── */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200/50 p-8">
            <ConsultationTabs
              historyEntries={historyEntries}
              onSubmit={() => {}}
              onGeneratePrescription={handleGeneratePrescription}
            />
          </div>
        </div>
      </div>

      {/* ── Prescription Sheet ─────────────────────────────── */}
      <Sheet open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50 rounded-l-3xl p-6">
          <SheetHeader className="pb-6 border-b border-slate-200">
            <SheetTitle className="text-slate-700 font-heading text-xl">
              Récipe Médico Digital
            </SheetTitle>
          </SheetHeader>
          {completedConsultation && (
            <div className="mt-6">
              <DigitalPrescriptionCard
                doctor={doctor}
                patient={patient}
                prescriptions={completedConsultation.prescriptions}
                medications={medications}
                issuanceDate={new Date()}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
