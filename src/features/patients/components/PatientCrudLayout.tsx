"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PatientTable } from "./PatientTable";
import { PatientForm } from "./PatientForm";
import type { Patient } from "../schemas";
import { bloodTypeLabels, biologicalSexLabels } from "../schemas";

interface PatientCrudLayoutProps {
  patients: Patient[];
}

type Mode = "view" | "create" | "edit";

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function PatientCrudLayout({ patients }: PatientCrudLayoutProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedPatient(null);
    setMode("create");
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setMode("edit");
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setMode("view");
  };

  const handleDelete = (documentId: string) => {
    setDeleteConfirm(documentId);
  };

  const handleSubmit = (data: Patient) => {
    console.log("[PatientCrudLayout] Submitted:", data);
    setMode(null);
    setSelectedPatient(null);
  };

  const handleClose = () => {
    setMode(null);
    setSelectedPatient(null);
  };

  return (
    <>
      <PatientTable
        patients={patients}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Create/Edit Sheet */}
      <Sheet open={mode === "create" || mode === "edit"} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-luca-surface-light rounded-l-2xl">
          <SheetHeader className="pb-5 border-b border-slate-100">
            <SheetTitle className="text-luca-muted-dark font-heading">
              {mode === "create" ? "Nuevo Paciente" : "Editar Paciente"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Completá los datos del nuevo paciente"
                : `Editando datos de ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PatientForm
              initialData={selectedPatient ?? undefined}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* View Sheet */}
      <Sheet open={mode === "view"} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-luca-surface-light rounded-l-2xl">
          <SheetHeader className="pb-5 border-b border-slate-100">
            <SheetTitle className="text-luca-muted-dark font-heading">Detalle del Paciente</SheetTitle>
          </SheetHeader>
          {selectedPatient && (
            <div className="mt-6 space-y-4">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Identidad
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Nombre</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">DNI</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedPatient.documentId}</dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Fecha Nac.</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {new Date(selectedPatient.birthDate).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Edad</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {calculateAge(new Date(selectedPatient.birthDate))} años
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Sexo</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {biologicalSexLabels[selectedPatient.biologicalSex]}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Contacto
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Teléfono</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedPatient.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Email</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedPatient.email}</dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Dirección</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedPatient.address}</dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Médico Base
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Sangre</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {bloodTypeLabels[selectedPatient.bloodType]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Alergias</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {selectedPatient.allergies?.length ? selectedPatient.allergies.join(", ") : "Ninguna"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-luca-muted text-xs mb-0.5">Crónicos</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {selectedPatient.chronicConditions?.length
                        ? selectedPatient.chronicConditions.join(", ")
                        : "Ninguna"}
                    </dd>
                  </div>
                </dl>
              </section>

              {(selectedPatient.emergencyContactName || selectedPatient.emergencyContactPhone) && (
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                    Emergencia
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-luca-muted text-xs mb-0.5">Contacto</dt>
                      <dd className="font-medium text-luca-muted-dark">
                        {selectedPatient.emergencyContactName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-luca-muted text-xs mb-0.5">Teléfono</dt>
                      <dd className="font-medium text-luca-muted-dark">
                        {selectedPatient.emergencyContactPhone}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}

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
            <DialogTitle className="text-luca-muted-dark font-heading">¿Eliminar paciente?</DialogTitle>
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
                console.log("[PatientCrudLayout] Deleted:", deleteConfirm);
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