"use client";

import { Pencil, Trash2, Eye, Search, Users, FileText } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUpVariant } from "@/app/lib/animations";
import type { Patient } from "../schemas";
import { bloodTypeLabels, biologicalSexLabels } from "../schemas";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onView: (patient: Patient) => void;
  onCreate: () => void;
  onViewClinicalHistory?: (patient: Patient) => void;
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

const tableHeadClassName =
  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 select-none";
const tableCellClassName = "px-6 py-4 text-sm text-slate-500 font-medium";
const tableCellPrimaryClassName = "px-6 py-4 text-sm font-bold text-slate-900";

export function PatientTable({
  patients,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onViewClinicalHistory,
}: PatientTableProps) {
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
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
    >
      {/* Header con Buscador Unificado */}
      <div className="p-6 border-b border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Lista de Pacientes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Buscá, visualizá y gestioná las fichas clínicas de tus pacientes.
            </p>
          </div>
        </div>

        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 hover:bg-pharmako-care-light/10 focus-visible:border-pharmako-care focus-visible:bg-pharmako-care-light/30 focus-visible:ring-2 focus-visible:ring-pharmako-care/20"
          />
        </div>
      </div>

      {/* Contenido de la Tabla */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className={tableHeadClassName}>Paciente</th>
              <th className={tableHeadClassName}>Documento / DNI</th>
              <th className={tableHeadClassName}>Edad</th>
              <th className={tableHeadClassName}>Contacto</th>
              <th className={tableHeadClassName}>G. Sanguíneo</th>
              <th className={`${tableHeadClassName} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-sm text-slate-450"
                >
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-20 text-slate-500" />
                  No se encontraron pacientes en tu lista
                </td>
              </tr>
            ) : (
              filtered.map((patient) => (
                <tr
                  key={patient.documentId}
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  <td className={tableCellPrimaryClassName}>
                    <div>
                      <span className="block font-bold text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                        {biologicalSexLabels[patient.biologicalSex]}
                      </span>
                    </div>
                  </td>
                  <td className={tableCellClassName}>{patient.documentId}</td>
                  <td className={tableCellClassName}>
                    {calculateAge(new Date(patient.birthDate))} años
                  </td>
                  <td className={tableCellClassName}>
                    <div>
                      <span className="block text-slate-700 font-medium">
                        {patient.phone}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {patient.email}
                      </span>
                    </div>
                  </td>
                  <td className={tableCellClassName}>
                    <Badge
                      variant="outline"
                      className="font-semibold text-xs rounded-full bg-teal-50 border-teal-100 text-teal-700 px-2.5 py-0.5"
                    >
                      {bloodTypeLabels[patient.bloodType]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      {onViewClinicalHistory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewClinicalHistory(patient)}
                          title="Ver Historia Clínica"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-pharmako-care hover:text-pharmako-care/80 transition-colors"
                        >
                          <FileText className="size-4.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(patient)}
                        title="Ver detalles"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Eye className="size-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(patient)}
                        title="Editar"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(patient.documentId)}
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
