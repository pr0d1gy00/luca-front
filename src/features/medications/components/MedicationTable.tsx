"use client";

import { Pencil, Trash2, Search, Pill, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import type { Medication } from "../schemas";
import { presentationLabels, administrationRouteLabels } from "../schemas";
import { useAuthStore } from "@/store/auth";

interface MedicationTableProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onView: (medication: Medication) => void;
  onDelete: (uuid: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (newPage: number) => void;
  lastPage: number;
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
  search,
  onSearchChange,
  page,
  onPageChange,
  lastPage,
}: MedicationTableProps) {
  const { user } = useAuthStore();

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
            onChange={(e) => onSearchChange(e.target.value)}
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
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {medications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                  No se encontraron medicamentos.
                </td>
              </tr>
            ) : (
              medications.map((medication) => (
                <tr
                  key={medication.uuid}
                  className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                >
                  <td className={tableCellPrimaryClassName}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {medication.activePrinciple}
                      </span>
                    </div>
                  </td>
                  <td className={tableCellClassName}>
                    {medication.commercialName || (
                      <span className="italic text-slate-400">Genérico</span>
                    )}
                  </td>
                  <td className={tableCellClassName}>
                    {medication.concentration}
                  </td>
                  <td className={tableCellClassName}>
                    {presentationLabels[medication.presentation]}
                  </td>
                  <td className={tableCellClassName}>
                    {medication.requiresPrescription ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 border-amber-200 text-amber-700 rounded-full font-medium"
                      >
                        Bajo Receta
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 border-emerald-200 text-emerald-700 rounded-full font-medium"
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
                      {medication.userId && medication.userId === user?.uuid && (
                        <>
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
                            onClick={() => onDelete(medication.uuid || "")}
                            title="Eliminar"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-red-650 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <span className="text-xs text-slate-500 font-medium">
            Página {page} de {lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage}
              className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
