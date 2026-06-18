"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tag,
  Pill,
  FlaskConical,
  Box,
  Route,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { medicationSchema, type Medication } from "../schemas";

interface MedicationFormProps {
  initialData?: Partial<Medication>;
  onSubmit: (data: Medication) => void;
  onCancel: () => void;
}

const PRESENTATION_OPTIONS = [
  { value: "CAPSULA", label: "Cápsula" },
  { value: "TABLETA", label: "Tableta" },
  { value: "JARABE", label: "Jarabe" },
  { value: "GOTAS", label: "Gotas" },
  { value: "AMPOLLA", label: "Ampolla" },
  { value: "CREMA", label: "Crema" },
];

const ROUTE_OPTIONS = [
  { value: "ORAL", label: "Oral" },
  { value: "INTRAVENOSA", label: "Intravenosa" },
  { value: "INTRAMUSCULAR", label: "Intramuscular" },
  { value: "TOPICA", label: "Tópica" },
  { value: "OFTALMICA", label: "Oftálmica" },
];

const inputClassName =
  "h-11 pl-10 w-full rounded-xl border border-slate-200 bg-white pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-11 pl-10 pr-10 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20";

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]";

export function MedicationForm({
  initialData,
  onSubmit,
  onCancel,
}: MedicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Medication>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      commercialName: initialData?.commercialName ?? "",
      activePrinciple: initialData?.activePrinciple ?? "",
      concentration: initialData?.concentration ?? "",
      presentation: initialData?.presentation ?? "TABLETA",
      administrationRoute: initialData?.administrationRoute ?? "ORAL",
      requiresPrescription: initialData?.requiresPrescription ?? true,
      contraindications: initialData?.contraindications ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      {/* ── Datos del Medicamento ─────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
          DATOS DEL MEDICAMENTO
        </h2>

        {/* Fila 1: Nombre Comercial + Principio Activo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="commercialName"
              className="text-sm font-semibold text-slate-800"
            >
              Nombre Comercial
            </label>
            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="commercialName"
                type="text"
                placeholder="Ej: Amoxil"
                className={inputClassName}
                {...register("commercialName")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="activePrinciple"
              className="text-sm font-semibold text-slate-800"
            >
              Principio Activo <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Pill className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="activePrinciple"
                type="text"
                placeholder="Ej: Amoxicilina"
                className={inputClassName}
                aria-invalid={!!errors.activePrinciple}
                {...register("activePrinciple")}
              />
            </div>
            {errors.activePrinciple && (
              <p className="text-xs text-red-500 mt-1">
                {errors.activePrinciple.message}
              </p>
            )}
          </div>
        </div>

        {/* Fila 2: Concentración + Presentación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="concentration"
              className="text-sm font-semibold text-slate-800"
            >
              Concentración <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <FlaskConical className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="concentration"
                type="text"
                placeholder="Ej: 500mg"
                className={inputClassName}
                aria-invalid={!!errors.concentration}
                {...register("concentration")}
              />
            </div>
            {errors.concentration && (
              <p className="text-xs text-red-500 mt-1">
                {errors.concentration.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="presentation"
              className="text-sm font-semibold text-slate-800"
            >
              Presentación <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Box className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <select
                id="presentation"
                className={selectClassName}
                aria-invalid={!!errors.presentation}
                {...register("presentation")}
              >
                {PRESENTATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.presentation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.presentation.message}
              </p>
            )}
          </div>
        </div>

        {/* Fila 3: Vía de Administración + Requiere Receta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="administrationRoute"
              className="text-sm font-semibold text-slate-800"
            >
              Vía de Administración <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Route className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <select
                id="administrationRoute"
                className={selectClassName}
                aria-invalid={!!errors.administrationRoute}
                {...register("administrationRoute")}
              >
                {ROUTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.administrationRoute && (
              <p className="text-xs text-red-500 mt-1">
                {errors.administrationRoute.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 md:pb-3 select-none">
            <input
              id="requiresPrescription"
              type="checkbox"
              className="size-5 rounded border-slate-300 text-pharmako-care focus:ring-pharmako-care/20 cursor-pointer transition-all"
              {...register("requiresPrescription")}
            />
            <label
              htmlFor="requiresPrescription"
              className="text-sm font-semibold text-slate-800 cursor-pointer"
            >
              Requiere Receta Médica
            </label>
          </div>
        </div>

        {/* Fila 4: Contraindicaciones */}
        <div className="flex flex-col gap-2 pt-2">
          <label
            htmlFor="contraindications"
            className="text-sm font-semibold text-slate-800"
          >
            Contraindicaciones
          </label>
          <div className="relative group">
            <AlertTriangle className="absolute left-3.5 top-4 size-4 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
            <textarea
              id="contraindications"
              placeholder="Ej: No administrar en pacientes alérgicos a la penicilina..."
              className={textareaClassName}
              {...register("contraindications")}
            />
          </div>
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl h-11 px-6 font-semibold transition-all duration-250 hover:bg-slate-50 active:scale-[0.98]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="rounded-xl bg-pharmako-primary text-white hover:bg-pharmako-primary-hover h-11 px-8 font-semibold transition-all duration-250 active:scale-[0.98]"
        >
          Guardar Medicamento
        </Button>
      </div>
    </form>
  );
}
