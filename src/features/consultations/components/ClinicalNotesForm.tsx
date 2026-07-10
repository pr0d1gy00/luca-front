import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  X,
  Pill,
  FileText,
  Loader2,
  Activity,
  Weight,
  Ruler,
  Thermometer,
  Heart,
  Wind,
  Info,
  Clock,
  Calendar,
  MessageSquare,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  consultationSchema,
  type Consultation,
  type Patient,
  type Doctor,
  type Medication,
  presentationLabels,
  administrationRouteLabels,
} from "../schemas";
import { Separator } from "@/components/ui/separator";
import { DigitalPrescriptionCard } from "./DigitalPrescriptionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select, { components } from "react-select";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";

interface ClinicalNotesFormProps {
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => void;
  patient?: Patient;
  doctor?: Doctor;
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
  defaultValues?: {
    motivoConsulta: string;
    examenFisico: string;
    diagnostico: string;
    prescriptions?: {
      medicationId: string;
      dose: string;
      frequency: string;
      duration: string;
      notes?: string;
    }[];
  };
  isSubmitting?: boolean;
}

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
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20";
const textAreaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 resize-none min-h-[100px]";
const selectClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 cursor-pointer";

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
  defaultValues,
  isSubmitting = false,
}: ClinicalNotesFormProps) {
  const [medsOptions, setMedsOptions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMeds, setIsLoadingMeds] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const meds = medsOptions;

  const [showPrescription, setShowPrescription] = useState(false);
  const [submittedData, setSubmittedData] = useState<Consultation | null>(null);

  const fetchMedications = async (
    page: number,
    search: string,
    append = false,
  ) => {
    setIsLoadingMeds(true);
    try {
      if (!navigator.onLine) {
        const localMeds = await db.medications
          .filter((m) => {
            if (!search) return true;
            const term = search.toLowerCase();
            return (
              (m.activePrinciple?.toLowerCase() || "").includes(term) ||
              (m.name?.toLowerCase() || "").includes(term) ||
              (m.commercialName?.toLowerCase() || "").includes(term)
            );
          })
          .toArray();

        const formatted = localMeds.map((m) => ({
          id: m.uuid,
          activePrinciple: m.activePrinciple || m.name || "",
          commercialName: m.commercialName || "",
          concentration: m.concentration || "—",
          presentation: m.presentation || "TABLETA",
          administrationRoute: m.administrationRoute || "ORAL",
        }));
        setMedsOptions(formatted);
        setCurrentPage(1);
        setHasMore(false);
        return;
      }

      const { data } = await apiClient.get(`/medications`, {
        params: {
          page,
          search: search || undefined,
        },
      });

      const apiData = data?.data;
      const fetchedItems = apiData?.data ?? [];
      const lastPage = apiData?.last_page ?? 1;
      const currentPageNum = apiData?.current_page ?? 1;

      const formatted = fetchedItems.map((m: any) => ({
        id: m.uuid,
        activePrinciple: m.active_principle || m.name || "",
        commercialName: m.commercial_name || "",
        concentration: m.concentration || "—",
        presentation: m.presentation || "TABLETA",
        administrationRoute: m.administration_route || "ORAL",
      }));

      if (append) {
        setMedsOptions((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          const newItems = formatted.filter((x: any) => !existingIds.has(x.id));
          return [...prev, ...newItems];
        });
      } else {
        const selectedIds =
          watchedPrescriptions
            ?.map((p) => p.medicationId)
            .filter((id) => !!id) || [];
        const selectedMeds = medsOptions.filter((m) =>
          selectedIds.includes(m.id),
        );

        const existingIds = new Set(formatted.map((x: any) => x.id));
        const keptMeds = selectedMeds.filter((m) => !existingIds.has(m.id));

        setMedsOptions([...formatted, ...keptMeds]);
      }

      setCurrentPage(currentPageNum);
      setHasMore(currentPageNum < lastPage);
    } catch (err) {
      console.error("Error fetching medications:", err);
      const localMeds = await db.medications.toArray();
      if (localMeds.length > 0) {
        const formatted = localMeds.map((m) => ({
          id: m.uuid,
          activePrinciple: m.activePrinciple || m.name || "",
          commercialName: m.commercialName || "",
          concentration: m.concentration || "—",
          presentation: m.presentation || "TABLETA",
          administrationRoute: m.administrationRoute || "ORAL",
        }));
        setMedsOptions(formatted);
      }
    } finally {
      setIsLoadingMeds(false);
    }
  };

  useEffect(() => {
    const loadInitialMeds = async () => {
      setIsLoadingMeds(true);
      try {
        if (!navigator.onLine) {
          const localMeds = await db.medications.toArray();
          if (localMeds.length > 0) {
            const formatted = localMeds.map((m) => ({
              id: m.uuid,
              activePrinciple: m.activePrinciple || m.name || "",
              commercialName: m.commercialName || "",
              concentration: m.concentration || "—",
              presentation: m.presentation || "TABLETA",
              administrationRoute: m.administrationRoute || "ORAL",
            }));
            setMedsOptions(formatted);
            setCurrentPage(1);
            setHasMore(false);
          }
          return;
        }

        const { data } = await apiClient.get(`/medications`, {
          params: { page: 1 },
        });
        const apiData = data?.data;
        const fetchedItems = apiData?.data ?? [];
        const lastPage = apiData?.last_page ?? 1;
        const currentPageNum = apiData?.current_page ?? 1;

        const formatted = fetchedItems.map((m: any) => ({
          id: m.uuid,
          activePrinciple: m.active_principle || m.name || "",
          commercialName: m.commercial_name || "",
          concentration: m.concentration || "—",
          presentation: m.presentation || "TABLETA",
          administrationRoute: m.administration_route || "ORAL",
        }));

        let finalMeds = [...formatted];

        const selectedIds =
          defaultValues?.prescriptions
            ?.map((p) => p.medicationId)
            .filter((id) => !!id) || [];

        const missingIds = selectedIds.filter(
          (id) => !finalMeds.some((m) => m.id === id),
        );

        if (missingIds.length > 0) {
          const fetchedMissing = await Promise.all(
            missingIds.map(async (id) => {
              try {
                const { data: res } = await apiClient.get(`/medications/${id}`);
                const m = res?.data;
                if (m) {
                  return {
                    id: m.uuid,
                    activePrinciple: m.active_principle || m.name || "",
                    commercialName: m.commercial_name || "",
                    concentration: m.concentration || "—",
                    presentation: m.presentation || "TABLETA",
                    administrationRoute: m.administration_route || "ORAL",
                  };
                }
              } catch (e) {
                console.error(`Error loading missing med ${id}:`, e);
              }
              return null;
            }),
          );
          const validMissing = fetchedMissing.filter(
            (m) => m !== null,
          ) as any[];
          finalMeds = [...finalMeds, ...validMissing];
        }

        setMedsOptions(finalMeds);
        setCurrentPage(currentPageNum);
        setHasMore(currentPageNum < lastPage);
      } catch (err) {
        console.error("Error loading medications catalog:", err);
      } finally {
        setIsLoadingMeds(false);
      }
    };

    loadInitialMeds();
  }, [defaultValues]);

  const handleInputChange = (
    inputValue: string,
    { action }: { action: string },
  ) => {
    if (action === "input-change") {
      setSearchTerm(inputValue);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchMedications(1, inputValue, false);
      }, 350);
    }
  };

  const MenuList = (props: any) => {
    return (
      <components.MenuList {...props}>
        {props.children}
        {hasMore && (
          <div className="p-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoadingMeds) {
                  fetchMedications(currentPage + 1, searchTerm, true);
                }
              }}
              disabled={isLoadingMeds}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 py-1.5 px-3 border border-teal-200 hover:border-teal-300 rounded-lg bg-teal-50/55 hover:bg-teal-55 transition-all cursor-pointer w-full text-center disabled:opacity-50"
            >
              {isLoadingMeds ? "Cargando..." : "Cargar más..."}
            </button>
          </div>
        )}
      </components.MenuList>
    );
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#0d9488" : "#e2e8f0",
      borderRadius: "0.75rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(13, 148, 136, 0.2)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#0d9488" : "#cbd5e1",
      },
      fontSize: "0.875rem",
      color: "#0f172a",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0d9488"
        : state.isFocused
          ? "#f0fdfa"
          : "white",
      color: state.isSelected ? "white" : "#0f172a",
      fontSize: "0.875rem",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#0d9488",
        color: "white",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#0f172a",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#94a3b8",
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      zIndex: 50,
    }),
  };

  const hasInitialized = useRef(false);

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
    formState: { errors, isValid, isDirty },
    watch,
    reset,
  } = useForm<Consultation>({
    resolver: zodResolver(consultationSchema),
    defaultValues: defaultValues ?? {
      motivoConsulta: "",
      examenFisico: "",
      diagnostico: "",
      prescriptions: [
        { medicationId: "", dose: "", frequency: "", duration: "", notes: "" },
      ],
    },
    mode: "onChange",
  });

  // Resetear el formulario reactivamente cuando lleguen los defaultValues por primera vez o si está limpio
  useEffect(() => {
    if (defaultValues) {
      const isClean = !isDirty;
      const shouldReset = !hasInitialized.current || isClean;

      if (shouldReset) {
        hasInitialized.current = true;
        reset(defaultValues);

        // Intentar re-popular las variables estructuradas medForms para cada récipe cargado
        if (
          defaultValues.prescriptions &&
          defaultValues.prescriptions.length > 0
        ) {
          const parsedMedForms = defaultValues.prescriptions.map((p) => {
            // Desarmar dosis "1 tableta" -> quantity: "1"
            const qty = p.dose ? p.dose.split(" ")[0] : "1";

            // Desarmar frecuencia "Cada 8 horas" -> freqValue: "8", freqPeriod: "horas"
            const freqParts = p.frequency ? p.frequency.split(" ") : [];
            const freqVal = freqParts[1] || "8";
            const freqPer = freqParts[2] || "horas";

            // Desarmar duración "7 días" -> durValue: "7", durUnit: "días"
            const durParts = p.duration ? p.duration.split(" ") : [];
            const durVal = durParts[0] || "7";
            const durUnit = durParts[1] || "días";

            return {
              quantity: isNaN(Number(qty)) ? "1" : qty,
              freqValue: freqVal,
              freqPeriod: freqPer,
              durValue: durVal,
              durUnit: durUnit,
            };
          });
          setMedForms(parsedMedForms);
        }
      }
    }
  }, [defaultValues, reset, isDirty]);

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
            disabled={isSubmitting}
            onClick={() => onSubmit(submittedData)}
            className="rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Confirmar y Enviar Récipe"
            )}
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
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="w-full justify-start gap-1 border border-slate-200/50 p-1 rounded-2xl h-12 mb-6">
          <TabsTrigger
            value="notes"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <FileText className="size-4" />
            Notas Clínicas
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <Activity className="size-4" />
            Signos Vitales
          </TabsTrigger>
          <TabsTrigger
            value="prescription"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <Pill className="size-4" />
            Tratamiento y Récipe
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="notes"
          className="flex flex-col gap-6 focus-visible:outline-none"
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
                <p className="text-xs text-red-500 mt-1">
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.diagnostico.message}
                </p>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="vitals" className="focus-visible:outline-none">
          {/* ── Signos Vitales ───────────────────────────────── */}
          <section className="flex flex-col gap-5 bg-white border border-slate-200/50 p-8 rounded-xl">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-slate-100" />
              <h3 className="text-md font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
                <Activity className="size-6 text-pharmako-care" />
                Signos Vitales
              </h3>
              <Separator className="flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 ">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.weight"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Weight className="size-3.5 text-slate-400" />
                  Peso (kg)
                </label>
                <input
                  type="text"
                  id="vitals.weight"
                  placeholder="Ej: 70"
                  className={inputClassName}
                  {...register("vitals.weight")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.height"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Ruler className="size-3.5 text-slate-400" />
                  Estatura (m)
                </label>
                <input
                  type="text"
                  id="vitals.height"
                  placeholder="Ej: 1.75"
                  className={inputClassName}
                  {...register("vitals.height")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.temperature"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Thermometer className="size-3.5 text-slate-400" />
                  Temperatura (°C)
                </label>
                <input
                  type="text"
                  id="vitals.temperature"
                  placeholder="Ej: 36.5"
                  className={inputClassName}
                  {...register("vitals.temperature")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.oxygen_sat"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Wind className="size-3.5 text-slate-400" />
                  Saturación de Oxígeno (%)
                </label>
                <input
                  type="text"
                  id="vitals.oxygen_sat"
                  placeholder="Ej: 98"
                  className={inputClassName}
                  {...register("vitals.oxygen_sat")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.heart_rate"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Heart className="size-3.5 text-slate-400 animate-pulse" />
                  Frecuencia Cardíaca (lpm)
                </label>
                <input
                  type="text"
                  id="vitals.heart_rate"
                  placeholder="Ej: 80"
                  className={inputClassName}
                  {...register("vitals.heart_rate")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="vitals.respiratory_rate"
                  className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
                >
                  <Clock className="size-3.5 text-slate-400" />
                  Frecuencia Respiratoria (rpm)
                </label>
                <input
                  type="text"
                  id="vitals.respiratory_rate"
                  placeholder="Ej: 16"
                  className={inputClassName}
                  {...register("vitals.respiratory_rate")}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Activity className="size-3.5 text-slate-400" />
                  Presión Arterial (mmHg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Sistólica (Ej: 120)"
                    className={inputClassName}
                    {...register("vitals.systolic_bp")}
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="text"
                    placeholder="Diastólica (Ej: 80)"
                    className={inputClassName}
                    {...register("vitals.diastolic_bp")}
                  />
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent
          value="prescription"
          className="focus-visible:outline-none"
        >
          {/* ── Tratamiento y Récipe ─────────────────────────── */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-slate-100" />
              <h3 className="text-md font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
                <Pill className="size-6 text-pharmako-care" />
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
                    className="rounded-2xl p-5 border border-slate-200 flex flex-col gap-4"
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
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Pill className="size-3.5 text-slate-400" />
                          Medicamento
                        </label>
                        <Select
                          options={meds.map((med) => ({
                            value: med.id,
                            label: med.commercialName
                              ? `${med.commercialName} (${med.activePrinciple}) ${med.concentration}`
                              : `${med.activePrinciple} ${med.concentration}`,
                          }))}
                          value={
                            selectedMedId
                              ? {
                                  value: selectedMedId,
                                  label: selectedMed
                                    ? selectedMed.commercialName
                                      ? `${selectedMed.commercialName} (${selectedMed.activePrinciple}) ${selectedMed.concentration}`
                                      : `${selectedMed.activePrinciple} ${selectedMed.concentration}`
                                    : "Seleccionado",
                                }
                              : null
                          }
                          onChange={(option: any) => {
                            handleMedSelect(index, option ? option.value : "");
                          }}
                          onInputChange={handleInputChange}
                          components={{ MenuList }}
                          styles={customSelectStyles}
                          placeholder="Seleccionar..."
                          noOptionsMessage={() =>
                            isLoadingMeds
                              ? "Cargando..."
                              : "No se encontraron medicamentos"
                          }
                          isSearchable={true}
                          isClearable={true}
                        />
                        {errors.prescriptions?.[index]?.medicationId && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {errors.prescriptions[index]?.medicationId?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Info className="size-3.5 text-slate-400" />
                          Tipo
                        </label>
                        <div
                          className={`${inputClassName} bg-slate-100 text-slate-600 cursor-default`}
                        >
                          {selectedMed
                            ? `${presentationLabels[selectedMed.presentation]} · ${selectedMed.concentration} · ${administrationRouteLabels[(selectedMed as unknown as Medication).administrationRoute]}`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Cantidad + Frecuencia */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Hash className="size-3.5 text-slate-400" />
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
                                  selectedMed.presentation as
                                    | "CAPSULA"
                                    | "TABLETA"
                                    | "JARABE"
                                    | "GOTAS"
                                    | "AMPOLLA"
                                    | "CREMA"
                                ].toLowerCase()
                              : "unidad"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Clock className="size-3.5 text-slate-400" />
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
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        Duración
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={medForms[index]?.durValue || "7"}
                          onChange={(e) =>
                            handleFormFieldChange(
                              index,
                              "durValue",
                              e.target.value,
                            )
                          }
                          className={`${inputClassName} w-20 text-center`}
                        />
                        <select
                          className={`${selectClassName} w-36`}
                          value={medForms[index]?.durUnit || "días"}
                          onChange={(e) =>
                            handleFormFieldChange(
                              index,
                              "durUnit",
                              e.target.value,
                            )
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
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <MessageSquare className="size-3.5 text-slate-400" />
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
              className="self-start rounded-2xl border-dashed border-slate-300 h-8 "
            >
              <Plus className="size-5" />
              Agregar Medicamento
            </Button>

            {errors.prescriptions &&
              typeof errors.prescriptions.message === "string" && (
                <p className="text-xs text-red-500">
                  {errors.prescriptions.message}
                </p>
              )}
          </section>
        </TabsContent>
      </Tabs>

      {/* ── Action Bar ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="rounded-2xl bg-pharmako-care hover:bg-pharmako-care h-12 text-white font-medium px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <FileText className="size-5" />
              Finalizar Consulta y Emitir Récipe
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
