"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Pill, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  consultationSchema,
  type Consultation,
  type Patient,
  type Doctor,
  type Medication,
  presentationLabels,
} from "../schemas";
import { Separator } from "@/components/ui/separator";
import { DigitalPrescriptionCard } from "./DigitalPrescriptionCard";

interface ClinicalNotesFormProps {
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => void;
  patient?: {
    firstName: string;
    lastName: string;
    documentId: string;
    birthDate: Date;
    biologicalSex: "MALE" | "FEMALE";
  };
  doctor?: {
    name: string;
    specialty: string;
    mpps: string;
    cm: string;
  };
  medicationsCatalog?: {
    id: string;
    activePrinciple: string;
    concentration: string;
    presentation:
      | "CAPSULA"
      | "TABLETA"
      | "JARABE"
      | "GOTAS"
      | "AMPOLLA"
      | "CREMA";
  }[];
}

// Mock medications catalog
const DEFAULT_MEDICATIONS = [
  {
    id: "1",
    activePrinciple: "Amoxicilina",
    concentration: "500mg",
    presentation: "CAPSULA" as const,
    administrationRoute: "ORAL" as const,
  },
  {
    id: "2",
    activePrinciple: "Ibuprofeno",
    concentration: "400mg",
    presentation: "TABLETA" as const,
    administrationRoute: "ORAL" as const,
  },
  {
    id: "3",
    activePrinciple: "Paracetamol",
    concentration: "500mg/ml",
    presentation: "JARABE" as const,
    administrationRoute: "ORAL" as const,
  },
  {
    id: "4",
    activePrinciple: "Cloranfenicol",
    concentration: "0.5%",
    presentation: "GOTAS" as const,
    administrationRoute: "OFTALMICA" as const,
  },
  {
    id: "5",
    activePrinciple: "Betametasona",
    concentration: "0.05%",
    presentation: "CREMA" as const,
    administrationRoute: "TOPICA" as const,
  },
  {
    id: "6",
    activePrinciple: "Omeprazol",
    concentration: "20mg",
    presentation: "CAPSULA" as const,
    administrationRoute: "ORAL" as const,
  },
  {
    id: "7",
    activePrinciple: "Metformina",
    concentration: "850mg",
    presentation: "TABLETA" as const,
    administrationRoute: "ORAL" as const,
  },
  {
    id: "8",
    activePrinciple: "Losartán",
    concentration: "50mg",
    presentation: "TABLETA" as const,
    administrationRoute: "ORAL" as const,
  },
];

const FREQUENCY_OPTIONS = [
  { value: "4", label: "Cada 4 horas" },
  { value: "6", label: "Cada 6 horas" },
  { value: "8", label: "Cada 8 horas" },
  { value: "12", label: "Cada 12 horas" },
  { value: "24", label: "Cada 24 horas" },
];

const DURATION_UNITS = [
  { value: "días", label: "Días" },
  { value: "semanas", label: "Semanas" },
  { value: "meses", label: "Meses" },
];

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20";
const textAreaClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20 resize-none min-h-[100px]";
const selectClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors outline-none focus:border-blue-700 focus:ring-2 focus:ring-pharmako-care/20 cursor-pointer";

// ---------------------------------------------------------------------------
// Structured dose form fields (not in schema, just UI helpers)
// ---------------------------------------------------------------------------
interface MedFormState {
  quantity: string;
  freqValue: string;
  freqPeriod: string;
  durValue: string;
  durUnit: string;
}

export function ClinicalNotesForm({
  onSubmit,
  onGeneratePrescription,
  patient,
  doctor,
  medicationsCatalog,
}: ClinicalNotesFormProps) {
  const meds = medicationsCatalog ?? DEFAULT_MEDICATIONS;
  const [showPrescription, setShowPrescription] = useState(false);
  const [submittedData, setSubmittedData] = useState<Consultation | null>(null);

  // Track structured form state per medication row
  const [medForms, setMedForms] = useState<MedFormState[]>([
    {
      quantity: "1",
      freqValue: "8",
      freqPeriod: "horas",
      durValue: "7",
      durUnit: "días",
    },
  ]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<Consultation>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      motivoConsulta: "",
      examenFisico: "",
      diagnostico: "",
      prescriptions: [
        { medicationId: "", dose: "", frequency: "", duration: "", notes: "" },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  const watchedPrescriptions = watch("prescriptions");

  // Build dose string from medication selection + structured form
  const buildDoseString = (index: number, medicationId: string): string => {
    const med = meds.find((m) => m.id === medicationId);
    const form = medForms[index];
    if (!med) return "";
    const qty = form?.quantity || "1";
    const label = presentationLabels[med.presentation].toLowerCase();
    return `${qty} ${label}`;
  };

  // Build frequency string
  const buildFreqString = (index: number): string => {
    const form = medForms[index];
    if (!form) return "";
    return `Cada ${form.freqValue} ${form.freqPeriod}`;
  };

  // Build duration string
  const buildDurString = (index: number): string => {
    const form = medForms[index];
    if (!form) return "";
    return `${form.durValue} ${form.durUnit}`;
  };

  const handleMedSelect = (index: number, medicationId: string) => {
    setValue(`prescriptions.${index}.medicationId`, medicationId);
    const doseStr = buildDoseString(index, medicationId);
    setValue(`prescriptions.${index}.dose`, doseStr);
    setValue(`prescriptions.${index}.frequency`, buildFreqString(index));
    setValue(`prescriptions.${index}.duration`, buildDurString(index));
  };

  const handleFormFieldChange = (
    index: number,
    field: keyof MedFormState,
    value: string,
  ) => {
    const updated = [...medForms];
    updated[index] = { ...updated[index], [field]: value };
    setMedForms(updated);

    // Rebuild dose strings
    const medId = watchedPrescriptions[index]?.medicationId;
    if (medId && field === "quantity") {
      setValue(`prescriptions.${index}.dose`, buildDoseString(index, medId));
    }
    if (field === "freqValue" || field === "freqPeriod") {
      setValue(`prescriptions.${index}.frequency`, buildFreqString(index));
    }
    if (field === "durValue" || field === "durUnit") {
      setValue(`prescriptions.${index}.duration`, buildDurString(index));
    }
  };

  const handleFormSubmit = (data: Consultation) => {
    setSubmittedData(data);
    setShowPrescription(true);
    onGeneratePrescription(data);
  };

  const handleAddMed = () => {
    append({
      medicationId: "",
      dose: "",
      frequency: "",
      duration: "",
      notes: "",
    });
    setMedForms([
      ...medForms,
      {
        quantity: "1",
        freqValue: "8",
        freqPeriod: "horas",
        durValue: "7",
        durUnit: "días",
      },
    ]);
  };

  const handleRemoveMed = (index: number) => {
    remove(index);
    setMedForms(medForms.filter((_, i) => i !== index));
  };

  // Show prescription preview
  if (showPrescription && submittedData && patient && doctor) {
    const prescriptionItems = submittedData.prescriptions.map((p) => {
      const med = meds.find((m) => m.id === p.medicationId);
      return {
        ...p,
        medicationId: med
          ? `${med.activePrinciple} ${med.concentration}`
          : p.medicationId,
      };
    });

    return (
      <div className="flex flex-col gap-6">
        <DigitalPrescriptionCard
          doctor={doctor as Doctor}
          patient={patient as Patient}
          prescriptions={prescriptionItems}
          medications={meds as unknown as Medication[]}
          issuanceDate={new Date()}
        />
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPrescription(false)}
            className="rounded-2xl border-slate-200"
          >
            ← Editar
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(submittedData)}
            className="rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3"
          >
            Confirmar y Enviar Récipe
          </Button>
        </div>
      </div>
    );
  }

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
            placeholder="Ej: Apendicitis aguda, Hipertensión arterial..."
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

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const selectedMedId = watchedPrescriptions[index]?.medicationId;
            const selectedMed = meds.find((m) => m.id === selectedMedId);

            return (
              <div
                key={field.id}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col gap-4"
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
                      onClick={() => handleRemoveMed(index)}
                      className="rounded-xl hover:bg-red-50"
                    >
                      <X className="size-4 text-red-500" />
                    </Button>
                  )}
                </div>

                {/* Row 1: Medicamento + Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Medicamento
                    </label>
                    <select
                      className={selectClassName}
                      value={selectedMedId || ""}
                      onChange={(e) => handleMedSelect(index, e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {meds.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.activePrinciple} {med.concentration}
                        </option>
                      ))}
                    </select>
                    {errors.prescriptions?.[index]?.medicationId && (
                      <p className="text-xs text-blue-700 mt-0.5">
                        {errors.prescriptions[index]?.medicationId?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Tipo
                    </label>
                    <div
                      className={`${inputClassName} bg-slate-100 text-slate-600 cursor-default`}
                    >
                      {selectedMed
                        ? `${presentationLabels[selectedMed.presentation]} · ${selectedMed.concentration}`
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Row 2: Cantidad + Frecuencia */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={medForms[index]?.quantity || "1"}
                        onChange={(e) =>
                          handleFormFieldChange(
                            index,
                            "quantity",
                            e.target.value,
                          )
                        }
                        className={`${inputClassName} w-20 text-center`}
                      />
                      <span className="text-sm text-slate-500">
                        {selectedMed
                          ? presentationLabels[
                              selectedMed.presentation
                            ].toLowerCase()
                          : "unidad"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Frecuencia
                    </label>
                    <select
                      className={selectClassName}
                      value={medForms[index]?.freqValue || "8"}
                      onChange={(e) =>
                        handleFormFieldChange(
                          index,
                          "freqValue",
                          e.target.value,
                        )
                      }
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Duración */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Duración
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={medForms[index]?.durValue || "7"}
                      onChange={(e) =>
                        handleFormFieldChange(index, "durValue", e.target.value)
                      }
                      className={`${inputClassName} w-20 text-center`}
                    />
                    <select
                      className={`${selectClassName} w-36`}
                      value={medForms[index]?.durUnit || "días"}
                      onChange={(e) =>
                        handleFormFieldChange(index, "durUnit", e.target.value)
                      }
                    >
                      {DURATION_UNITS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Observación */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Observación
                  </label>
                  <textarea
                    placeholder="Ej: Tomar con alimentos, evitar alcohol..."
                    className={`${textAreaClassName} min-h-[60px]`}
                    {...register(`prescriptions.${index}.notes`)}
                  />
                </div>

                {/* Hidden fields for schema compatibility */}
                <input
                  type="hidden"
                  {...register(`prescriptions.${index}.dose`)}
                />
                <input
                  type="hidden"
                  {...register(`prescriptions.${index}.frequency`)}
                />
                <input
                  type="hidden"
                  {...register(`prescriptions.${index}.duration`)}
                />
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMed}
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
          <FileText className="size-4" />
          Finalizar Consulta y Emitir Récipe
        </Button>
      </div>
    </form>
  );
}
