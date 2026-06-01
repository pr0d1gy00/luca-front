"use client";

import { Pencil, Trash2, Eye, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "../schemas";
import { bloodTypeLabels, biologicalSexLabels } from "../schemas";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onView: (patient: Patient) => void;
  onCreate: () => void;
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

const searchInputClassName =
  "h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-luca-muted-dark placeholder:text-luca-muted/50 focus:outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20";

const tableHeadClassName = "px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted";
const tableCellClassName = "px-5 py-4 text-sm text-luca-muted";
const tableCellPrimaryClassName = "px-5 py-4 text-sm font-medium text-luca-muted-dark";

export function PatientTable({ patients, onEdit, onDelete, onView, onCreate }: PatientTableProps) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.documentId.includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-luca-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={searchInputClassName}
          />
        </div>
        <Button
          onClick={onCreate}
          size="sm"
          className="gap-1.5 rounded-xl bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover"
        >
          <UserPlus className="size-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={tableHeadClassName}>Paciente</th>
              <th className={tableHeadClassName}>DNI</th>
              <th className={tableHeadClassName}>Edad</th>
              <th className={tableHeadClassName}>Contacto</th>
              <th className={tableHeadClassName}>Sangre</th>
              <th className={`${tableHeadClassName} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-luca-muted">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              filtered.map((patient) => (
                <tr
                  key={patient.documentId}
                  className="border-b border-slate-100 last:border-0 hover:bg-luca-surface-light transition-colors"
                >
                  <td className={tableCellPrimaryClassName}>
                    <div>
                      <p>{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-luca-muted mt-0.5">
                        {biologicalSexLabels[patient.biologicalSex]}
                      </p>
                    </div>
                  </td>
                  <td className={tableCellClassName}>{patient.documentId}</td>
                  <td className={tableCellClassName}>
                    {calculateAge(new Date(patient.birthDate))} años
                  </td>
                  <td className={tableCellClassName}>
                    <div>
                      <p className="text-luca-muted-dark">{patient.phone}</p>
                      <p className="text-xs text-luca-muted mt-0.5">{patient.email}</p>
                    </div>
                  </td>
                  <td className={tableCellClassName}>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs rounded-full border-luca-surface-dark text-luca-muted-dark"
                    >
                      {bloodTypeLabels[patient.bloodType]}
                    </Badge>
                  </td>
                  <td className={tableCellClassName}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(patient)}
                        title="Ver detalles"
                        className="rounded-xl hover:bg-luca-surface-dark"
                      >
                        <Eye className="size-4 text-luca-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(patient)}
                        title="Editar"
                        className="rounded-xl hover:bg-luca-surface-dark"
                      >
                        <Pencil className="size-4 text-luca-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(patient.documentId)}
                        title="Eliminar"
                        className="rounded-xl hover:bg-luca-surface-dark"
                      >
                        <Trash2 className="size-4 text-luca-accent" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}