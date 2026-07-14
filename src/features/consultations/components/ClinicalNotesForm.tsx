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
  Pencil,
  Trash2,
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
import { DigitalLabRequestCard } from "./DigitalLabRequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select, { components } from "react-select";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useLabRequests, useDeleteLabRequest, useUpdateLabRequest } from "@/features/labs/hooks/useLabRequests";
import { LabRequestModal } from "@/features/labs/components/LabRequestModal";
import { Badge } from "@/components/ui/badge";
import { Dna, Layers } from "lucide-react";
import { toast } from "sonner";
import { usePrescriptionTemplates } from "@/features/medications/hooks/usePrescriptionTemplates";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useProviderServices, useGlobalServices } from "@/features/services";

interface ClinicalNotesFormProps {
  onSubmit: (data: Consultation) => void;
  onGeneratePrescription: (data: Consultation) => Promise<any>;
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
    uuid?: string;
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
    vitals?: {
      weight?: string;
      height?: string;
      systolic_bp?: string;
      diastolic_bp?: string;
      heart_rate?: string;
      respiratory_rate?: string;
      temperature?: string;
      oxygen_sat?: string;
    };
    laboratorios?: {
      uuid?: string;
      examsList: string[];
      instructions?: string;
    }[];
    followUp?: {
      uuid?: string;
      scheduledDate: string;
      channel: "EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL";
      messageTemplate?: string | null;
    };
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
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20";
const textAreaClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 resize-none min-h-[100px]";
const selectClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 cursor-pointer";

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
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("notes");
  const [hasFollowUp, setHasFollowUp] = useState(false);

  // Servicios extra states
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? user?.id ?? "doc-default";
  const { data: myServices = [] } = useProviderServices(doctorUuid);
  const { data: globalServices = [] } = useGlobalServices();
  const [selectedServiceUuid, setSelectedServiceUuid] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceQty, setServiceQty] = useState(1);

  useEffect(() => {
    if (activeTabParam && ["notes", "vitals", "prescription", "labs", "seguimiento", "procedures"].includes(activeTabParam)) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const getDefaultMessage = (dateStr: string) => {
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
    const doctorName = doctor ? doctor.name : "su médico";
    const dx = watch("diagnostico") || "su tratamiento";
    return `Hola ${patientName}, te saluda el equipo del Dr. ${doctorName}. Queremos recordar/dar seguimiento a tu evolución de "${dx}". ¿Cómo te has sentido?`;
  };

  const [medsOptions, setMedsOptions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMeds, setIsLoadingMeds] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const meds = medsOptions;

  const [showPrescription, setShowPrescription] = useState(false);
  const [submittedData, setSubmittedData] = useState<Consultation | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLabRequest, setEditingLabRequest] = useState<LabRequest | null>(null);
  const { data: combosData } = usePrescriptionTemplates();

  const parseQuantity = (doseStr: string): string => {
    const match = doseStr.match(/^(\d+(\.\d+)?)/);
    return match ? match[1] : "1";
  };

  const parseFrequency = (freqStr: string): string => {
    const match = freqStr.match(/(\d+)/);
    if (match) return match[1];
    if (freqStr.toLowerCase().includes("diario")) return "24";
    return "8";
  };

  const parseDuration = (durStr: string): { value: string; unit: string } => {
    const numMatch = durStr.match(/(\d+)/);
    const value = numMatch ? numMatch[1] : "7";
    let unit = "días";
    if (durStr.toLowerCase().includes("semana")) {
      unit = "semanas";
    } else if (durStr.toLowerCase().includes("mes")) {
      unit = "meses";
    }
    return { value, unit };
  };

  const handleApplyCombo = (combo: any) => {
    const newMedForms = [...medForms];
    
    combo.items.forEach((item: any) => {
      const qty = parseQuantity(item.dose);
      const freq = parseFrequency(item.frequency);
      const { value: durVal, unit: durUnit } = parseDuration(item.duration);

      append({
        medicationId: item.medicationId,
        dose: item.dose,
        frequency: item.frequency,
        duration: item.duration,
        notes: item.notes || "",
      });

      newMedForms.push({
        quantity: qty,
        freqValue: freq,
        freqPeriod: "horas",
        durValue: durVal,
        durUnit: durUnit,
      });
    });

    setMedForms(newMedForms);
    toast.success(`Combo "${combo.title}" aplicado correctamente.`);
  };

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
      uuid: "",
      motivoConsulta: "",
      examenFisico: "",
      diagnostico: "",
      prescriptions: [
        { medicationId: "", dose: "", frequency: "", duration: "", notes: "" },
      ],
      servicesPerformed: [],
    },
    mode: "onChange",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "servicesPerformed",
  });

  const defaultUuid = defaultValues?.uuid || "";
  useEffect(() => {
    if (defaultUuid && !watch("uuid")) {
      setValue("uuid", defaultUuid);
    }
  }, [defaultUuid, setValue, watch]);

  const currentConsultationUuid = watch("uuid") || defaultUuid;
  const { data: allLabRequests = [], isLoading: isLoadingLabs } = useLabRequests(patient?.uuid);
  const consultationLabs = allLabRequests.filter(
    (req) =>
      (req.consultationUuid === currentConsultationUuid ||
        (req as any).consultation?.uuid === currentConsultationUuid) &&
      !req.deletedAt
  );

  // Initialize form laboratorios from database when loaded
  useEffect(() => {
    if (consultationLabs.length > 0 && (!watch("laboratorios") || watch("laboratorios")?.length === 0)) {
      setValue(
        "laboratorios",
        consultationLabs.map((req) => ({
          uuid: req.uuid,
          examsList: req.examsList,
          instructions: req.instructions,
          _syncStatus: req._syncStatus,
        }))
      );
    }
  }, [consultationLabs, setValue]);

  const handleDeleteLabRequest = (uuid: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este pedido de laboratorio de la consulta?")) {
      const currentLabs = watch("laboratorios") || [];
      setValue(
        "laboratorios",
        currentLabs.filter((l) => l.uuid !== uuid)
      );
      toast.success("Pedido de laboratorio removido de la consulta.");
    }
  };

  const handleEditLabRequest = (req: any) => {
    setEditingLabRequest({
      ...req,
      patientUuid: patient?.uuid || "",
      doctorUuid: doctor?.uuid || "",
      consultationUuid: currentConsultationUuid,
      isCompleted: false,
    } as LabRequest);
    setIsLabModalOpen(true);
  };

  // Resetear el formulario reactivamente cuando lleguen los defaultValues por primera vez o si está limpio
  useEffect(() => {
    if (defaultValues) {
      const isClean = !isDirty;
      const shouldReset = !hasInitialized.current || isClean;

      if (shouldReset) {
        hasInitialized.current = true;
        reset(defaultValues);
        if (defaultValues.followUp?.scheduledDate) {
          setHasFollowUp(true);
        } else {
          setHasFollowUp(false);
        }

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

  const handleFormSubmit = async (data: Consultation) => {
    setSubmittedData(data);
    setShowPrescription(true);
    try {
      const res = await onGeneratePrescription(data);
      if (res && res.laboratorios) {
        setValue("laboratorios", res.laboratorios);
        setSubmittedData({ ...data, laboratorios: res.laboratorios });
      }
    } catch (err) {
      console.error("Error al generar receta:", err);
    }
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

    const labs = submittedData.laboratorios || [];

    return (
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-800">
            Confirmación de Récipes y Órdenes
          </h2>
          <p className="text-sm text-slate-500">
            Revisá los récipe de medicamentos y órdenes de exámenes clínicos antes de finalizar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">
              Récipe de Medicamentos
            </h3>
            <DigitalPrescriptionCard
              doctor={doctor as Doctor}
              patient={patient as Patient}
              prescriptions={prescriptionItems}
              medications={meds as unknown as Medication[]}
              issuanceDate={new Date()}
            />
          </div>

          <div className="space-y-4 lg:col-span-1">
            {labs.length > 0 ? (
              <>
                <h3 className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">
                  Orden de Laboratorio
                </h3>
                {labs.map((lab, i) => (
                  <DigitalLabRequestCard
                    key={i}
                    doctor={doctor as Doctor}
                    patient={patient as Patient}
                    examsList={lab.examsList}
                    instructions={lab.instructions}
                    issuanceDate={new Date()}
                  />
                ))}
              </>
            ) : (
              <div className="h-full flex flex-col justify-center items-center p-8 bg-slate-50 border border-slate-200/60 rounded-3xl text-slate-400 text-center select-none min-h-[250px]">
                <Dna className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium">Sin exámenes solicitados</p>
                <p className="text-xxs text-slate-400 mt-1 max-w-[200px]">No se agregaron órdenes de laboratorio para esta consulta.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">
              Facturación Administrativa
            </h3>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pre-Factura Interna (LUCA)
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Consulta Médica General:</span>
                  <span className="font-semibold text-slate-900">50.00 USD</span>
                </div>
                {submittedData.servicesPerformed && submittedData.servicesPerformed.map((val: any, idx: number) => {
                  const pSvc = myServices.find((s) => s.uuid === val.providerServiceUuid);
                  const baseSvc = pSvc ? globalServices.find((s) => s.uuid === pSvc.serviceUuid) : null;
                  const name = pSvc?.customName || baseSvc?.name || "Servicio extra";
                  return (
                    <div key={idx} className="flex justify-between text-slate-600 pl-3 border-l-2 border-teal-500/30">
                      <span className="truncate max-w-[150px]">{name} (x{val.quantity}):</span>
                      <span className="font-semibold text-slate-900">{(val.price * val.quantity).toFixed(2)} USD</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-3 mt-2">
                  <span>Total Honorarios:</span>
                  <span className="text-teal-600">
                    {(
                      50 +
                      (submittedData.servicesPerformed || []).reduce(
                        (acc: number, val: any) => acc + val.price * val.quantity,
                        0
                      )
                    ).toFixed(2)} USD
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xxs text-slate-400 mt-2 leading-relaxed">
                * Este documento es un registro interno para la administración del profesional y la clínica. No representa una factura fiscal de cobro al paciente.
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 border-t border-slate-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPrescription(false)}
            className="rounded-2xl border-slate-200 h-12 px-6"
          >
            ← Editar Consulta
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit(submittedData)}
            className="rounded-2xl bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold px-8 h-12 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Guardando...
              </>
            ) : (
              "Confirmar y Guardar Todo"
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
      <input type="hidden" {...register("uuid")} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <TabsTrigger
            value="labs"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <Dna className="size-4" />
            Exámenes de Laboratorio
          </TabsTrigger>
          <TabsTrigger
            value="seguimiento"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <Calendar className="size-4" />
            Seguimiento Clínico
          </TabsTrigger>
          <TabsTrigger
            value="procedures"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-pharmako-care px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <Layers className="size-4" />
            Servicios y Procedimientos
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

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMed}
                className="rounded-xl border-dashed border-slate-300 h-9 font-semibold text-xs"
              >
                <Plus className="size-4" />
                Agregar Medicamento
              </Button>

              {combosData?.data && combosData.data.length > 0 && (
                <div className="relative group">
                  <select
                    onChange={(e) => {
                      const selected = combosData.data.find(c => c.uuid === e.target.value);
                      if (selected) {
                        handleApplyCombo(selected);
                        e.target.value = ""; // Reset select
                      }
                    }}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <option value="">Aplicar Combo de Prescripción...</option>
                    {combosData.data.map((c) => (
                      <option key={c.uuid} value={c.uuid}>
                        {c.title} ({c.items.length} fármacos)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {errors.prescriptions &&
              typeof errors.prescriptions.message === "string" && (
                <p className="text-xs text-red-500">
                  {errors.prescriptions.message}
                </p>
              )}
          </section>
        </TabsContent>

        <TabsContent
          value="labs"
          className="focus-visible:outline-none"
        >
          {/* ── Exámenes de Laboratorio ──────────────────────── */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-slate-100" />
              <h3 className="text-md font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
                <Dna className="size-6 text-pharmako-care" />
                Exámenes de Laboratorio
              </h3>
              <Separator className="flex-1 bg-slate-100" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Agregá órdenes de exámenes clínicos a esta consulta.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingLabRequest(null);
                    setIsLabModalOpen(true);
                  }}
                  className="border border-pharmako-care bg-white hover:bg-pharmako-care-hover hover:text-white text-pharmako-care rounded-xl flex items-center gap-1.5 text-xs py-1.5 h-9"
                >
                  <Plus className="w-4 h-4" /> Generar Examen
                </Button>
              </div>

              {isLoadingLabs ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Cargando exámenes...
                </div>
              ) : (watch("laboratorios") || []).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-sm text-slate-400">
                  No se han solicitado exámenes en esta consulta.
                </div>
              ) : (
                <div className="space-y-3">
                  {(watch("laboratorios") || []).map((req) => (
                    <div
                      key={req.uuid}
                      className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap gap-1.5">
                          {req.examsList.map((exam, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-slate-200 text-slate-700 text-sm rounded-md py-2 h-10"
                            >
                              {exam}
                            </Badge>
                          ))}
                        </div>
                        {req.instructions && (
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                            <span className="font-bold text-slate-700">Indicaciones: </span>
                            {req.instructions}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {req._syncStatus === "synced" ? (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-sm rounded-md mr-2 py-1 h-7">
                            Sincronizado
                          </Badge>
                        ) : req._syncStatus === "pending" ? (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-sm rounded-md mr-2 py-1 h-7">
                            Pendiente Sinc.
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm rounded-md mr-2 py-1 h-7">
                            Por guardar
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditLabRequest(req)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLabRequest(req.uuid)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent
          value="seguimiento"
          className="flex flex-col gap-6 focus-visible:outline-none"
        >
          <section className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="bg-amber-50 rounded-xl p-2.5">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Programar Seguimiento Médico</h3>
                <p className="text-xs text-slate-500">Define cuándo y cómo volver a contactar al paciente después de esta consulta.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="has_follow_up"
                checked={hasFollowUp}
                onChange={(e) => {
                  setHasFollowUp(e.target.checked);
                  if (e.target.checked) {
                    const defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 7);
                    const formatted = defaultDate.toISOString().split("T")[0];
                    setValue("followUp.scheduledDate", formatted);
                    setValue("followUp.channel", "MANUAL_CALL");
                    setValue("followUp.messageTemplate", getDefaultMessage(formatted));
                  } else {
                    setValue("followUp", undefined);
                  }
                }}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5"
              />
              <label htmlFor="has_follow_up" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Activar seguimiento programado para este paciente
              </label>
            </div>

            {hasFollowUp && (
              <div className="flex flex-col gap-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-in fade-in duration-200" />
                      Fecha de Contacto
                    </label>
                    <input
                      type="date"
                      {...register("followUp.scheduledDate", { required: hasFollowUp })}
                      className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Canal de Comunicación
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "MANUAL_CALL", label: "Llamada" },
                        { value: "WHATSAPP", label: "WhatsApp" },
                        { value: "EMAIL", label: "Correo" },
                        { value: "INTERNAL_CHAT", label: "Chat LUCA" },
                      ].map((chan) => {
                        const isSelected = watch("followUp.channel") === chan.value;
                        return (
                          <button
                            key={chan.value}
                            type="button"
                            onClick={() => {
                              setValue("followUp.channel", chan.value as any);
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                              isSelected
                                ? "border-teal-600 bg-teal-50/50 text-teal-600"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-xs font-bold">{chan.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {watch("followUp.channel") !== "MANUAL_CALL" && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Mensaje / Plantilla a Enviar
                    </label>
                    <textarea
                      {...register("followUp.messageTemplate")}
                      placeholder="Redactá el mensaje de control para el paciente..."
                      className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[100px]"
                    />
                    <p className="text-xxs text-slate-400">
                      Podés usar tags como <code className="font-semibold text-slate-500">{"{{paciente}}"}</code>, <code className="font-semibold text-slate-500">{"{{doctor}}"}</code> o <code className="font-semibold text-slate-500">{"{{diagnostico}}"}</code> que se autocompletarán al enviar.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent
          value="procedures"
          className="flex flex-col gap-6 focus-visible:outline-none"
        >
          <section className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="bg-teal-50 rounded-xl p-2.5">
                <Layers className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Servicios y Procedimientos Realizados</h3>
                <p className="text-xs text-slate-500">
                  Agregá los servicios o procedimientos adicionales realizados al paciente durante esta consulta.
                </p>
              </div>
            </div>

            {/* Selector de servicio y notas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  Seleccionar Servicio
                </label>
                <select
                  value={selectedServiceUuid}
                  onChange={(e) => setSelectedServiceUuid(e.target.value)}
                  className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="">-- Elegí un servicio --</option>
                  {myServices.map((pSvc) => {
                    const base = globalServices.find((s) => s.uuid === pSvc.serviceUuid);
                    return (
                      <option key={pSvc.uuid} value={pSvc.uuid}>
                        {pSvc.customName || base?.name || "Servicio"} - {pSvc.price} USD ({pSvc.durationMinutes} min)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Notas sobre el Procedimiento</label>
                <input
                  type="text"
                  placeholder="Ej: Se realiza sin complicaciones, sutura de 3 puntos..."
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={serviceQty}
                  onChange={(e) => setServiceQty(parseInt(e.target.value) || 1)}
                  className="rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-1">
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedServiceUuid) {
                      toast.error("Por favor selecciona un servicio.");
                      return;
                    }
                    const selected = myServices.find((s) => s.uuid === selectedServiceUuid);
                    if (!selected) return;

                    appendService({
                      providerServiceUuid: selected.uuid,
                      price: selected.price,
                      quantity: serviceQty,
                      notes: serviceNotes || undefined,
                    });

                    // Si la duración es mayor a 0, notificar retraso estimado
                    if (selected.durationMinutes > 0) {
                      toast.info(
                        `Se registrará un retraso estimado de ${selected.durationMinutes * serviceQty} minutos en tu agenda para los pacientes del día.`,
                        { duration: 5000 }
                      );

                      // Guardar alerta en Dexie para DelayBanner
                      db.activeDelays.get(doctorUuid).then((existingDelay) => {
                        const currentDelay = existingDelay?.delayMinutes || 0;
                        db.activeDelays.put({
                          doctorUuid,
                          doctorName: doctor?.name || "Dr. Ricardo García",
                          delayMinutes: currentDelay + (selected.durationMinutes * serviceQty),
                          updatedAt: new Date().toISOString(),
                        }).catch((err) => {
                          console.error("Error setting delay alert in Dexie", err);
                        });
                      });
                    }

                    // Reset local inputs
                    setSelectedServiceUuid("");
                    setServiceNotes("");
                    setServiceQty(1);
                    toast.success("Procedimiento agregado.");
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Listado de servicios agregados */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Servicios a registrar:</h4>
              {serviceFields.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No se han registrado procedimientos extra en esta consulta.</p>
              ) : (
                <div className="space-y-3">
                  {serviceFields.map((field, index) => {
                    const val = watch(`servicesPerformed.${index}`);
                    if (!val) return null;
                    const pSvc = myServices.find((s) => s.uuid === val.providerServiceUuid);
                    const baseSvc = pSvc ? globalServices.find((s) => s.uuid === pSvc.serviceUuid) : null;
                    const name = pSvc?.customName || baseSvc?.name || "Servicio desconocido";

                    return (
                      <div 
                        key={field.id} 
                        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{name}</span>
                            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 font-normal border-none rounded">
                              Cant: {val.quantity}
                            </Badge>
                            {pSvc && (
                              <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 font-normal border-none rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {pSvc.durationMinutes * val.quantity} min
                              </Badge>
                            )}
                          </div>
                          {val.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              Nota: {val.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {val.price * val.quantity} USD
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeService(index)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Delay summary alert */}
                  {(() => {
                    const totalDuration = serviceFields.reduce((sum, _, index) => {
                      const val = watch(`servicesPerformed.${index}`);
                      if (!val) return sum;
                      const pSvc = myServices.find((s) => s.uuid === val.providerServiceUuid);
                      return sum + (pSvc ? pSvc.durationMinutes * val.quantity : 0);
                    }, 0);

                    if (totalDuration === 0) return null;

                    return (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-start gap-2.5 mt-4">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Aviso de extensión de consulta</p>
                          <p className="mt-0.5 leading-relaxed text-amber-700">
                            Has agregado procedimientos que incrementan el tiempo de esta consulta en **{totalDuration} minutos**.
                            Al finalizar la consulta, el sistema enviará alertas de retraso a los pacientes agendados a continuación.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <LabRequestModal
        isOpen={isLabModalOpen}
        onClose={() => {
          setIsLabModalOpen(false);
          setEditingLabRequest(null);
        }}
        patientUuid={patient?.uuid}
        consultationUuid={currentConsultationUuid}
        existingRequest={editingLabRequest}
        onSave={(labData) => {
          const currentLabs = watch("laboratorios") || [];
          if (editingLabRequest) {
            setValue(
              "laboratorios",
              currentLabs.map((l) =>
                l.uuid === editingLabRequest.uuid
                  ? { ...l, examsList: labData.examsList, instructions: labData.instructions }
                  : l
              )
            );
            toast.success("Pedido de laboratorio actualizado en la consulta.");
          } else {
            setValue("laboratorios", [
              ...currentLabs,
              {
                uuid: labData.uuid || crypto.randomUUID(),
                examsList: labData.examsList,
                instructions: labData.instructions,
              },
            ]);
            toast.success("Pedido de laboratorio agregado a la consulta.");
          }
          setIsLabModalOpen(false);
          setEditingLabRequest(null);
        }}
      />

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
