"use client";

import { useMemo } from 'react';
import { QrCode, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Doctor, Patient, PrescriptionItem, Medication } from "../schemas";
import { presentationLabels } from "../schemas";

interface DigitalPrescriptionCardProps {
  doctor: Doctor;
  patient: Patient;
  prescriptions: PrescriptionItem[];
  medications: Medication[];
  issuanceDate: Date;
}

function getMedicationById(id: string, meds: Medication[]): Medication | undefined {
  return meds.find((m) => `${m.activePrinciple} ${m.concentration}` === id || m.id === id);
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
  const verificationCode = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl shadow-xl shadow-teal-900/10 border border-slate-100/80 p-8 max-w-2xl mx-auto">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Doctor Info */}
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-luca-primary/10 flex items-center justify-center">
            <Stethoscope className="size-7 text-luca-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-luca-muted-dark">
              {doctor.name}
            </h2>
            <p className="text-sm text-luca-muted">{doctor.specialty}</p>
          </div>
        </div>

        {/* Licenses */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-luca-muted">M.P.P.S: {doctor.mpps}</span>
          <span className="text-xs text-luca-muted">C.M: {doctor.cm}</span>
          <Badge variant="outline" className="rounded-full text-xs font-mono mt-1 bg-teal-50 border-teal-100 text-teal-700">
            Receta Digital
          </Badge>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Patient Data ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-luca-muted">Paciente</span>
          <span className="text-sm font-semibold text-luca-muted-dark">
            {patient.firstName} {patient.lastName}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-luca-muted">Cédula de Identidad</span>
          <span className="text-sm font-semibold text-luca-muted-dark font-mono">
            {formatId(patient.documentId)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-luca-muted">Edad</span>
          <span className="text-sm font-semibold text-luca-muted-dark">{age} años</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-luca-muted">
        <span>Fecha de Emisión:</span>
        <span className="font-medium text-luca-muted-dark">{formatDate(issuanceDate)}</span>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Rx Body ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-serif text-luca-primary italic">Rp.</span>
          <span className="text-sm font-medium text-luca-muted uppercase tracking-wide">Recíbase</span>
        </div>

        <ol className="flex flex-col gap-4">
          {prescriptions.map((item, index) => {
            const med = getMedicationById(item.medicationId, medications);
            return (
              <li key={index} className="flex flex-col gap-2">
                {/* Medication Name + Concentration */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-luca-muted-dark">
                    {med ? `${med.activePrinciple} ${med.concentration}` : item.medicationId}
                  </span>
                  {med && (
                    <span className="text-xs text-luca-muted">
                      {presentationLabels[med.presentation]} · {med.administrationRoute}
                    </span>
                  )}
                </div>

                {/* Instructions Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                  <p className="text-sm text-luca-muted-dark leading-relaxed">
                    <span className="font-medium">Indicaciones: </span>
                    {item.dose}, {item.frequency}, {item.duration}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-6">
        {/* Signature */}
        <div className="flex flex-col gap-2">
          <div className="h-12 w-40 bg-slate-100 rounded-xl flex items-center justify-center">
            <span className="text-xs text-luca-muted/50 italic">Firma digital</span>
          </div>
          <span className="text-xs text-luca-muted text-center">Firma del Médico</span>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="size-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200">
            <QrCode className="size-12 text-slate-400" />
          </div>
          <span className="text-xs text-luca-muted text-center">
            Verifica este récipe en<br />
            <span className="font-medium text-luca-primary">luca.health/rx</span>
          </span>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-luca-muted/60 text-center border-t border-slate-50 pt-4">
        Este récipe digital fue emitido a través de LUCA Health OS · Verificación única: {verificationCode}
      </p>
    </div>
  );
}