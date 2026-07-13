"use client";

import { useState } from "react";
import {
  Plus,
  Tag,
  Pill,
  FlaskConical,
  Box,
  Route,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Activity,
  Download,
  ListChecks,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MedicationTable } from "./MedicationTable";
import { MedicationForm } from "./MedicationForm";
import { ComboForm } from "./ComboForm";
import type { Medication, PrescriptionTemplate } from "../schemas";
import { presentationLabels, administrationRouteLabels } from "../schemas";
import {
  useMedications,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
  useTopPrescribedMedications,
} from "../hooks/useMedications";
import {
  usePrescriptionTemplates,
  useCreatePrescriptionTemplate,
  useUpdatePrescriptionTemplate,
  useDeletePrescriptionTemplate,
} from "../hooks/usePrescriptionTemplates";

const TOP_PRESCRIBED = [
  { name: "Paracetamol Labs", count: 124, percentage: 85 },
  { name: "Ibuprofeno MK", count: 98, percentage: 65 },
  { name: "Amoxil", count: 85, percentage: 55 },
];

type Mode = "view" | "create" | "edit" | "create_combo" | "edit_combo";

export function MedicationsCrudLayout() {
  const [activeTab, setActiveTab] = useState<"resumen" | "lista" | "combos">("resumen");
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<PrescriptionTemplate | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"medication" | "combo">("medication");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // React Query Hooks
  const { data: medsData, isLoading: isLoadingMeds } = useMedications(search, page);
  const { data: topPrescribedData, isLoading: isLoadingTop } = useTopPrescribedMedications();
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const deleteMedication = useDeleteMedication();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const { data: combosData, isLoading: isLoadingCombos } = usePrescriptionTemplates();
  const createCombo = useCreatePrescriptionTemplate();
  const updateCombo = useUpdatePrescriptionTemplate();
  const deleteCombo = useDeletePrescriptionTemplate();

  const medsList = medsData?.data || [];
  const combosList = combosData?.data || [];

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

  const handleDelete = (uuid: string) => {
    setDeleteType("medication");
    setDeleteConfirm(uuid);
  };

  const handleCreateCombo = () => {
    setSelectedCombo(null);
    setMode("create_combo");
  };

  const handleEditCombo = (combo: PrescriptionTemplate) => {
    setSelectedCombo(combo);
    setMode("edit_combo");
  };

  const handleDeleteCombo = (uuid: string) => {
    setDeleteType("combo");
    setDeleteConfirm(uuid);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      if (deleteType === "combo") {
        deleteCombo.mutate(deleteConfirm);
      } else {
        deleteMedication.mutate(deleteConfirm);
      }
      setDeleteConfirm(null);
    }
  };

  const handleSubmitMedication = (data: Medication) => {
    if (mode === "create") {
      createMedication.mutate(data);
    } else if (mode === "edit" && selectedMedication?.uuid) {
      updateMedication.mutate({ uuid: selectedMedication.uuid, data });
    }
    setMode(null);
    setSelectedMedication(null);
  };

  const handleSubmitCombo = (data: PrescriptionTemplate) => {
    if (mode === "create_combo") {
      createCombo.mutate(data);
    } else if (mode === "edit_combo" && selectedCombo?.uuid) {
      updateCombo.mutate({ uuid: selectedCombo.uuid, data });
    }
    setMode(null);
    setSelectedCombo(null);
  };

  const handleClose = () => {
    setMode(null);
    setSelectedMedication(null);
    setSelectedCombo(null);
  };

  if (isLoadingMeds || isLoadingCombos || isLoadingTop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Clock className="w-8 h-8 animate-spin text-pharmako-care" />
        <span className="text-sm font-semibold text-slate-500">Cargando medicamentos y combos...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Catálogo de Medicamentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestioná el catálogo global y tus medicamentos personalizados.
          </p>
        </div>
        {activeTab === "combos" ? (
          <Button
            onClick={handleCreateCombo}
            className="gap-2 rounded-xl bg-pharmako-primary text-white hover:bg-pharmako-primary-hover h-11 px-6 font-semibold transition-all duration-200 active:scale-[0.98] self-start sm:self-auto shrink-0"
          >
            <Plus className="size-5" />
            Nuevo Combo
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            className="gap-2 rounded-xl bg-pharmako-primary text-white hover:bg-pharmako-primary-hover h-11 px-6 font-semibold transition-all duration-200 active:scale-[0.98] self-start sm:self-auto shrink-0"
          >
            <Plus className="size-5" />
            Nuevo Medicamento
          </Button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("resumen")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "resumen"
              ? "bg-slate-50 text-pharmako-care"
              : "text-slate-400 hover:text-slate-650",
          )}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab("lista")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "lista"
              ? "bg-slate-50 text-pharmako-care"
              : "text-slate-400 hover:text-slate-650",
          )}
        >
          Lista
        </button>
        <button
          onClick={() => setActiveTab("combos")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "combos"
              ? "bg-slate-50 text-pharmako-care"
              : "text-slate-400 hover:text-slate-650",
          )}
        >
          Combos de Prescripción
        </button>
      </div>

      {/* Conditional View Rendering */}
      {activeTab === "resumen" ? (
        <div className="flex flex-col gap-6">
          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleCreate}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Registrar Fármaco
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Agregar al catálogo
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab("combos")}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Gestionar Combos
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Plantillas de récipes
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
            </button>

            <button
              onClick={() => {}}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    Exportar Catálogo
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Descargar listado PDF/XLS
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Medicamentos */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Total Fármacos
                </span>
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
                  <Pill className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {medsList.length}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Activos en tu catálogo
                </span>
              </div>
            </div>

            {/* Card 2: Regulación de Venta */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Regulación de Venta
                </span>
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {medsList.filter((m) => m.requiresPrescription).length}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <span className="size-2 rounded-full bg-amber-400 inline-block" />
                    Bajo Receta
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {medsList.filter((m) => !m.requiresPrescription).length}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <span className="size-2 rounded-full bg-emerald-400 inline-block" />
                    Venta Libre
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Más Recetados */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Más Recetados
                </span>
                <span className="text-[10px] font-medium text-pharmako-care bg-pharmako-care-light px-2 py-0.5 rounded-full">
                  Frecuencia mensual
                </span>
              </div>
              <div className="space-y-2.5">
                {(topPrescribedData || []).map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {item.name}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {item.count} rec.
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-pharmako-care h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Combos de Prescripción */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Combos Guardados
                </span>
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
                  <ListChecks className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {combosList.length}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Plantillas para récipes rápidas
                </span>
              </div>
            </div>

            {/* Card 4: Distribución por Vía */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Distribución por Vía
                </span>
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
                  <Route className="w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-sm font-bold text-slate-800">
                    {medsList.filter((m) => m.administrationRoute === "ORAL").length}
                  </span>
                  <span className="text-[10px] text-slate-400">Oral</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-sm font-bold text-slate-800">
                    {
                      medsList.filter(
                        (m) =>
                          m.administrationRoute === "INTRAVENOSA" ||
                          m.administrationRoute === "INTRAMUSCULAR",
                      ).length
                    }
                  </span>
                  <span className="text-[10px] text-slate-400">Inyect.</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-sm font-bold text-slate-800">
                    {
                      medsList.filter(
                        (m) =>
                          m.administrationRoute === "TOPICA" ||
                          m.administrationRoute === "OFTALMICA",
                      ).length
                    }
                  </span>
                  <span className="text-[10px] text-slate-400">Local</span>
                </div>
              </div>
            </div>

            {/* Card 6: Medicamentos Recientes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Ingresos Recientes
                </span>
                <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {medsList
                  .slice(-2)
                  .reverse()
                  .map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-850 truncate">
                          {med.activePrinciple}
                        </span>
                        <span className="block text-[9px] text-slate-450 truncate mt-0.5">
                          {med.commercialName || "Genérico"} — {med.concentration}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1.5 py-0 bg-white border-slate-200 text-slate-500 rounded-full font-medium"
                      >
                        {med.administrationRoute.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "lista" ? (
        <MedicationTable
          medications={medsList}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          search={search}
          onSearchChange={handleSearchChange}
          page={page}
          onPageChange={setPage}
          lastPage={medsData?.lastPage || 1}
        />
      ) : (
        /* Combos Tab Content */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combosList.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400">
              <ListChecks className="w-8 h-8 mx-auto mb-3 opacity-20 text-slate-500" />
              <span className="block font-semibold">No tenés combos de prescripción guardados.</span>
              <span className="block text-xs text-slate-500 mt-1">¡Creá uno nuevo para agilizar tus récipes de consulta!</span>
            </div>
          ) : (
            combosList.map((combo) => (
              <div
                key={combo.uuid}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[220px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 tracking-tight">{combo.title}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCombo(combo)}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCombo(combo.uuid!)}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-red-650"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {combo.items.map((item, idx) => {
                      const med = medsList.find((m) => m.uuid === item.medicationId);
                      return (
                        <div
                          key={idx}
                          className="text-xs text-slate-650 flex items-start gap-1.5 py-1 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-bold text-pharmako-care shrink-0">•</span>
                          <div>
                            <span className="font-semibold text-slate-800">
                              {med ? `${med.activePrinciple} ${med.concentration}` : "Fármaco desconocido"}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {item.dose} — {item.frequency} — {item.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{combo.items.length} medicamento{combo.items.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Medication Sheet */}
      <Sheet
        open={mode === "create" || mode === "edit"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
          <SheetHeader className="p-0 pb-5 border-b border-slate-100">
            <SheetTitle className="text-slate-900 font-semibold text-lg">
              {mode === "create" ? "Nuevo Medicamento" : "Editar Medicamento"}
            </SheetTitle>
            <SheetDescription className="text-slate-500 text-sm">
              {mode === "create"
                ? "Completá los datos del nuevo medicamento."
                : `Editando ${selectedMedication?.commercialName || selectedMedication?.activePrinciple}`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MedicationForm
              initialData={selectedMedication ?? undefined}
              onSubmit={handleSubmitMedication}
              onCancel={handleClose}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create/Edit Combo Sheet */}
      <Sheet
        open={mode === "create_combo" || mode === "edit_combo"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
          <SheetHeader className="p-0 pb-5 border-b border-slate-100">
            <SheetTitle className="text-slate-900 font-semibold text-lg">
              {mode === "create_combo" ? "Nuevo Combo" : "Editar Combo"}
            </SheetTitle>
            <SheetDescription className="text-slate-500 text-sm">
              {mode === "create_combo"
                ? "Completá los datos de tu plantilla de prescripción."
                : `Editando ${selectedCombo?.title}`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ComboForm
              medications={medsList}
              initialData={selectedCombo ?? undefined}
              onSubmit={handleSubmitCombo}
              onCancel={handleClose}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* View Medication Sheet */}
      <Sheet
        open={mode === "view"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
          <SheetHeader className="p-0 pb-5 border-b border-slate-100">
            <SheetTitle className="text-slate-900 font-semibold text-lg">
              Detalle del Medicamento
            </SheetTitle>
          </SheetHeader>
          {selectedMedication && (
            <div className="mt-6 space-y-6">
              {/* Sección 1: Identificación y Composición */}
              <div className="rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
                  Identificación y Composición
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Principio Activo */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                      <Pill className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Principio Activo
                      </span>
                      <span
                        className="block text-sm font-bold text-slate-900 mt-0.5 truncate"
                        title={selectedMedication.activePrinciple}
                      >
                        {selectedMedication.activePrinciple}
                      </span>
                    </div>
                  </div>

                  {/* Nombre Comercial */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                      <Tag className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nombre Comercial
                      </span>
                      <span
                        className="block text-sm font-semibold text-slate-900 mt-0.5 truncate"
                        title={selectedMedication.commercialName || "—"}
                      >
                        {selectedMedication.commercialName || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Concentración */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                      <FlaskConical className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Concentración
                      </span>
                      <span
                        className="block text-sm font-semibold text-slate-900 mt-0.5 truncate"
                        title={selectedMedication.concentration}
                      >
                        {selectedMedication.concentration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Dosificación y Expendio */}
              <div className="rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
                  Administración y Regulación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Presentación */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                      <Box className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Presentación
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-full bg-teal-50 border-teal-100 text-teal-700 font-semibold px-2.5 py-0.5 mt-1"
                      >
                        {presentationLabels[selectedMedication.presentation]}
                      </Badge>
                    </div>
                  </div>

                  {/* Vía de Administración */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                      <Route className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vía de Admin.
                      </span>
                      <span className="block text-sm font-semibold text-slate-900 mt-1">
                        {administrationRouteLabels[selectedMedication.administrationRoute]}
                      </span>
                    </div>
                  </div>

                  {/* Tipo de Venta */}
                  <div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
                    {selectedMedication.requiresPrescription ? (
                      <>
                        <div className="bg-amber-50 rounded-xl p-2.5 text-amber-600 shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Venta
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-amber-50 border-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 mt-1"
                          >
                            Bajo Receta
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-emerald-50 rounded-xl p-2.5 text-emerald-600 shrink-0">
                          <CheckCircle className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Venta
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-emerald-50 border-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 mt-1"
                          >
                            Venta Libre
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 3: Seguridad y Advertencias */}
              <div className="rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
                  Seguridad y Restricciones
                </h3>
                <div className="bg-white rounded-xl p-5 flex items-start gap-4 transition-all hover:border-slate-350">
                  <div className="bg-red-50 rounded-xl p-3 text-red-500 shrink-0">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contraindicaciones
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed mt-2 bg-red-50/30 border border-red-100/50 rounded-xl p-3">
                      {selectedMedication.contraindications ||
                        "No se registran contraindicaciones para este fármaco."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-xl h-11 px-6 font-semibold transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Cerrar Detalle
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="rounded-2xl bg-white border border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-semibold">
              {deleteType === "combo" ? "¿Eliminar combo?" : "¿Eliminar medicamento?"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              Esta acción no se puede deshacer. Se removerá permanentemente de tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
