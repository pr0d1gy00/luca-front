"use client";

import {
  User,
  Weight,
  Ruler,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Clock,
} from "lucide-react";
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
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function PatientContextCard({
  patient,
  vitals,
}: PatientContextCardProps) {
  const age = calculateAge(new Date(patient.birthDate));

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl p-8 border border-slate-200/50">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar className="size-20 ring-4 ring-slate-100">
          {patient.avatarUrl ? (
            <AvatarImage src={patient.avatarUrl} alt={patient.firstName} />
          ) : (
            <AvatarFallback className="bg-pharmako-care text-white text-xl">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-700">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-slate-500">
            {age} años · {biologicalSexLabels[patient.biologicalSex]}
          </p>
          <p className="text-xs text-slate-500/70 font-mono">
            {patient.documentId}
          </p>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Allergies - Red Badges */}
      {patient.allergies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Alergias
          </p>
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Condiciones Crónicas
          </p>
          <div className="flex flex-wrap gap-2">
            {patient.chronicConditions.map((condition, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="rounded-full font-medium text-xs bg-slate-100 text-slate-700"
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Últimos Signos Vitales
          </p>
          <div className="grid grid-cols-2 gap-3">
            {vitals.weight && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Weight className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Peso
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.weight}
                  </span>
                </div>
              </div>
            )}
            {vitals.height && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  <Ruler className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Estatura
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.height}
                  </span>
                </div>
              </div>
            )}
            {vitals.bloodPressure && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 col-span-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
                  <Activity className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Tensión Arterial
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.bloodPressure}
                  </span>
                </div>
              </div>
            )}
            {vitals.heartRate && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                  <Heart className="size-4 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Frec. Cardíaca
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.heartRate}
                  </span>
                </div>
              </div>
            )}
            {vitals.temperature && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <Thermometer className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Temperatura
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.temperature}
                  </span>
                </div>
              </div>
            )}
            {vitals.respiratoryRate && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                  <Clock className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Frec. Resp.
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.respiratoryRate}
                  </span>
                </div>
              </div>
            )}
            {vitals.oxygenSat && (
              <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                  <Wind className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Saturación O₂
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {vitals.oxygenSat}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
