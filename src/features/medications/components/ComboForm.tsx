"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Pill, Clock, MessageSquare, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prescriptionTemplateSchema, type PrescriptionTemplate, type Medication } from "../schemas";

interface ComboFormProps {
  medications: Medication[];
  initialData?: Partial<PrescriptionTemplate>;
  onSubmit: (data: PrescriptionTemplate) => void;
  onCancel: () => void;
}

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20";

export function ComboForm({
  medications,
  initialData,
  onSubmit,
  onCancel,
}: ComboFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionTemplate>({
    resolver: zodResolver(prescriptionTemplateSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      items: initialData?.items ?? [
        { medicationId: "", dose: "", frequency: "", duration: "", notes: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* Title / Name of the Combo */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold text-slate-800">
          Nombre del Combo / Plantilla <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Ej: Esquema Antigripal Adulto, Control Hipertensión"
          className={inputClassName}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Items Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-pharmako-care" />
            Medicamentos del Combo
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ medicationId: "", dose: "", frequency: "", duration: "", notes: "" })
            }
            className="h-9 px-3 rounded-lg border-dashed text-pharmako-care border-pharmako-care hover:bg-pharmako-care-light/10 text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Medicamento
          </Button>
        </div>

        {errors.items?.message && (
          <p className="text-xs text-red-500">{errors.items.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const itemErrors = errors.items?.[index];

            return (
              <div
                key={field.id}
                className="bg-slate-50/70 border border-slate-150 rounded-xl p-4.5 flex flex-col gap-4 relative group hover:border-slate-300 transition-colors"
              >
                {/* Remove button inside card */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                    className="absolute right-3 top-3 h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 transition-colors"
                    title="Remover medicamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                {/* Medication Selection */}
                <div className="flex flex-col gap-1.5 pr-8">
                  <label className="text-xs font-semibold text-slate-700">
                    Medicamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={selectClassName}
                    {...register(`items.${index}.medicationId` as const)}
                  >
                    <option value="">Seleccione un medicamento...</option>
                    {medications.map((med) => (
                      <option key={med.uuid} value={med.uuid}>
                        {med.activePrinciple} {med.concentration} {med.commercialName ? `(${med.commercialName})` : ""}
                      </option>
                    ))}
                  </select>
                  {itemErrors?.medicationId && (
                    <p className="text-[11px] text-red-500">{itemErrors.medicationId.message}</p>
                  )}
                </div>

                {/* Dose, Frequency, Duration grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Dosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 500mg, 1 tableta"
                      className={inputClassName}
                      {...register(`items.${index}.dose` as const)}
                    />
                    {itemErrors?.dose && (
                      <p className="text-[11px] text-red-500">{itemErrors.dose.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Frecuencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: cada 8 horas, diario"
                      className={inputClassName}
                      {...register(`items.${index}.frequency` as const)}
                    />
                    {itemErrors?.frequency && (
                      <p className="text-[11px] text-red-500">{itemErrors.frequency.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Duración <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 7 días, por 1 mes"
                      className={inputClassName}
                      {...register(`items.${index}.duration` as const)}
                    />
                    {itemErrors?.duration && (
                      <p className="text-[11px] text-red-500">{itemErrors.duration.message}</p>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Indicaciones Adicionales
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: tomar después de las comidas"
                    className={inputClassName}
                    {...register(`items.${index}.notes` as const)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
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
          Guardar Combo
        </Button>
      </div>
    </form>
  );
}
