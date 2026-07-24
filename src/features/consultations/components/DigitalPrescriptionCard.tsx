"use client";

import { useMemo } from "react";
import { QrCode, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Doctor, Patient, PrescriptionItem, Medication } from "../schemas";
import { presentationLabels } from "../schemas";

interface DigitalPrescriptionCardProps {
  doctor: Doctor;
  patient: Patient;
  prescriptions: PrescriptionItem[];
  medications: Medication[];
  issuanceDate: Date;
}

function getMedicationById(
  id: string,
  meds: Medication[],
): Medication | undefined {
  return meds.find(
    (m: any) =>
      m.uuid === id ||
      m.id === id ||
      `${m.activePrinciple} ${m.concentration}` === id,
  );
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatId(documentId: string): string {
  // Assuming Venezuelan ID format V- or E- followed by numbers
  if (documentId.includes("-")) return documentId;
  return `V-${documentId}`;
}

export function DigitalPrescriptionCard({
  doctor,
  patient,
  prescriptions,
  medications,
  issuanceDate,
}: DigitalPrescriptionCardProps) {
  const age = calculateAge(new Date(patient.birthDate));
  const verificationCode = useMemo(() => "RX-A4F8K2M9", []);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-auto shadow-sm">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Doctor Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-12 sm:size-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/60">
            <Stethoscope className="size-6 sm:size-7 text-pharmako-care" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {doctor.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{doctor.specialty}</p>
          </div>
        </div>

        {/* Licenses */}
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <div className="flex flex-wrap sm:flex-col gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <span>M.P.P.S: {doctor.mpps}</span>
            <span className="hidden sm:inline">•</span>
            <span>C.M: {doctor.cm}</span>
          </div>
          <Badge
            variant="outline"
            className="rounded-full text-xs font-mono mt-1 border-teal-200 bg-teal-50/50 text-pharmako-care w-fit"
          >
            Receta Digital
          </Badge>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Patient Data ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Paciente</span>
          <span className="text-sm font-semibold text-slate-800 truncate">
            {patient.firstName} {patient.lastName}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Cédula de Identidad</span>
          <span className="text-sm font-semibold text-slate-800 font-mono">
            {formatId(patient.documentId)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Edad</span>
          <span className="text-sm font-semibold text-slate-800">
            {age} años
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Fecha de Emisión:</span>
        <span className="font-semibold text-slate-700">
          {formatDate(issuanceDate)}
        </span>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Rx Body ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl font-serif text-pharmako-care italic font-bold">
            Rp.
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
            Recíbase
          </span>
        </div>

        <ol className="flex flex-col gap-3">
          {prescriptions.map((item, index) => {
            const med = getMedicationById(item.medicationId, medications);
            return (
              <li key={index} className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                {/* Medication Name + Concentration */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm sm:text-base font-bold text-slate-800 break-words">
                    {med
                      ? med.commercialName
                        ? `${med.commercialName} (${med.activePrinciple}) ${med.concentration}`
                        : `${med.activePrinciple} ${med.concentration}`
                      : item.medicationId}
                  </span>
                  {med && (
                    <span className="text-xs text-slate-500 font-medium">
                      {presentationLabels[med.presentation] || med.presentation} ·{" "}
                      {med.administrationRoute}
                    </span>
                  )}
                </div>

                {/* Instructions Box */}
                <div className="p-3 bg-white rounded-lg border border-slate-200/60">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
                    <span className="font-bold text-slate-900">Indicaciones: </span>
                    {item.dose}, {item.frequency}, {item.duration}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic border-t border-slate-100 pt-1">
                      Nota: {item.notes}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6 pt-1">
        {/* Signature */}
        <div className="flex flex-col items-center sm:items-start gap-1.5 w-full sm:w-auto">
          <div className="h-14 w-full sm:w-44 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-xs text-slate-400 italic">
              Firma digital
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 text-center sm:text-left">
            Firma del Médico
          </span>
        </div>

        {/* QR Code */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-100 w-full sm:w-auto justify-center sm:justify-start">
          <div className="size-14 sm:size-16 rounded-xl bg-white flex items-center justify-center border border-slate-200 shrink-0">
            <QrCode className="size-8 sm:size-10 text-slate-600" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 font-medium">Verificación digital</span>
            <span className="text-xs font-bold text-pharmako-care font-mono">
              {verificationCode}
            </span>
            <span className="text-[10px] text-slate-400">
              luca.health/rx
            </span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
        Este récipe digital fue emitido a través de LUCA Health OS
      </p>
    </div>
  );
}
