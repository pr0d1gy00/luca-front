"use client";

import { Pencil, Trash2, Search, Pill } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Medication } from "../schemas";
import { presentationLabels, administrationRouteLabels } from "../schemas";

interface MedicationTableProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
  onCreate: () => void;
}

const searchInputClassName =
  "h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-luca-muted-dark placeholder:text-luca-muted/50 focus:outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20";

const tableHeadClassName = "px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted";
const tableCellClassName = "px-5 py-4 text-sm text-luca-muted";
const tableCellPrimaryClassName = "px-5 py-4 text-sm font-medium text-luca-muted-dark";

const PRESENTATION_VARIANT: Record<string, "outline" | "secondary" | "default" | "destructive" | null | undefined> = {
  CAPSULA: "outline",
  TABLETA: "outline",
  JARABE: "outline",
  GOTAS: "outline",
  AMPOLLA: "outline",
  CREMA: "outline",
};

export function MedicationTable({ medications, onEdit, onDelete, onCreate }: MedicationTableProps) {
  const [search, setSearch] = useState("");

  const filtered = medications.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.commercialName?.toLowerCase().includes(term) ||
      m.activePrinciple.toLowerCase().includes(term) ||
      m.concentration.toLowerCase().includes(term)
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
            placeholder="Buscar medicamento..."
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
          <Pill className="size-4" />
          Nuevo Medicamento
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={tableHeadClassName}>Principio Activo</th>
              <th className={tableHeadClassName}>Nombre Comercial</th>
              <th className={tableHeadClassName}>Concentración</th>
              <th className={tableHeadClassName}>Presentación</th>
              <th className={tableHeadClassName}>Vía</th>
              <th className={`${tableHeadClassName} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-luca-muted">
                  No se encontraron medicamentos
                </td>
              </tr>
            ) : (
              filtered.map((medication, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0 hover:bg-luca-surface-light transition-colors"
                >
                  <td className={tableCellPrimaryClassName}>
                    {medication.activePrinciple}
                  </td>
                  <td className={tableCellClassName}>
                    {medication.commercialName ?? "—"}
                  </td>
                  <td className={tableCellClassName}>{medication.concentration}</td>
                  <td className={tableCellClassName}>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-teal-50 border-teal-100 text-teal-700 font-medium"
                    >
                      {presentationLabels[medication.presentation]}
                    </Badge>
                  </td>
                  <td className={tableCellClassName}>
                    {administrationRouteLabels[medication.administrationRoute]}
                  </td>
                  <td className={tableCellClassName}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(medication)}
                        title="Editar"
                        className="rounded-xl hover:bg-luca-surface-dark"
                      >
                        <Pencil className="size-4 text-luca-muted" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(medication.activePrinciple)}
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