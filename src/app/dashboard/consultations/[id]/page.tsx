"use client";

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useActiveConsultationQuery } from "@/features/consultations/hooks/useActiveConsultationQuery";
import {
  useStartConsultation,
  useUpdateConsultation,
} from "@/features/consultations/hooks/useConsultationMutations";
import { useMedicationsCatalog } from "@/features/consultations/hooks/useMedicationsCatalog";
import { PatientContextCard } from "@/features/consultations/components/PatientContextCard";
import { ConsultationTabs } from "@/features/consultations/components/ConsultationTabs";
import type { Consultation } from "@/features/consultations/schemas";
import { toast } from "sonner";

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: detail, isLoading, isError } = useActiveConsultationQuery(id);
  const startConsultation = useStartConsultation();
  const updateConsultation = useUpdateConsultation();
  const { data: medicationsCatalog } = useMedicationsCatalog();
  const router = useRouter();
  const hasTriggeredInit = useRef(false);

  // Auto-iniciar la consulta si no existe un registro previo
  useEffect(() => {
    if (
      detail &&
      !detail.consultation.uuid &&
      !startConsultation.isPending &&
      !startConsultation.isSuccess &&
      !startConsultation.isError &&
      !hasTriggeredInit.current
    ) {
      hasTriggeredInit.current = true;
      startConsultation.mutate({
        patientUuid: detail.patient.uuid,
        appointmentUuid: detail.appointment.uuid,
        reason: detail.appointment.reason,
      });
    }
  }, [detail, startConsultation]);

  const isInitializing =
    isLoading ||
    (detail && !detail.consultation.uuid && startConsultation.isPending);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Inicializando expediente e historial clínico...
        </p>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm max-w-sm">
          <p className="text-slate-700 font-bold">Consulta no encontrada</p>
          <p className="text-xs text-slate-500 mt-1">
            No se pudo obtener el turno correspondiente en la agenda.
          </p>
          <button
            onClick={() => router.back()}
            className="text-xs text-teal-600 hover:underline font-semibold mt-4 block mx-auto"
          >
            ← Volver a la Agenda
          </button>
        </div>
      </div>
    );
  }

  const { patient, doctor, history, consultation } = detail;

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Mapear y formatear signos vitales reales
  const rawVitals = patient.latest_vital_signs;
  const formattedVitals = rawVitals
    ? {
        weight: rawVitals.weight ? `${rawVitals.weight} kg` : undefined,
        height: rawVitals.height ? `${rawVitals.height} m` : undefined,
        bloodPressure:
          rawVitals.systolic_bp && rawVitals.diastolic_bp
            ? `${rawVitals.systolic_bp}/${rawVitals.diastolic_bp} mmHg`
            : undefined,
        heartRate: rawVitals.heart_rate
          ? `${rawVitals.heart_rate} lpm`
          : undefined,
        temperature: rawVitals.temperature
          ? `${rawVitals.temperature}°C`
          : undefined,
        respiratoryRate: rawVitals.respiratory_rate
          ? `${rawVitals.respiratory_rate} rpm`
          : undefined,
        oxygenSat: rawVitals.oxygen_sat
          ? `${rawVitals.oxygen_sat}%`
          : undefined,
      }
    : undefined;

  // Lógica para guardar la consulta como Borrador / Generar Récipe
  const handleGeneratePrescription = async (data: Consultation) => {
    const activeUuid = consultation.uuid || startConsultation.data?.data?.uuid;
    if (!activeUuid) return;

    try {
      await updateConsultation.mutateAsync({
        uuid: activeUuid,
        reason: data.motivoConsulta,
        physical_exam: data.examenFisico,
        diagnosis: data.diagnostico,
        treatment_plan: data.treatment_plan || "",
        status: "in-progress",
        prescriptions: data.prescriptions,
      });
      toast.success("¡Borrador guardado correctamente!");
    } catch (err) {
      console.error("Error al guardar borrador:", err);
    }
  };

  // Lógica para finalizar definitivamente la consulta
  const handleFinalize = async (data: Consultation) => {
    const activeUuid = consultation.uuid || startConsultation.data?.data?.uuid;
    if (!activeUuid) return;

    try {
      await updateConsultation.mutateAsync({
        uuid: activeUuid,
        reason: data.motivoConsulta,
        physical_exam: data.examenFisico,
        diagnosis: data.diagnostico,
        treatment_plan: data.treatment_plan || "",
        status: "completed",
        prescriptions: data.prescriptions,
        vitals: data.vitals,
      });
      toast.success("Consulta finalizada con éxito.");
      router.push("/dashboard/appointments");
    } catch (err) {
      console.error("Error al finalizar consulta:", err);
    }
  };

  // Preparar valores iniciales (si ya hay borrador guardado)
  const defaultFormValues = {
    motivoConsulta:
      consultation.motivoConsulta || detail.appointment.reason || "",
    examenFisico: consultation.examenFisico || "",
    diagnostico: consultation.diagnostico || "",
    prescriptions: consultation.uuid
      ? detail.consultation?.prescriptions || [
          {
            medicationId: "",
            dose: "",
            frequency: "",
            duration: "",
            notes: "",
          },
        ]
      : [
          {
            medicationId: "",
            dose: "",
            frequency: "",
            duration: "",
            notes: "",
          },
        ],
    vitals: detail.consultation?.vitals || {
      weight: "",
      height: "",
      systolic_bp: "",
      diastolic_bp: "",
      heart_rate: "",
      respiratory_rate: "",
      temperature: "",
      oxygen_sat: "",
    },
  };

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 bg-white shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Consulta Clínica
          </h1>
          <p className="text-sm text-slate-500">{formattedDate}</p>
        </div>
      </div>

      {/* Main grid: Patient + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient context */}
        <div className="lg:col-span-1">
          <PatientContextCard patient={patient} vitals={formattedVitals} />
        </div>

        {/* Right: Consultation Tabs (Historial + Consulta Actual) */}
        <div className="lg:col-span-2">
          <ConsultationTabs
            historyEntries={history}
            patient={patient}
            doctor={doctor}
            defaultValues={defaultFormValues}
            medicationsCatalog={medicationsCatalog}
            isSubmitting={updateConsultation.isPending}
            onSubmit={handleFinalize}
            onGeneratePrescription={handleGeneratePrescription}
          />
        </div>
      </div>
    </motion.div>
  );
}
