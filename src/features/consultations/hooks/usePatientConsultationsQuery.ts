"use client";

import { useQuery } from "@tanstack/react-query";
import { patientConsultationApi } from "../api/patientConsultationApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export const patientConsultationKeys = {
  all: ["patient-consultations"] as const,
  list: (page: number, search?: string, specialty?: string) =>
    [
      ...patientConsultationKeys.all,
      "list",
      page,
      { search, specialty },
    ] as const,
};

export function usePatientConsultationsQuery(
  page: number = 1,
  search: string = "",
  specialty: string = "",
) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  const fetchOfflineConsultations = useCallback(
    async (pageNumber: number, offSearch: string, offSpecialty: string) => {
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

        // Map para simular la estructura de especialidades e información del doctor
        let consultsWithDocs = await Promise.all(
          patientConsults.map(async (c) => {
            // Buscar signos vitales locales para la consulta
            const vital = await db.vitalSigns
              .where("consultationUuid")
              .equals(c.uuid)
              .first();

            // Buscar si ya tiene datos de user offline
            const mappedUser = (c as unknown as Record<string, unknown>)
              .user as Record<string, unknown> | undefined;

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
              user: mappedUser ?? {
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

        // 3. Aplicar Filtro de Especialidad Offline
        if (offSpecialty) {
          const specQuery = offSpecialty.toLowerCase();
          consultsWithDocs = consultsWithDocs.filter((c) => {
            const specs = (c.user as Record<string, unknown>)?.specialties as
              | Array<Record<string, unknown>>
              | undefined;
            const hasMatch = specs?.some((s) =>
              String(s.name || "")
                .toLowerCase()
                .includes(specQuery),
            );
            return !!hasMatch;
          });
        }

        // 4. Aplicar Filtro de Búsqueda Offline (Texto en diagnóstico, motivo o nombre médico)
        if (offSearch) {
          const searchQuery = offSearch.toLowerCase();
          consultsWithDocs = consultsWithDocs.filter((c) => {
            const diag = String(c.diagnosis || "").toLowerCase();
            const reas = String(c.reason || "").toLowerCase();
            const docName = String(
              (c.user as Record<string, unknown>)?.full_name ||
                (c.user as Record<string, unknown>)?.fullName ||
                "",
            ).toLowerCase();

            return (
              diag.includes(searchQuery) ||
              reas.includes(searchQuery) ||
              docName.includes(searchQuery)
            );
          });
        }

        // 5. Ordenar por fecha descendente
        consultsWithDocs.sort((a, b) => b.date.localeCompare(a.date));

        // 6. Paginar localmente (20 por página)
        const perPage = 20;
        const total = consultsWithDocs.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = consultsWithDocs.slice(
          startIndex,
          startIndex + perPage,
        );

        return {
          current_page: pageNumber,
          data: pagedData,
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
    queryKey: patientConsultationKeys.list(page, search, specialty),
    queryFn: async () => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        return fetchOfflineConsultations(page, search, specialty);
      }

      try {
        const response = await patientConsultationApi.getPatientConsultations(
          page,
          search,
          specialty,
        );
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

            // Conservamos la relación 'user' para la consulta guardándola como metadata
            // para que esté disponible offline
            const consultUser = consult.user || {};

            const offlineConsultRecord = {
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
              // Atributo dinámico guardado para persistir datos de médico offline
              user: consultUser,
            };

            await db.consultations.put(
              offlineConsultRecord as unknown as Parameters<
                typeof db.consultations.put
              >[0],
            );

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
        return fetchOfflineConsultations(page, search, specialty);
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!patientUuid,
  });
}
