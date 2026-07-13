"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { useAuthStore } from "@/store/auth";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface StartConsultationPayload {
  patientUuid: string;
  appointmentUuid?: string;
  reason?: string;
}

interface UpdateConsultationPayload {
  uuid: string;
  reason?: string;
  physical_exam?: string;
  diagnosis?: string;
  treatment_plan?: string;
  status: "in-progress" | "completed" | "cancelled";
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
  follow_up?: {
    uuid?: string;
    scheduled_date: string;
    channel: "EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL";
    message_template?: string | null;
  } | null;
}

export function useStartConsultation() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: StartConsultationPayload) => {
      if (!isOnline) {
        // Flujo Offline: Guardar en Dexie
        const uuid = uuidv4();
        const dateStr = new Date().toISOString();

        // Obtener datos del médico logueado
        const doctorUuid = user?.uuid ?? user?.id ?? "";

        // Obtener cita para heredar clínica
        let clinicBranchUuid = "";
        if (payload.appointmentUuid) {
          const apt = await db.appointments.get(payload.appointmentUuid);
          if (apt) {
            clinicBranchUuid = apt.clinicBranchUuid;
            // Marcar cita local como in-progress
            await db.appointments.update(payload.appointmentUuid, {
              status: "IN_PROGRESS",
            });
          }
        }

        const consultationRecord = {
          uuid,
          patientUuid: payload.patientUuid,
          doctorUuid,
          clinicBranchUuid,
          appointmentUuid: payload.appointmentUuid || null,
          formTemplateUuid: null,
          date: dateStr,
          status: "IN_PROGRESS" as const,
          reason: payload.reason || "",
          physicalExam: "",
          diagnosis: "",
          treatmentPlan: "",
          dynamicData: {},
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created" as const,
        };

        await db.consultations.add(consultationRecord);

        // Encolar cambio para sincronización
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "consultations",
          entityUuid: uuid,
          action: "CREATE",
          payload: JSON.stringify(payload),
          timestamp: Date.now(),
        });

        return { data: consultationRecord };
      }

      // Flujo Online: API
      const { data } = await apiClient.post("/consultations", {
        patient_uuid: payload.patientUuid,
        appointment_uuid: payload.appointmentUuid,
        reason: payload.reason,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["active-consultation", variables.appointmentUuid],
      });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    },
    onError: (error: any) => {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al iniciar la consulta";
      toast.error("Error al iniciar consulta", { description: serverMessage });
    },
  });
}

export function useUpdateConsultation() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateConsultationPayload) => {
      if (!isOnline) {
        // Flujo Offline: Modificar en Dexie
        const existing = await db.consultations.get(payload.uuid);
        if (!existing)
          throw new Error("Consulta no encontrada en base de datos local");

        const dateStr = new Date().toISOString();
        const updatedRecord = {
          ...existing,
          reason: payload.reason ?? existing.reason,
          physicalExam: payload.physical_exam ?? existing.physicalExam,
          diagnosis: payload.diagnosis ?? existing.diagnosis,
          treatmentPlan: payload.treatment_plan ?? existing.treatmentPlan,
          status:
            (payload.status?.toUpperCase() as
              | "IN_PROGRESS"
              | "COMPLETED"
              | "CANCELLED") ?? existing.status,
          updatedAt: dateStr,
          _syncStatus:
            existing._syncStatus === "created"
              ? ("created" as const)
              : ("updated" as const),
        };

        await db.consultations.put(updatedRecord);

        // Si se marca completed, actualizar cita local asociada
        if (payload.status === "completed" && existing.appointmentUuid) {
          await db.appointments.update(existing.appointmentUuid, {
            status: "COMPLETED",
          });
        }

        // Guardar signos vitales localmente en Dexie si vienen
        if (payload.vitals) {
          await db.vitalSigns
            .where("consultationUuid")
            .equals(payload.uuid)
            .delete();
          await db.vitalSigns.add({
            uuid: uuidv4(),
            patientUuid: existing.patientUuid,
            consultationUuid: payload.uuid,
            weight: payload.vitals.weight
              ? parseFloat(payload.vitals.weight)
              : null,
            height: payload.vitals.height
              ? parseFloat(payload.vitals.height)
              : null,
            systolicBp: payload.vitals.systolic_bp
              ? parseInt(payload.vitals.systolic_bp)
              : null,
            diastolicBp: payload.vitals.diastolic_bp
              ? parseInt(payload.vitals.diastolic_bp)
              : null,
            heartRate: payload.vitals.heart_rate
              ? parseInt(payload.vitals.heart_rate)
              : null,
            respiratoryRate: payload.vitals.respiratory_rate
              ? parseFloat(payload.vitals.respiratory_rate)
              : null,
            temperature: payload.vitals.temperature
              ? parseFloat(payload.vitals.temperature)
              : null,
            oxygenSat: payload.vitals.oxygen_sat
              ? parseInt(payload.vitals.oxygen_sat)
              : null,
            date: dateStr,
            updatedAt: dateStr,
            _syncStatus: "created",
          });
        }

        // Guardar seguimiento localmente en Dexie si viene
        if (payload.follow_up) {
          await db.followUps
            .where("consultationUuid")
            .equals(payload.uuid)
            .delete();
          await db.followUps.add({
            uuid: payload.follow_up.uuid || uuidv4(),
            patientUuid: existing.patientUuid,
            consultationUuid: payload.uuid,
            scheduledDate: payload.follow_up.scheduled_date,
            channel: payload.follow_up.channel,
            messageTemplate: payload.follow_up.message_template || null,
            status: "PENDING",
            response: null,
            updatedAt: dateStr,
            _syncStatus: "created",
          });
        } else if (payload.follow_up === null) {
          await db.followUps
            .where("consultationUuid")
            .equals(payload.uuid)
            .delete();
        }

        // Guardar recetas localmente en Dexie si vienen
        if (payload.prescriptions && payload.prescriptions.length > 0) {
          // Eliminar anteriores
          const oldRxs = await db.prescriptions
            .where("consultationUuid")
            .equals(payload.uuid)
            .toArray();
          for (const rx of oldRxs) {
            await db.prescriptionItems
              .where("prescriptionUuid")
              .equals(rx.uuid)
              .delete();
            await db.prescriptions.delete(rx.uuid);
          }

          // Crear cabecera de receta
          const rxUuid = uuidv4();
          await db.prescriptions.add({
            uuid: rxUuid,
            patientUuid: existing.patientUuid,
            doctorUuid: existing.doctorUuid,
            consultationUuid: existing.uuid,
            clinicBranchUuid: existing.clinicBranchUuid,
            date: dateStr,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            notes: payload.treatment_plan || "",
            status: "ACTIVE",
            updatedAt: dateStr,
            _syncStatus: "created",
          });

          for (const item of payload.prescriptions) {
            await db.prescriptionItems.add({
              uuid: uuidv4(),
              prescriptionUuid: rxUuid,
              medicationUuid: item.medicationId,
              dose: item.dose,
              frequency: item.frequency,
              duration: item.duration,
              notes: item.notes || "",
              updatedAt: dateStr,
              _syncStatus: "created",
            });
          }
        }

        // Registrar acción de actualización en cola de sincronización
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "consultations",
          entityUuid: payload.uuid,
          action: "UPDATE",
          payload: JSON.stringify(payload),
          timestamp: Date.now(),
        });

        return { data: updatedRecord };
      }

      // Flujo Online: API
      const { data } = await apiClient.put(`/consultations/${payload.uuid}`, {
        reason: payload.reason,
        physical_exam: payload.physical_exam,
        diagnosis: payload.diagnosis,
        treatment_plan: payload.treatment_plan,
        status: payload.status,
        prescriptions: payload.prescriptions,
        vitals: payload.vitals,
        follow_up: payload.follow_up,
      });
      return data;
    },
    onSuccess: (data) => {
      const consultation = data?.data ?? data;
      queryClient.invalidateQueries({
        queryKey: [
          "active-consultation",
          consultation.appointment_id || consultation.appointment_uuid,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    },
    onError: (error: any) => {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al actualizar la consulta";
      toast.error("Error al actualizar consulta", {
        description: serverMessage,
      });
    },
  });
}

export function useCreateFollowUp() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      uuid?: string;
      patientUuid: string;
      consultationUuid?: string | null;
      scheduledDate: string;
      channel: "EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL";
      messageTemplate?: string | null;
    }) => {
      const uuid = payload.uuid || uuidv4();
      const dateStr = new Date().toISOString();
      const doctorUuid = user?.uuid ?? user?.id ?? "";

      if (!isOnline) {
        // Modo Offline: Guardar en Dexie
        await db.followUps.add({
          uuid,
          patientUuid: payload.patientUuid,
          consultationUuid: payload.consultationUuid || "",
          scheduledDate: payload.scheduledDate,
          channel: payload.channel,
          messageTemplate: payload.messageTemplate || null,
          status: "PENDING",
          response: null,
          updatedAt: dateStr,
          _syncStatus: "created",
        });

        // Encolar acción CREATE en syncQueue
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "follow_ups",
          entityUuid: uuid,
          action: "CREATE",
          payload: JSON.stringify({
            uuid,
            patient_uuid: payload.patientUuid,
            consultation_uuid: payload.consultationUuid || null,
            scheduled_date: payload.scheduledDate,
            channel: payload.channel,
            message_template: payload.messageTemplate || null,
            status: "PENDING",
          }),
          timestamp: Date.now(),
        });

        return { data: { uuid, status: "PENDING" }, offline: true };
      }

      // Modo Online: API del servidor
      const { data } = await apiClient.post("/follow-ups", {
        uuid,
        patient_uuid: payload.patientUuid,
        consultation_uuid: payload.consultationUuid || null,
        scheduled_date: payload.scheduledDate,
        channel: payload.channel,
        message_template: payload.messageTemplate || null,
        status: "PENDING",
      });
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success("Seguimiento programado con éxito");
    },
    onError: (err: any) => {
      console.error("[useCreateFollowUp] Error:", err);
      toast.error("No se pudo agendar el seguimiento");
    },
  });
}
