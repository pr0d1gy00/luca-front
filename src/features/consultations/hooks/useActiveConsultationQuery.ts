"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export interface ActiveConsultationData {
  appointment: {
    uuid: string;
    date: string;
    time: string;
    reason: string;
    notes: string;
    type: string;
    status: string;
  };
  consultation: {
    uuid?: string;
    motivoConsulta: string;
    examenFisico: string;
    diagnostico: string;
    treatment_plan: string;
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    prescriptions?: {
      medicationId: string;
      dose: string;
      frequency: string;
      duration: string;
      notes?: string;
    }[];
    followUp?: {
      uuid?: string;
      scheduledDate: string;
      channel: "EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL";
      messageTemplate?: string | null;
    };
    servicesPerformed?: {
      providerServiceUuid: string;
      price: number;
      quantity: number;
      notes?: string;
    }[];
  };
  patient: {
    id: string;
    uuid: string;
    firstName: string;
    lastName: string;
    documentId: string;
    birthDate: Date;
    biologicalSex: "MALE" | "FEMALE" | "OTHER";
    phone: string;
    email: string;
    address: string;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContactName: string;
    emergencyContactPhone: string;
    latest_vital_signs?: {
      weight?: number;
      height?: number;
      systolic_bp?: number;
      diastolic_bp?: number;
      heart_rate?: number;
      respiratory_rate?: number;
      temperature?: number;
      oxygen_sat?: number;
    } | null;
  };
  doctor: {
    name: string;
    specialty: string;
    mpps: string;
    cm: string;
  };
  history: {
    id: string;
    date: Date;
    motivo: string;
    diagnostico: string;
    doctorName: string;
  }[];
}

export function useActiveConsultationQuery(appointmentUuid: string | null) {
  const isOnline = useOnlineStatus();
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? user?.id ?? "";

  const fetchOfflineActiveConsultation = useCallback(
    async (uuid: string): Promise<ActiveConsultationData> => {
      // 1. Cargar cita local
      const apt = await db.appointments.get(uuid);
      if (!apt) {
        throw new Error("Cita no encontrada");
      }

      // 2. Cargar paciente local
      const pat = await db.patients.get(apt.patientUuid);
      if (!pat) {
        throw new Error("Paciente no encontrado");
      }

      // 3. Obtener consulta asociada a la cita (si existe)
      const consDb = await db.consultations
        .where("appointmentUuid")
        .equals(uuid)
        .first();

      // 4. Obtener signos vitales asociados a la consulta o los más recientes del paciente
      let vitalsDb = null;
      if (consDb) {
        vitalsDb = await db.vitalSigns
          .where("consultationUuid")
          .equals(consDb.uuid)
          .first();
      }
      if (!vitalsDb) {
        const allVitals = await db.vitalSigns
          .where("patientUuid")
          .equals(pat.uuid)
          .toArray();
        allVitals.sort((a, b) => b.date.localeCompare(a.date));
        vitalsDb = allVitals[0] ?? null;
      }

      // 5. Cargar recetas locales vinculadas a la consulta
      const offlinePrescriptions: {
        medicationId: string;
        dose: string;
        frequency: string;
        duration: string;
        notes?: string;
      }[] = [];
      if (consDb) {
        const rxs = await db.prescriptions
          .where("consultationUuid")
          .equals(consDb.uuid)
          .toArray();
        for (const rx of rxs) {
          const items = await db.prescriptionItems
            .where("prescriptionUuid")
            .equals(rx.uuid)
            .toArray();
          for (const item of items) {
            offlinePrescriptions.push({
              medicationId: item.medicationUuid,
              dose: item.dose,
              frequency: item.frequency,
              duration: item.duration,
              notes: item.notes,
            });
          }
        }
      }

      // 5b. Cargar seguimiento local vinculado a la consulta
      let followUpDb = null;
      if (consDb) {
        followUpDb = await db.followUps
          .where("consultationUuid")
          .equals(consDb.uuid)
          .first();
      }

      // 6. Cargar historial clínico local (consultas anteriores del paciente)
      const allConsultations = await db.consultations
        .where("patientUuid")
        .equals(pat.uuid)
        .toArray();
      // Filtrar la consulta activa actual para que no se muestre en su propio historial
      const pastConsultations = allConsultations.filter(
        (c) => c.appointmentUuid !== uuid,
      );
      pastConsultations.sort((a, b) => b.date.localeCompare(a.date));

      const history = [];
      for (const c of pastConsultations) {
        history.push({
          id: c.uuid,
          date: new Date(c.date),
          motivo: c.reason,
          diagnostico: c.diagnosis,
          doctorName: "Dr. Ricardo García", // fallback offline
        });
      }

      // 6. Traducir datos de paciente
      const parseAllergies = (allergiesStr: string) => {
        if (!allergiesStr) return [];
        try {
          return allergiesStr.includes("[")
            ? JSON.parse(allergiesStr)
            : allergiesStr.split(",").map((s) => s.trim());
        } catch {
          return allergiesStr.split(",").map((s) => s.trim());
        }
      };

      const parseChronic = (chronicStr: string) => {
        if (!chronicStr) return [];
        try {
          return chronicStr.includes("[")
            ? JSON.parse(chronicStr)
            : chronicStr.split(",").map((s) => s.trim());
        } catch {
          return chronicStr.split(",").map((s) => s.trim());
        }
      };

      return {
        appointment: {
          uuid: apt.uuid,
          date: apt.date,
          time: apt.time,
          reason: apt.reason,
          notes: apt.notes,
          type: apt.type,
          status: apt.status.toLowerCase(),
        },
        consultation: consDb
          ? {
              uuid: consDb.uuid,
              motivoConsulta: consDb.reason || "",
              examenFisico: consDb.physicalExam || "",
              diagnostico: consDb.diagnosis || "",
              treatment_plan: consDb.treatmentPlan || "",
              status: consDb.status,
              prescriptions: offlinePrescriptions,
              vitals: vitalsDb
                ? {
                    weight: vitalsDb.weight?.toString() || "",
                    height: vitalsDb.height?.toString() || "",
                    systolic_bp: vitalsDb.systolicBp?.toString() || "",
                    diastolic_bp: vitalsDb.diastolicBp?.toString() || "",
                    heart_rate: vitalsDb.heartRate?.toString() || "",
                    respiratory_rate:
                      vitalsDb.respiratoryRate?.toString() || "",
                    temperature: vitalsDb.temperature?.toString() || "",
                    oxygen_sat: vitalsDb.oxygenSat?.toString() || "",
                  }
                : undefined,
              followUp: followUpDb
                ? {
                    uuid: followUpDb.uuid,
                    scheduledDate: followUpDb.scheduledDate,
                    channel: followUpDb.channel,
                    messageTemplate: followUpDb.messageTemplate,
                  }
                : undefined,
              servicesPerformed:
                (consDb as { servicesPerformed?: unknown[] })
                  .servicesPerformed || [],
            }
          : {
              motivoConsulta: apt.reason || "",
              examenFisico: "",
              diagnostico: "",
              treatment_plan: "",
              status: "IN_PROGRESS",
              prescriptions: [],
              servicesPerformed: [],
            },
        patient: {
          id: pat.uuid,
          uuid: pat.uuid,
          firstName: pat.firstName,
          lastName: pat.lastName,
          documentId: pat.nationalId,
          birthDate: new Date(pat.birthDate),
          biologicalSex:
            (pat.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER") ||
            "OTHER",
          phone: pat.phone,
          email: pat.email,
          address: pat.address,
          bloodType: pat.bloodType,
          allergies: parseAllergies(pat.allergies),
          chronicConditions: parseChronic(pat.chronicConditions),
          emergencyContactName: pat.emergencyContactName,
          emergencyContactPhone: pat.emergencyContactPhone,
          latest_vital_signs: vitalsDb
            ? {
                weight: vitalsDb.weight ?? undefined,
                height: vitalsDb.height ?? undefined,
                systolic_bp: vitalsDb.systolicBp ?? undefined,
                diastolic_bp: vitalsDb.diastolicBp ?? undefined,
                heart_rate: vitalsDb.heartRate ?? undefined,
                respiratory_rate: vitalsDb.respiratoryRate ?? undefined,
                temperature: vitalsDb.temperature ?? undefined,
                oxygen_sat: vitalsDb.oxygenSat ?? undefined,
              }
            : null,
        },
        doctor: {
          name: "Dr. Ricardo García",
          specialty: "Medicina General",
          mpps: "MPPS-12345",
          cm: "CM-67890",
        },
        history,
      };
    },
    [],
  );

  return useQuery({
    queryKey: ["active-consultation", appointmentUuid],
    queryFn: async (): Promise<ActiveConsultationData> => {
      if (!appointmentUuid) {
        throw new Error("UUID de cita requerido");
      }

      if (!isOnline) {
        return fetchOfflineActiveConsultation(appointmentUuid);
      }

      try {
        // 1. Obtener cita y consulta asociada
        const { data: aptRes } = await apiClient.get(
          `/appointments/${appointmentUuid}`,
        );
        const apt = aptRes.data;

        // 2. Obtener historial clínico del paciente
        const { data: histRes } = await apiClient.get("/consultations", {
          params: {
            patient_uuid: apt.patient?.uuid,
          },
        });

        interface ApiHistoryConsultation {
          uuid: string;
          reason?: string;
          diagnosis?: string;
          date?: string;
          created_at?: string;
          user?: {
            full_name?: string;
          };
        }

        const consultations: ApiHistoryConsultation[] =
          histRes?.data?.data ?? histRes?.data ?? [];

        // Mapear historial clínico
        const history = consultations
          .filter((c) => c.uuid !== apt.consultation?.uuid) // descartar la actual si ya existe
          .map((c) => ({
            id: c.uuid,
            date: new Date(c.date || c.created_at || new Date()),
            motivo: c.reason || "",
            diagnostico: c.diagnosis || "",
            doctorName: c.user?.full_name || "Dr. Ricardo García",
          }));

        const patientData = apt.patient;

        // Parsear arrays de alergias y crónicas
        const parseAllergies = (allergies: unknown) => {
          if (!allergies) return [];
          if (Array.isArray(allergies)) return allergies;
          try {
            return typeof allergies === "string" && allergies.includes("[")
              ? JSON.parse(allergies)
              : String(allergies)
                  .split(",")
                  .map((s) => s.trim());
          } catch {
            return String(allergies)
              .split(",")
              .map((s) => s.trim());
          }
        };

        const parseChronic = (chronic: unknown) => {
          if (!chronic) return [];
          if (Array.isArray(chronic)) return chronic;
          try {
            return typeof chronic === "string" && chronic.includes("[")
              ? JSON.parse(chronic)
              : String(chronic)
                  .split(",")
                  .map((s) => s.trim());
          } catch {
            return String(chronic)
              .split(",")
              .map((s) => s.trim());
          }
        };

        return {
          appointment: {
            uuid: apt.uuid,
            date: apt.date,
            time: apt.time,
            reason: apt.reason || "",
            notes: apt.notes || "",
            type: apt.type,
            status: apt.status.toLowerCase(),
          },
          consultation: apt.consultation
            ? {
                uuid: apt.consultation.uuid,
                motivoConsulta: apt.consultation.reason || "",
                examenFisico: apt.consultation.physical_exam || "",
                diagnostico: apt.consultation.diagnosis || "",
                treatment_plan: apt.consultation.treatment_plan || "",
                status: apt.consultation.status,
                prescriptions:
                  apt.consultation.prescription?.items?.map(
                    (item: {
                      medication?: { uuid?: string };
                      dose?: string;
                      frequency?: string;
                      duration?: string;
                      notes?: string;
                    }) => ({
                      medicationId: item.medication?.uuid || "",
                      dose: item.dose || "",
                      frequency: item.frequency || "",
                      duration: item.duration || "",
                      notes: item.notes || "",
                    }),
                  ) || [],
                vitals:
                  apt.consultation.vital_sign || apt.consultation.vitalSign
                    ? {
                        weight:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).weight?.toString() || "",
                        height:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).height?.toString() || "",
                        systolic_bp:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).systolic_bp?.toString() || "",
                        diastolic_bp:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).diastolic_bp?.toString() || "",
                        heart_rate:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).heart_rate?.toString() || "",
                        respiratory_rate:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).respiratory_rate?.toString() || "",
                        temperature:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).temperature?.toString() || "",
                        oxygen_sat:
                          (
                            apt.consultation.vital_sign ||
                            apt.consultation.vitalSign
                          ).oxygen_sat?.toString() || "",
                      }
                    : undefined,
                followUp: (apt.consultation.follow_ups ||
                  apt.consultation.followUps)?.[0]
                  ? {
                      uuid: (apt.consultation.follow_ups ||
                        apt.consultation.followUps)[0].uuid,
                      scheduledDate: (apt.consultation.follow_ups ||
                        apt.consultation.followUps)[0].scheduled_date,
                      channel: (apt.consultation.follow_ups ||
                        apt.consultation.followUps)[0].channel,
                      messageTemplate: (apt.consultation.follow_ups ||
                        apt.consultation.followUps)[0].message_template,
                    }
                  : undefined,
                servicesPerformed:
                  apt.consultation.services_performed ||
                  apt.consultation.servicesPerformed ||
                  [],
              }
            : {
                motivoConsulta: apt.reason || "",
                examenFisico: "",
                diagnostico: "",
                treatment_plan: "",
                status: "IN_PROGRESS",
                servicesPerformed: [],
              },
          patient: {
            id: patientData?.uuid,
            uuid: patientData?.uuid,
            firstName: patientData?.first_name || "Paciente",
            lastName: patientData?.last_name || "",
            documentId: patientData?.national_id || "",
            birthDate: new Date(patientData?.birth_date || new Date()),
            biologicalSex: patientData?.gender || "OTHER",
            phone: patientData?.phone || "",
            email: patientData?.email || "",
            address: patientData?.address || "",
            bloodType: patientData?.blood_type || "",
            allergies: parseAllergies(patientData?.allergies),
            chronicConditions: parseChronic(patientData?.chronic_conditions),
            emergencyContactName: patientData?.emergency_contact_name || "",
            emergencyContactPhone: patientData?.emergency_contact_phone || "",
            latest_vital_signs: patientData?.latest_vital_signs,
          },
          doctor: {
            name: apt.doctor?.full_name || "Dr. Ricardo García",
            specialty: apt.doctor?.specialties?.[0]?.name || "Medicina General",
            mpps: apt.doctor?.mpps || "MPPS-12345",
            cm: apt.doctor?.cm || "CM-67890",
          },
          history,
        };
      } catch (err) {
        console.warn(
          "[useActiveConsultationQuery] Failed online query, falling back to Dexie",
          err,
        );
        return fetchOfflineActiveConsultation(appointmentUuid);
      }
    },
    enabled: !!appointmentUuid && !!doctorUuid,
    staleTime: 10 * 1000,
  });
}
