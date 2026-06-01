"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment, DoctorOption } from "../schemas";

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  doctors: DoctorOption[];
  onSubmit: (data: Appointment) => void;
  onCancel: () => void;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const inputClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-luca-muted-dark placeholder:text-luca-muted/50 transition-colors outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-luca-muted-dark transition-colors outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20 cursor-pointer";

const searchInputClassName =
  "h-8 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-luca-muted-dark placeholder:text-luca-muted/50 transition-colors outline-none focus:border-luca-primary focus:ring-2 focus:ring-luca-primary/20";

export function AppointmentForm({ initialData, doctors, onSubmit, onCancel }: AppointmentFormProps) {
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialData?.patientId ?? "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : ""
  );
  const [time, setTime] = useState(initialData?.time ?? "");
  const [reason, setReason] = useState(initialData?.reason ?? "");
  const [type, setType] = useState(initialData?.type ?? "PRESENCIAL");
  const [status, setStatus] = useState(initialData?.status ?? "PENDIENTE");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedDoctorId) newErrors.patientId = "El doctor es requerido";
    if (!date) newErrors.date = "La fecha es requerida";
    if (!time) newErrors.time = "La hora es requerida";
    if (!reason.trim()) newErrors.reason = "El motivo es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      patientId: selectedDoctorId,
      date: new Date(date),
      time,
      reason: reason.trim(),
      type: type as Appointment["type"],
      status: status as Appointment["status"],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Doctor & Reason ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Doctor y Motivo
        </h2>
        <div className="flex flex-col gap-4">

          {/* Doctor selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-luca-muted-dark">Doctor</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-luca-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar doctor por nombre o especialidad..."
                    value={doctorSearch}
                    onChange={(e) => {
                      setDoctorSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className={searchInputClassName + " pl-8"}
                  />
                </div>
              </div>

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-slate-100 shadow-lg max-h-44 overflow-y-auto">
                  {filteredDoctors.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-luca-muted">No se encontraron doctores</p>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDoctorId(doc.id);
                          setDoctorSearch("");
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-luca-surface-light transition-colors ${
                          selectedDoctorId === doc.id ? "bg-luca-primary/5" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-luca-muted-dark">{doc.name}</p>
                        <p className="text-xs text-luca-muted">{doc.specialty}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedDoctorId && !showDropdown && (
                <div className="mt-1.5 flex items-center gap-2 p-2 bg-luca-surface-light rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-luca-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-luca-primary">
                      {selectedDoctor?.name.charAt(0) ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-luca-muted-dark truncate">{selectedDoctor?.name}</p>
                    <p className="text-xs text-luca-muted">{selectedDoctor?.specialty}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorId("")}
                    className="text-luca-muted hover:text-luca-accent text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {errors.patientId && (
              <p className="text-xs text-luca-accent">{errors.patientId}</p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-sm font-medium text-luca-muted-dark">
              Motivo de la consulta
            </label>
            <textarea
              id="reason"
              rows={3}
              placeholder="Ej. Control de presión arterial, seguimiento de tratamiento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputClassName + " resize-none pt-2"}
            />
            {errors.reason && (
              <p className="text-xs text-luca-accent">{errors.reason}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Date, Time & Type ───────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Fecha, Hora y Modalidad
        </h2>
        <div className="grid grid-cols-2 gap-5">

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium text-luca-muted-dark">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClassName}
            />
            {errors.date && (
              <p className="text-xs text-luca-accent">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="time" className="text-sm font-medium text-luca-muted-dark">
              Hora
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={selectClassName}
            >
              <option value="">Seleccionar hora...</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {errors.time && (
              <p className="text-xs text-luca-accent">{errors.time}</p>
            )}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-medium text-luca-muted-dark">
              Modalidad
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClassName}
            >
              <option value="PRESENCIAL">Presencial</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-luca-muted-dark">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClassName}
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EN_SALA">En Sala</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="rounded-xl bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover"
        >
          Guardar Cita
        </Button>
      </div>
    </form>
  );
}