"use client";

import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Patient, Vitals } from "../schemas";
import { biologicalSexLabels } from "../schemas";

interface PatientContextCardProps {
  patient: Patient;
  vitals?: Vitals;
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

export function PatientContextCard({ patient, vitals }: PatientContextCardProps) {
  const age = calculateAge(new Date(patient.birthDate));

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl shadow-lg shadow-teal-900/5 p-8 border border-slate-100/50">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar className="size-20 ring-4 ring-slate-100">
          {patient.avatarUrl ? (
            <AvatarImage src={patient.avatarUrl} alt={patient.firstName} />
          ) : (
            <AvatarFallback className="bg-luca-primary text-luca-fg-on-primary text-xl">
              {patient.firstName[0]}{patient.lastName[0]}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-luca-muted-dark">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-luca-muted">
            {age} años · {biologicalSexLabels[patient.biologicalSex]}
          </p>
          <p className="text-xs text-luca-muted/70 font-mono">
            {patient.documentId}
          </p>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Allergies - Red Badges */}
      {patient.allergies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-luca-accent">Alergias</p>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, i) => (
              <Badge
                key={i}
                variant="destructive"
                className="rounded-full font-medium text-xs"
              >
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Chronic Conditions - Neutral/Blue Badges */}
      {patient.chronicConditions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-luca-muted">Condiciones Crónicas</p>
          <div className="flex flex-wrap gap-2">
            {patient.chronicConditions.map((condition, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="rounded-full font-medium text-xs bg-slate-100 text-luca-muted-dark"
              >
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-slate-100" />

      {/* Last Vitals */}
      {vitals && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-luca-muted">Últimos Signos Vitales</p>
          <div className="grid grid-cols-2 gap-3">
            {vitals.weight && (
              <div className="flex flex-col gap-0.5 bg-slate-50 rounded-2xl p-3">
                <span className="text-xs text-luca-muted">Peso</span>
                <span className="text-sm font-semibold text-luca-muted-dark">{vitals.weight}</span>
              </div>
            )}
            {vitals.bloodPressure && (
              <div className="flex flex-col gap-0.5 bg-slate-50 rounded-2xl p-3">
                <span className="text-xs text-luca-muted">Tensión</span>
                <span className="text-sm font-semibold text-luca-muted-dark">{vitals.bloodPressure}</span>
              </div>
            )}
            {vitals.heartRate && (
              <div className="flex flex-col gap-0.5 bg-slate-50 rounded-2xl p-3">
                <span className="text-xs text-luca-muted">FC</span>
                <span className="text-sm font-semibold text-luca-muted-dark">{vitals.heartRate}</span>
              </div>
            )}
            {vitals.temperature && (
              <div className="flex flex-col gap-0.5 bg-slate-50 rounded-2xl p-3">
                <span className="text-xs text-luca-muted">Temp</span>
                <span className="text-sm font-semibold text-luca-muted-dark">{vitals.temperature}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}