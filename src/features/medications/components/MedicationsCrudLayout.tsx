"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MedicationTable } from "./MedicationTable";
import { MedicationForm } from "./MedicationForm";
import type { Medication } from "../schemas";
import { presentationLabels, administrationRouteLabels } from "../schemas";

interface MedicationsCrudLayoutProps {
  medications: Medication[];
}

// 5 medicamentos comunes para visualización
const MOCK_MEDICATIONS: Medication[] = [
  {
    commercialName: "Amoxil",
    activePrinciple: "Amoxicilina",
    concentration: "500mg",
    presentation: "CAPSULA",
    administrationRoute: "ORAL",
  },
  {
    commercialName: "Ibuprofeno MK",
    activePrinciple: "Ibuprofeno",
    concentration: "400mg",
    presentation: "TABLETA",
    administrationRoute: "ORAL",
  },
  {
    commercialName: "Paracetamol Labs",
    activePrinciple: "Paracetamol",
    concentration: "500mg/ml",
    presentation: "JARABE",
    administrationRoute: "ORAL",
  },
  {
    commercialName: "Koldex Colirio",
    activePrinciple: "Cloranfenicol",
    concentration: "0.5%",
    presentation: "GOTAS",
    administrationRoute: "OFTALMICA",
  },
  {
    commercialName: "Diprogenta",
    activePrinciple: "Betametasona",
    concentration: "0.05%",
    presentation: "CREMA",
    administrationRoute: "TOPICA",
  },
];

type Mode = "view" | "create" | "edit";

export function MedicationsCrudLayout({ medications = MOCK_MEDICATIONS }: MedicationsCrudLayoutProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedMedication(null);
    setMode("create");
  };

  const handleEdit = (medication: Medication) => {
    setSelectedMedication(medication);
    setMode("edit");
  };

  const handleView = (medication: Medication) => {
    setSelectedMedication(medication);
    setMode("view");
  };

  const handleDelete = (activePrinciple: string) => {
    setDeleteConfirm(activePrinciple);
  };

  const handleSubmit = (data: Medication) => {
    console.log("[MedicationsCrudLayout] Submitted:", data);
    setMode(null);
    setSelectedMedication(null);
  };

  const handleClose = () => {
    setMode(null);
    setSelectedMedication(null);
  };

  return (
    <>
      <MedicationTable
        medications={medications}
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
              {mode === "create" ? "Nuevo Medicamento" : "Editar Medicamento"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Completá los datos del nuevo medicamento"
                : `Editando ${selectedMedication?.commercialName ?? selectedMedication?.activePrinciple}`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MedicationForm
              initialData={selectedMedication ?? undefined}
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
            <SheetTitle className="text-luca-muted-dark font-heading">Detalle del Medicamento</SheetTitle>
          </SheetHeader>
          {selectedMedication && (
            <div className="mt-6 space-y-4">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Identificación
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Principio Activo</dt>
                    <dd className="font-semibold text-luca-muted-dark">{selectedMedication.activePrinciple}</dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Nombre Comercial</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {selectedMedication.commercialName ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Concentración</dt>
                    <dd className="font-medium text-luca-muted-dark">{selectedMedication.concentration}</dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
                  Presentación
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Forma</dt>
                    <dd className="mt-1">
                      <Badge
                        variant="outline"
                        className="rounded-full bg-teal-50 border-teal-100 text-teal-700 font-medium"
                      >
                        {presentationLabels[selectedMedication.presentation]}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luca-muted text-xs mb-0.5">Vía</dt>
                    <dd className="font-medium text-luca-muted-dark">
                      {administrationRouteLabels[selectedMedication.administrationRoute]}
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
            <DialogTitle className="text-luca-muted-dark font-heading">¿Eliminar medicamento?</DialogTitle>
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
                console.log("[MedicationsCrudLayout] Deleted:", deleteConfirm);
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