"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AppointmentTable } from "./AppointmentTable";
import { AppointmentForm } from "./AppointmentForm";
import type { Appointment, DoctorOption } from "../schemas";
import { appointmentStatusLabels, appointmentTypeLabels } from "../schemas";

interface AppointmentCrudLayoutProps {
  appointments: Appointment[];
  doctors: DoctorOption[];
}

type Mode = "view" | "create" | "edit";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${suffix}`;
}

export function AppointmentCrudLayout({ appointments, doctors }: AppointmentCrudLayoutProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedAppointment(null);
    setMode("create");
  };

  const handleEdit = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setMode("edit");
  };

  const handleView = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setMode("view");
  };

  const handleDelete = (doctorId: string) => {
    setDeleteConfirm(doctorId);
  };

  const handleSubmit = (data: Appointment) => {
    console.log("[AppointmentCrudLayout] Submitted:", data);
    setMode(null);
    setSelectedAppointment(null);
  };

  const handleClose = () => {
    setMode(null);
    setSelectedAppointment(null);
  };

  return (
    <>
      <AppointmentTable
        appointments={appointments}
        doctors={doctors}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Create/Edit Sheet */}
      <Sheet
        open={mode === "create" || mode === "edit"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-luca-surface-light rounded-l-2xl">
          <SheetHeader className="pb-5 border-b border-slate-100">
            <SheetTitle className="text-luca-muted-dark font-heading">
              {mode === "create" ? "Nueva Cita" : "Editar Cita"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Completá los datos para agendar la cita"
                : `Editando cita con ${doctors.find((d) => d.id === selectedAppointment?.patientId)?.name ?? ""}`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <AppointmentForm
              initialData={selectedAppointment ?? undefined}
              doctors={doctors}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* View Sheet */}
      <Sheet
        open={mode === "view"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-luca-surface-light rounded-l-2xl">
          <SheetHeader className="pb-5 border-b border-slate-100">
            <SheetTitle className="text-luca-muted-dark font-heading">Detalle de la Cita</SheetTitle>
          </SheetHeader>
          {selectedAppointment && (
            <div className="mt-6 space-y-4">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Doctor
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-luca-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-luca-primary">
                      {doctors.find((d) => d.id === selectedAppointment.patientId)?.name.charAt(0) ?? "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-luca-muted-dark">
                      {doctors.find((d) => d.id === selectedAppointment.patientId)?.name}
                    </p>
                    <p className="text-xs text-luca-muted">
                      {doctors.find((d) => d.id === selectedAppointment.patientId)?.specialty}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Fecha y Hora
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-luca-surface-light flex items-center justify-center">
                      <svg className="size-4 text-luca-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <dt className="text-xs text-luca-muted">Fecha</dt>
                      <dd className="font-medium text-luca-muted-dark capitalize">
                        {formatDate(new Date(selectedAppointment.date))}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-luca-surface-light flex items-center justify-center">
                      <svg className="size-4 text-luca-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <dt className="text-xs text-luca-muted">Hora</dt>
                      <dd className="font-medium text-luca-muted-dark">
                        {formatTime(selectedAppointment.time)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Consulta
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-luca-muted mb-0.5">Motivo</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedAppointment.reason}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-luca-muted mb-0.5">Modalidad</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {appointmentTypeLabels[selectedAppointment.type]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-luca-muted mb-0.5">Estado</dt>
                    <dd>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-luca-surface-dark text-luca-muted-dark`}>
                        {appointmentStatusLabels[selectedAppointment.status]}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <div className="flex justify-end pt-3">
                <Button variant="outline" onClick={handleClose} className="rounded-xl">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="rounded-2xl bg-white shadow-lg border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-luca-muted-dark font-heading">¿Eliminar cita?</DialogTitle>
            <DialogDescription className="text-luca-muted">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                console.log("[AppointmentCrudLayout] Deleted:", deleteConfirm);
                setDeleteConfirm(null);
              }}
              className="rounded-xl"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}