"use client";

import { useMemo } from "react";
import { QrCode, Dna } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Doctor, Patient } from "../schemas";

interface DigitalLabRequestCardProps {
  doctor: Doctor;
  patient: Patient;
  examsList: string[];
  instructions?: string;
  issuanceDate: Date;
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
  if (documentId.includes("-")) return documentId;
  return `V-${documentId}`;
}

export function DigitalLabRequestCard({
  doctor,
  patient,
  examsList,
  instructions,
  issuanceDate,
}: DigitalLabRequestCardProps) {
  const age = calculateAge(new Date(patient.birthDate));
  const verificationCode = useMemo(() => "LAB-K8D9J2R4", []);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl border border-slate-200/80 p-8 max-w-2xl mx-auto rounded-xl">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Doctor Info */}
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl flex items-center justify-center">
            <Dna className="size-7 text-pharmako-care" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-slate-700">
              {doctor.name}
            </h2>
            <p className="text-sm text-slate-500">{doctor.specialty}</p>
          </div>
        </div>

        {/* Licenses */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-slate-500">M.P.P.S: {doctor.mpps}</span>
          <span className="text-xs text-slate-500">C.M: {doctor.cm}</span>
          <Badge
            variant="outline"
            className="rounded-full text-xs font-mono mt-1 border border-pharmako-care text-pharmako-care"
          >
            Orden de Laboratorio
          </Badge>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Patient Data ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">Paciente</span>
          <span className="text-sm font-semibold text-slate-700">
            {patient.firstName} {patient.lastName}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">Cédula de Identidad</span>
          <span className="text-sm font-semibold text-slate-700 font-mono">
            {formatId(patient.documentId)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">Edad</span>
          <span className="text-sm font-semibold text-slate-700">
            {age} años
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Fecha de Emisión:</span>
        <span className="font-medium text-slate-700">
          {formatDate(issuanceDate)}
        </span>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Exams Body ────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-serif text-pharmako-care italic">
            Rp.
          </span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Exámenes Solicitados
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {examsList.map((exam, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold text-pharmako-care border border-teal-100 h-10"
            >
              {exam}
            </span>
          ))}
        </div>

        {instructions && (
          <div className="mt-4">
            <span className="text-sm font-bold text-slate-700 block mb-1">Indicaciones / Preparación:</span>
            <div className="p-4 border-b border-t border-slate-200/50">
              <p className="text-sm text-slate-700 leading-relaxed">
                {instructions}
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-6">
        {/* Signature */}
        <div className="flex flex-col gap-2">
          <div className="h-12 w-40 bg-slate-100 rounded-xl flex items-center justify-center">
            <span className="text-xs text-slate-500/50 italic">
              Firma digital
            </span>
          </div>
          <span className="text-xs text-slate-500 text-center">
            Firma del Médico
          </span>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="size-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200">
            <QrCode className="size-12 text-slate-400" />
          </div>
          <span className="text-xs text-slate-500 text-center">
            Verifica este récipe en
            <br />
            <span className="font-medium text-teal-600">
              luca.health/labs
            </span>
          </span>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-500/60 text-center border-t border-slate-50 pt-4">
        Este récipe digital fue emitido a través de LUCA Health OS ·
        Verificación única: {verificationCode}
      </p>
    </div>
  );
}
