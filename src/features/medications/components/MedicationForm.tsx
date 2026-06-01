"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { medicationSchema, type Medication, presentationLabels, administrationRouteLabels } from "../schemas";

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
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-luca-muted-dark placeholder:text-luca-muted/50 transition-colors outline-none focus-visible:border-luca-primary focus-visible:ring-2 focus-visible:ring-luca-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-luca-muted-dark transition-colors outline-none focus-visible:border-luca-primary focus-visible:ring-2 focus-visible:ring-luca-primary/20";

export function MedicationForm({ initialData, onSubmit, onCancel }: MedicationFormProps) {
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
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* ── Datos del Medicamento ─────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Datos del Medicamento
        </h2>

        {/* Fila 1: Nombre Comercial + Principio Activo */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="commercialName" className="text-sm font-medium text-luca-muted-dark">
              Nombre Comercial
            </label>
            <input
              id="commercialName"
              type="text"
              placeholder="Ej: Amoxil"
              className={inputClassName}
              {...register("commercialName")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="activePrinciple" className="text-sm font-medium text-luca-muted-dark">
              Principio Activo <span className="text-luca-accent">*</span>
            </label>
            <input
              id="activePrinciple"
              type="text"
              placeholder="Ej: Amoxicilina"
              className={inputClassName}
              aria-invalid={!!errors.activePrinciple}
              {...register("activePrinciple")}
            />
            {errors.activePrinciple && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.activePrinciple.message}</p>
            )}
          </div>
        </div>

        {/* Fila 2: Concentración + Presentación + Vía */}
        <div className="grid grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="concentration" className="text-sm font-medium text-luca-muted-dark">
              Concentración <span className="text-luca-accent">*</span>
            </label>
            <input
              id="concentration"
              type="text"
              placeholder="Ej: 500mg"
              className={inputClassName}
              aria-invalid={!!errors.concentration}
              {...register("concentration")}
            />
            {errors.concentration && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.concentration.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="presentation" className="text-sm font-medium text-luca-muted-dark">
              Presentación <span className="text-luca-accent">*</span>
            </label>
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
            {errors.presentation && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.presentation.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="administrationRoute" className="text-sm font-medium text-luca-muted-dark">
              Vía de Administración <span className="text-luca-accent">*</span>
            </label>
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
            {errors.administrationRoute && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.administrationRoute.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" className="rounded-xl bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover">
          Guardar Medicamento
        </Button>
      </div>
    </form>
  );
}