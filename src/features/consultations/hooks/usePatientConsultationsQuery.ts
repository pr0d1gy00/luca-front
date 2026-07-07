"use client";

import { useQuery } from "@tanstack/react-query";
import { patientConsultationApi } from "../api/patientConsultationApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export const patientConsultationKeys = {
  all: ["patient-consultations"] as const,
  list: (page: number) =>
    [...patientConsultationKeys.all, "list", page] as const,
};

export function usePatientConsultationsQuery(page: number = 1) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  const fetchOfflineConsultations = useCallback(
    async (pageNumber: number) => {
      if (!patientUuid) {
        return {
          current_page: pageNumber,
          data: [],
          last_page: 1,
          per_page: 20,
          total: 0,
        };
      }

      try {
        // 1. Obtener todas las consultas locales
        const allLocal = await db.consultations.toArray();

        // 2. Filtrar por el paciente actual
        const patientConsults = allLocal.filter(
          (c) => c.patientUuid === patientUuid,
        );

        // 3. Ordenar por fecha descendente
        patientConsults.sort((a, b) => b.date.localeCompare(a.date));

        // 4. Paginar localmente (20 por página)
        const perPage = 20;
        const total = patientConsults.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = patientConsults.slice(
          startIndex,
          startIndex + perPage,
        );

        // Para cada consulta offline, cargamos también sus relaciones locales
        const mappedData = await Promise.all(
          pagedData.map(async (c) => {
            // Buscar signos vitales locales para la consulta
            const vital = await db.vitalSigns
              .where("consultationUuid")
              .equals(c.uuid)
              .first();

            return {
              id: c.uuid,
              uuid: c.uuid,
              date: c.date,
              status: c.status,
              reason: c.reason,
              physical_exam: c.physicalExam,
              diagnosis: c.diagnosis,
              treatment_plan: c.treatmentPlan,
              dynamic_data: c.dynamicData,
              // Relación simulada del médico para offline
              user: (c as unknown as Record<string, unknown>).user ?? {
                full_name: "Médico de Guardia",
                specialties: [{ name: "Medicina General" }],
              },
              vital_sign: vital
                ? {
                    id: vital.uuid,
                    uuid: vital.uuid,
                    systolic_bp: vital.systolicBp,
                    diastolic_bp: vital.diastolicBp,
                    heart_rate: vital.heartRate,
                    temperature: vital.temperature,
                    oxygen_sat: vital.oxygenSat,
                    date: vital.date,
                  }
                : null,
            };
          }),
        );

        return {
          current_page: pageNumber,
          data: mappedData,
          last_page: lastPage,
          per_page: perPage,
          total: total,
        };
      } catch (err) {
        console.error(
          "[usePatientConsultationsQuery] Offline load failed:",
          err,
        );
        return {
          current_page: pageNumber,
          data: [],
          last_page: 1,
          per_page: 20,
          total: 0,
        };
      }
    },
    [patientUuid],
  );

  return useQuery({
    queryKey: patientConsultationKeys.list(page),
    queryFn: async () => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        return fetchOfflineConsultations(page);
      }

      try {
        const response =
          await patientConsultationApi.getPatientConsultations(page);
        const paginated = response as Record<string, unknown>;
        const rawArray =
          (paginated?.data?.data as unknown[]) ||
          (paginated?.data as unknown[]) ||
          [];

        // Guardar las consultas descargadas en Dexie
        if (rawArray.length > 0) {
          for (const rawConsult of rawArray) {
            const consult = rawConsult as Record<string, unknown>;
            const consultUuid = String(consult.uuid ?? consult.id ?? "");

            await db.consultations.put({
              uuid: consultUuid,
              patientUuid: String(
                consult.patient_id ?? consult.patientUuid ?? patientUuid,
              ),
              doctorUuid: String(consult.user_id ?? consult.doctorUuid ?? ""),
              clinicBranchUuid: consult.clinic_branch_id
                ? String(consult.clinic_branch_id)
                : "",
              appointmentUuid: consult.appointment_id
                ? String(consult.appointment_id)
                : null,
              formTemplateUuid: consult.form_template_id
                ? String(consult.form_template_id)
                : null,
              date: String(consult.date ?? ""),
              status: String(consult.status ?? "COMPLETED").toUpperCase() as
                | "IN_PROGRESS"
                | "COMPLETED"
                | "CANCELLED",
              reason: String(consult.reason ?? ""),
              physicalExam: String(
                consult.physical_exam ?? consult.physicalExam ?? "",
              ),
              diagnosis: String(consult.diagnosis ?? ""),
              treatmentPlan: String(
                consult.treatment_plan ?? consult.treatmentPlan ?? "",
              ),
              dynamicData: (consult.dynamic_data ??
                consult.dynamicData ??
                {}) as Record<string, unknown>,
            });

            // Guardar también los signos vitales si vienen en la respuesta
            if (consult.vital_sign || consult.vitalSign) {
              const vital = (consult.vital_sign ?? consult.vitalSign) as Record<
                string,
                unknown
              >;
              await db.vitalSigns.put({
                uuid: String(vital.uuid ?? vital.id ?? ""),
                patientUuid: String(vital.patient_id ?? patientUuid),
                consultationUuid: consultUuid,
                weight: vital.weight ? Number(vital.weight) : null,
                height: vital.height ? Number(vital.height) : null,
                systolicBp: vital.systolic_bp
                  ? Number(vital.systolic_bp)
                  : null,
                diastolicBp: vital.diastolic_bp
                  ? Number(vital.diastolic_bp)
                  : null,
                heartRate: vital.heart_rate ? Number(vital.heart_rate) : null,
                temperature: vital.temperature
                  ? Number(vital.temperature)
                  : null,
                oxygenSat:
                  (vital.oxygen_sat ?? vital.oxygenSat)
                    ? Number(vital.oxygen_sat ?? vital.oxygenSat)
                    : null,
                respiratoryRate: vital.respiratory_rate
                  ? Number(vital.respiratory_rate)
                  : null,
                date: String(vital.date ?? consult.date ?? ""),
              });
            }
          }
        }

        return paginated?.data || paginated;
      } catch (error) {
        console.warn(
          "[usePatientConsultationsQuery] Server fetch failed. Falling back to local cache.",
          error,
        );
        return fetchOfflineConsultations(page);
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!patientUuid,
  });
}
