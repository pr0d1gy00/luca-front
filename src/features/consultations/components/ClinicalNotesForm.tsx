"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  consultationSchema,
  type Consultation,
  type PrescriptionItem,
} from "../schemas";
import { presentationLabels } from "../schemas";
import { Separator } from "@/components/ui/separator";

interface ClinicalNotesFormProps {
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => void;
}

// Mock medications catalog
const MOCK_MEDICATIONS = [
  {
    id: "1",
    activePrinciple: "Amoxicilina",
    concentration: "500mg",
    presentation: "CAPSULA" as const,
  },
  {
    id: "2",
    activePrinciple: "Ibuprofeno",
    concentration: "400mg",
    presentation: "TABLETA" as const,
  },
  {
    id: "3",
    activePrinciple: "Paracetamol",
    concentration: "500mg/ml",
    presentation: "JARABE" as const,
  },
  {
    id: "4",
    activePrinciple: "Cloranfenicol",
    concentration: "0.5%",
    presentation: "GOTAS" as const,
  },
  {
    id: "5",
    activePrinciple: "Betametasona",
    concentration: "0.05%",
    presentation: "CREMA" as const,
  },
  {
    id: "6",
    activePrinciple: "Omeprazol",
    concentration: "20mg",
    presentation: "CAPSULA" as const,
  },
  {
    id: "7",
    activePrinciple: "Metformina",
    concentration: "850mg",
    presentation: "TABLETA" as const,
  },
  {
    id: "8",
    activePrinciple: "Losartán",
    concentration: "50mg",
    presentation: "TABLETA" as const,
  },
];

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-500/50 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20 disabled:cursor-not-allowed disabled:opacity-50";

const textAreaClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-500/50 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20 resize-none min-h-[100px]";

const selectClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20 cursor-pointer";

export function ClinicalNotesForm({
  onSubmit,
  onGeneratePrescription,
}: ClinicalNotesFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Consultation>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      motivoConsulta: "",
      examenFisico: "",
      diagnostico: "",
      prescriptions: [
        { medicationId: "", dose: "", frequency: "", duration: "" },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  const handleFormSubmit = (data: Consultation) => {
    onGeneratePrescription(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-8"
    >
      {/* ── Notas Clínicas ───────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="motivoConsulta"
            className="text-sm font-medium text-slate-700"
          >
            Motivo de Consulta
          </label>
          <textarea
            id="motivoConsulta"
            placeholder="Ej: Dolor abdominal hace 3 días, náuseas..."
            className={textAreaClassName}
            {...register("motivoConsulta")}
          />
          {errors.motivoConsulta && (
            <p className="text-xs text-blue-700 mt-1">
              {errors.motivoConsulta.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="examenFisico"
            className="text-sm font-medium text-slate-700"
          >
            Examen Físico
          </label>
          <textarea
            id="examenFisico"
            placeholder="Ej: Abdomen blando, dolor en cuadrante inferior derecho..."
            className={textAreaClassName}
            {...register("examenFisico")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="diagnostico"
            className="text-sm font-medium text-slate-700"
          >
            Diagnóstico
          </label>
          <textarea
            id="diagnostico"
            placeholder="Ej: Apendicitis aguda,Hipertensión arterial..."
            className={`${textAreaClassName} min-h-[80px]`}
            {...register("diagnostico")}
          />
          {errors.diagnostico && (
            <p className="text-xs text-blue-700 mt-1">
              {errors.diagnostico.message}
            </p>
          )}
        </div>
      </section>

      {/* ── Tratamiento y Récipe ─────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Separator className="flex-1 bg-slate-100" />
          <h3 className="text-sm font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
            <Pill className="size-4 text-pharmako-care" />
            Tratamiento y Récipe
          </h3>
          <Separator className="flex-1 bg-slate-100" />
        </div>

        {/* Medication Rows */}
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-slate-50 rounded-3xl p-5 border border-slate-200/50 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Medicamento {index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    className="rounded-xl hover:bg-blue-700/10"
                  >
                    <X className="size-4 text-blue-700" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Medication Selector */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Medicamento
                  </label>
                  <select
                    className={selectClassName}
                    {...register(`prescriptions.${index}.medicationId`)}
                  >
                    <option value="">Seleccionar...</option>
                    {MOCK_MEDICATIONS.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.activePrinciple} {med.concentration} (
                        {presentationLabels[med.presentation]})
                      </option>
                    ))}
                  </select>
                  {errors.prescriptions?.[index]?.medicationId && (
                    <p className="text-xs text-blue-700 mt-0.5">
                      {errors.prescriptions[index]?.medicationId?.message}
                    </p>
                  )}
                </div>

                {/* Dose */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Dosis
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1 cápsula"
                    className={inputClassName}
                    {...register(`prescriptions.${index}.dose`)}
                  />
                  {errors.prescriptions?.[index]?.dose && (
                    <p className="text-xs text-blue-700 mt-0.5">
                      {errors.prescriptions[index]?.dose?.message}
                    </p>
                  )}
                </div>

                {/* Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Frecuencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: cada 8 horas"
                    className={inputClassName}
                    {...register(`prescriptions.${index}.frequency`)}
                  />
                  {errors.prescriptions?.[index]?.frequency && (
                    <p className="text-xs text-blue-700 mt-0.5">
                      {errors.prescriptions[index]?.frequency?.message}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Duración
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: por 7 días"
                    className={inputClassName}
                    {...register(`prescriptions.${index}.duration`)}
                  />
                  {errors.prescriptions?.[index]?.duration && (
                    <p className="text-xs text-blue-700 mt-0.5">
                      {errors.prescriptions[index]?.duration?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Medication Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ medicationId: "", dose: "", frequency: "", duration: "" })
          }
          className="self-start rounded-2xl border-dashed border-slate-300 text-slate-500 hover:border-blue-700 hover:text-pharmako-care"
        >
          <Plus className="size-4" />
          Agregar Medicamento
        </Button>

        {errors.prescriptions &&
          typeof errors.prescriptions.message === "string" && (
            <p className="text-xs text-blue-700">
              {errors.prescriptions.message}
            </p>
          )}
      </section>

      {/* ── Action Bar ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={!isValid}
          className="rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar Consulta y Emitir Récipe
        </Button>
      </div>
    </form>
  );
}
