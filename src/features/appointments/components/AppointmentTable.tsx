"use client";

import { useState } from "react";
import { Search, Calendar, Clock, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment, DoctorOption } from "../types";
import { appointmentStatusLabels, appointmentTypeLabels } from "../types";

interface AppointmentTableProps {
  appointments: Appointment[];
  doctors: DoctorOption[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onView: (appointment: Appointment) => void;
  onCreate: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  IN_ROOM: "bg-teal-50 text-teal-700 border border-teal-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-500 border border-slate-200",
  NO_SHOW: "bg-red-50 text-red-700 border border-red-200",
};

function formatDate(dateStr: string): string {
  // Add T12:00:00 to prevent timezone shifting (localizing UTC midnight to previous day)
  const safeDateStr = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(safeDateStr));
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const safeDateStr = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
  const d = new Date(safeDateStr);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function AppointmentTable({
  appointments,
  doctors,
  onEdit,
  onDelete,
  onView,
  onCreate,
}: AppointmentTableProps) {
  const [search, setSearch] = useState("");

  const filtered = appointments.filter((apt) => {
    const doctor = doctors.find((d) => d.uuid === apt.doctorUuid);
    const term = search.toLowerCase();
    return (
      (apt.reason?.toLowerCase().includes(term) ?? false) ||
      apt.time.includes(term) ||
      (doctor?.fullName.toLowerCase().includes(term) ?? false) ||
      apt.doctorUuid.includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por doctor, motivo u hora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <Button
          onClick={onCreate}
          size="sm"
          className="gap-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
        >
          <Calendar className="size-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock className="size-4" />
        <span>
          {filtered.filter((apt) => isToday(apt.date)).length} cita(s) para hoy
          · {filtered.length} total(es)
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Doctor
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Hora
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Motivo
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Tipo
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Estado
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No se encontraron citas
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const doctor = doctors.find((d) => d.uuid === apt.doctorUuid);
                return (
                  <tr
                    key={`${apt.uuid}-${apt.date}-${apt.time}`}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {doctor?.fullName ?? apt.doctorUuid}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doctor?.specialtyName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(apt.date)}
                      {isToday(apt.date) && (
                        <span className="ml-2 text-xs font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full">
                          Hoy
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">
                      {apt.time}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {apt.reason || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        {apt.type === "IN_PERSON" ? (
                          <MapPin className="size-3.5" />
                        ) : (
                          <Video className="size-3.5" />
                        )}
                        <span>{appointmentTypeLabels[apt.type]}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[apt.status]}`}
                      >
                        {appointmentStatusLabels[apt.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onView(apt)}
                          title="Ver detalles"
                          className="rounded-xl hover:bg-slate-100"
                        >
                          <svg
                            className="size-4 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(apt)}
                          title="Editar"
                          className="rounded-xl hover:bg-slate-100"
                        >
                          <svg
                            className="size-4 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(apt.uuid)}
                          title="Eliminar"
                          className="rounded-xl hover:bg-red-50"
                        >
                          <svg
                            className="size-4 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
