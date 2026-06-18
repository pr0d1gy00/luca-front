"use client";

import { Pencil, Trash2, Search, Pill, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import type { Medication } from "../schemas";
import { presentationLabels, administrationRouteLabels } from "../schemas";

interface MedicationTableProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onView: (medication: Medication) => void;
  onDelete: (activePrinciple: string) => void;
}

const tableHeadClassName =
  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500";
const tableCellClassName = "px-6 py-4.5 text-sm text-slate-600";
const tableCellPrimaryClassName =
  "px-6 py-4.5 text-sm font-semibold text-slate-900";

export function MedicationTable({
  medications,
  onEdit,
  onView,
  onDelete,
}: MedicationTableProps) {
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
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col gap-0 max-w-7xl"
    >
      {/* Unified Card Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 shrink-0">
            <Pill className="w-5 h-5 text-pharmako-care" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Lista de Medicamentos
            </h3>
            <p className="text-xs text-slate-500">
              Catálogo activo de compuestos médicos y comerciales
            </p>
          </div>
        </div>

        {/* Search Control */}
        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar medicamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 hover:bg-pharmako-care-light/10 focus-visible:border-pharmako-care focus-visible:bg-pharmako-care-light/30 focus-visible:ring-2 focus-visible:ring-pharmako-care/20"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className={tableHeadClassName}>Principio Activo</th>
              <th className={tableHeadClassName}>Nombre Comercial</th>
              <th className={tableHeadClassName}>Concentración</th>
              <th className={tableHeadClassName}>Presentación</th>
              <th className={tableHeadClassName}>Venta</th>
              <th className={tableHeadClassName}>Vía</th>
              <th className={`${tableHeadClassName} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  <Pill className="w-8 h-8 mx-auto mb-3 opacity-20 text-slate-500" />
                  No se encontraron medicamentos en el catálogo
                </td>
              </tr>
            ) : (
              filtered.map((medication, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  <td className={tableCellPrimaryClassName}>
                    {medication.activePrinciple}
                  </td>
                  <td className={tableCellClassName}>
                    {medication.commercialName || "—"}
                  </td>
                  <td className={tableCellClassName}>
                    {medication.concentration}
                  </td>
                  <td className={tableCellClassName}>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-teal-50 border-teal-100 text-teal-700 font-semibold px-2.5 py-0.5"
                    >
                      {presentationLabels[medication.presentation]}
                    </Badge>
                  </td>
                  <td className={tableCellClassName}>
                    {medication.requiresPrescription ? (
                      <Badge
                        variant="outline"
                        className="rounded-full bg-amber-50 border-amber-100 text-amber-700 font-semibold px-2.5 py-0.5"
                      >
                        Bajo Receta
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full bg-emerald-50 border-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5"
                      >
                        Venta Libre
                      </Badge>
                    )}
                  </td>
                  <td className={tableCellClassName}>
                    {administrationRouteLabels[medication.administrationRoute]}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(medication)}
                        title="Ver detalles"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Eye className="size-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(medication)}
                        title="Editar"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(medication.activePrinciple)}
                        title="Eliminar"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-red-650 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
