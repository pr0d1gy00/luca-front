"use client";

import { useState } from "react";
import { Search, UserPlus, Calendar, Clock, MapPin, Video, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Appointment, DoctorOption } from "../schemas";
import { appointmentStatusLabels, appointmentTypeLabels } from "../schemas";

interface AppointmentTableProps {
  appointments: Appointment[];
  doctors: DoctorOption[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onView: (appointment: Appointment) => void;
  onCreate: () => void;
}

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-luca-surface-dark text-luca-muted-dark",
  CONFIRMADA: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  EN_SALA: "bg-amber-50 text-amber-700 border border-amber-200",
  COMPLETADA: "bg-luca-primary/10 text-luca-primary border border-luca-primary/20",
  CANCELADA: "bg-red-50 text-red-600 border border-red-200",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function isToday(date: Date): boolean {
  const today = new Date();
  const d = new Date(date);
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
    const doctor = doctors.find((d) => d.id === apt.patientId);
    const term = search.toLowerCase();
    return (
      apt.reason.toLowerCase().includes(term) ||
      apt.time.includes(term) ||
      (doctor?.name.toLowerCase().includes(term) ?? false) ||
      apt.patientId.includes(term)
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
            placeholder="Buscar por doctor, motivo u hora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-luca-muted-dark placeholder:text-luca-muted/50 focus:outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20"
          />
        </div>
        <Button
          onClick={onCreate}
          size="sm"
          className="gap-1.5 rounded-xl bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover"
        >
          <Calendar className="size-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Today's appointments highlight */}
      <div className="flex items-center gap-2 text-sm text-luca-muted">
        <Clock className="size-4" />
        <span>
          {filtered.filter((apt) => isToday(new Date(apt.date))).length} cita(s) para hoy ·{" "}
          {filtered.length} total(es)
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Doctor
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Hora
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Motivo
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Tipo
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-luca-muted">
                Estado
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-luca-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-luca-muted">
                  No se encontraron citas
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const doctor = doctors.find((d) => d.id === apt.patientId);
                return (
                  <tr
                    key={`${apt.patientId}-${apt.date}-${apt.time}`}
                    className="border-b border-slate-100 last:border-0 hover:bg-luca-surface-light transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-luca-muted-dark">{doctor?.name ?? apt.patientId}</p>
                        <p className="text-xs text-luca-muted mt-0.5">{doctor?.specialty}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-luca-muted">
                      {formatDate(new Date(apt.date))}
                      {isToday(new Date(apt.date)) && (
                        <span className="ml-2 text-xs font-medium text-luca-primary bg-luca-primary/10 px-1.5 py-0.5 rounded-full">
                          Hoy
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-luca-muted-dark font-medium">{apt.time}</td>
                    <td className="px-5 py-4 text-sm text-luca-muted">{apt.reason}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-luca-muted">
                        {apt.type === "PRESENCIAL" ? (
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
                          className="rounded-xl hover:bg-luca-surface-dark"
                        >
                          <svg className="size-4 text-luca-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(apt)}
                          title="Editar"
                          className="rounded-xl hover:bg-luca-surface-dark"
                        >
                          <svg className="size-4 text-luca-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(apt.patientId)}
                          title="Eliminar"
                          className="rounded-xl hover:bg-luca-surface-dark"
                        >
                          <svg className="size-4 text-luca-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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