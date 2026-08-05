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
import { db } from "@/features/offline/database/schema";
import { queueService } from "@/features/offline/services/queueService";
import { labRequestOfflineService } from "@/features/labs/services/labRequestOfflineService";
import { labRequestApi } from "@/features/labs/api/labRequestApi";

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: detail, isPending, isError } = useActiveConsultationQuery(id);
  const startConsultation = useStartConsultation();
  const updateConsultation = useUpdateConsultation();
  const { data: medicationsCatalog } = useMedicationsCatalog();
  const router = useRouter();
  const hasTriggeredInit = useRef(false);
  console.log("Details", detail);
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
    isPending ||
    (detail && !detail.consultation.uuid && startConsultation.isPending);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 text-pharmako-care animate-spin" />
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

  const syncLabRequests = async (activeUuid: string, data: Consultation) => {
    const finalLabs = [...(data.laboratorios || [])];
    const existingLabs = await db.labRequests
      .where("consultationUuid")
      .equals(activeUuid)
      .toArray();

    const isOnline =
      typeof window !== "undefined" ? window.navigator.onLine : false;

    // Delete removed ones
    const finalLabUuids = new Set(
      finalLabs.map((l: { uuid?: string }) => l.uuid).filter(Boolean),
    );
    for (const ex of existingLabs) {
      if (!finalLabUuids.has(ex.uuid)) {
        if (isOnline) {
          try {
            await labRequestApi.delete(ex.uuid);
            await labRequestOfflineService.deleteLocal(ex.uuid);
          } catch {
            await labRequestOfflineService.delete(ex.uuid);
          }
        } else {
          await labRequestOfflineService.delete(ex.uuid);
        }
      }
    }

    // Create or update
    for (let i = 0; i < finalLabs.length; i++) {
      const lab = finalLabs[i];
      if (lab.uuid) {
        const ex = existingLabs.find((x) => x.uuid === lab.uuid);
        if (ex) {
          // Update
          if (isOnline) {
            try {
              const res = await labRequestApi.update({
                uuid: lab.uuid,
                examsList: lab.examsList,
                instructions: lab.instructions || "",
              });
              await labRequestOfflineService.saveLocalSynced(res.data);
              finalLabs[i] = {
                ...lab,
                uuid: res.data.uuid,
                _syncStatus: "synced",
              };
            } catch {
              await labRequestOfflineService.update(lab.uuid, {
                examsList: lab.examsList,
                instructions: lab.instructions || "",
              });
            }
          } else {
            await labRequestOfflineService.update(lab.uuid, {
              examsList: lab.examsList,
              instructions: lab.instructions || "",
            });
          }
        } else {
          // Create
          if (isOnline) {
            try {
              const res = await labRequestApi.create({
                uuid: lab.uuid,
                patientUuid: patient.uuid,
                consultationUuid: activeUuid,
                examsList: lab.examsList,
                instructions: lab.instructions || "",
                isCompleted: false,
              });
              await labRequestOfflineService.saveLocalSynced(res.data);
              finalLabs[i] = {
                ...lab,
                uuid: res.data.uuid,
                _syncStatus: "synced",
              };
            } catch {
              const now = new Date().toISOString();
              const labRecord = {
                uuid: lab.uuid,
                patientUuid: patient.uuid,
                doctorUuid: doctor.uuid || "",
                consultationUuid: activeUuid,
                examsList: lab.examsList,
                instructions: lab.instructions || "",
                isCompleted: false,
                createdAt: now,
                updatedAt: now,
                _syncStatus: "pending" as const,
              };
              await db.labRequests.put(labRecord);
              await queueService.enqueue("lab_requests", "create", labRecord);
            }
          } else {
            const now = new Date().toISOString();
            const labRecord = {
              uuid: lab.uuid,
              patientUuid: patient.uuid,
              doctorUuid: doctor.uuid || "",
              consultationUuid: activeUuid,
              examsList: lab.examsList,
              instructions: lab.instructions || "",
              isCompleted: false,
              createdAt: now,
              updatedAt: now,
              _syncStatus: "pending" as const,
            };
            await db.labRequests.put(labRecord);
            await queueService.enqueue("lab_requests", "create", labRecord);
          }
        }
      }
    }

    return finalLabs;
  };

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
        follow_up: data.followUp
          ? {
              uuid: data.followUp.uuid,
              scheduled_date: data.followUp.scheduledDate,
              channel: data.followUp.channel,
              message_template: data.followUp.messageTemplate || null,
            }
          : null,
        services_performed: data.servicesPerformed?.map((s) => ({
          providerServiceUuid: s.providerServiceUuid,
          price: s.price,
          quantity: s.quantity,
          notes: s.notes,
        })),
      });
      const updatedLabs = await syncLabRequests(activeUuid, data);
      toast.success("¡Borrador guardado correctamente!");
      return { laboratorios: updatedLabs };
    } catch (err) {
      console.error("Error al guardar borrador:", err);
      throw err;
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
        follow_up: data.followUp
          ? {
              uuid: data.followUp.uuid,
              scheduled_date: data.followUp.scheduledDate,
              channel: data.followUp.channel,
              message_template: data.followUp.messageTemplate || null,
            }
          : null,
        services_performed: data.servicesPerformed?.map((s) => ({
          providerServiceUuid: s.providerServiceUuid,
          price: s.price,
          quantity: s.quantity,
          notes: s.notes,
          attachments: s.attachments || [],
        })),
      });
      await syncLabRequests(activeUuid, data);

      const totalInvoice =
        50 +
        (data.servicesPerformed || []).reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      toast.success("Consulta finalizada con éxito.", {
        description: `Factura Interna Nº LUCA-${activeUuid.slice(0, 6).toUpperCase()} emitida (Total: ${totalInvoice.toFixed(2)} USD).`,
        duration: 6000,
      });
      router.push("/dashboard/appointments");
    } catch (err) {
      console.error("Error al finalizar consulta:", err);
    }
  };
  console.log(consultation);
  // Preparar valores iniciales (si ya hay borrador guardado)
  const defaultFormValues = {
    uuid: consultation.uuid || startConsultation.data?.data?.uuid || "",
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
    followUp: detail.consultation?.followUp || undefined,
    servicesPerformed:
      (
        detail.consultation as {
          services_performed?: unknown[];
          servicesPerformed?: unknown[];
        }
      )?.services_performed ||
      (
        detail.consultation as {
          services_performed?: unknown[];
          servicesPerformed?: unknown[];
        }
      )?.servicesPerformed ||
      [],
  };
  console.log(defaultFormValues);
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto py-6"
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
