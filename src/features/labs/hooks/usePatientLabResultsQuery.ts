"use client";

import { useQuery } from "@tanstack/react-query";
import { patientLabApi } from "../api/patientLabApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export const patientLabKeys = {
  all: ["patient-lab-results"] as const,
  list: (page: number, search?: string, status?: string) =>
    [...patientLabKeys.all, "list", page, { search, status }] as const,
};

export function usePatientLabResultsQuery(
  page: number = 1,
  search: string = "",
  status: string = "",
) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  const fetchOfflineLabResults = useCallback(
    async (pageNumber: number, offSearch: string, offStatus: string) => {
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
        // Query de base de datos local en Dexie usando el índice de patientUuid
        let localData = await db.labResults
          .where("patientUuid")
          .equals(patientUuid)
          .toArray();

        // Filtro de base de datos local por estado si está presente
        if (offStatus) {
          localData = localData.filter((item) => item.status === offStatus);
        }

        // Búsqueda simple por texto offline
        if (offSearch) {
          const queryTerm = offSearch.toLowerCase();
          localData = localData.filter((item) => {
            const notesText = String(item.notes || "").toLowerCase();
            return notesText.includes(queryTerm);
          });
        }

        // Ordenar por fecha descendente
        localData.sort((a, b) => b.performedAt.localeCompare(a.performedAt));

        // Paginar
        const perPage = 20;
        const total = localData.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = localData.slice(startIndex, startIndex + perPage);

        // Mapear al contrato esperado
        const mappedData = await Promise.all(
          pagedData.map(async (r) => {
            // Buscar la solicitud de laboratorio asociada
            const request = await db.labRequests
              .where("uuid")
              .equals(r.labRequestUuid)
              .first();

            return {
              id: r.uuid,
              uuid: r.uuid,
              file_url: r.fileUrl,
              result_json: r.resultJson,
              notes: r.notes,
              status: r.status,
              performed_at: r.performedAt,
              reviewed_at: r.reviewedAt,
              lab_request: request
                ? {
                    uuid: request.uuid,
                    exams_list: request.examsList,
                    instructions: request.instructions,
                    is_completed: request.isCompleted,
                  }
                : null,
              reviewed_by: {
                full_name: "Médico Evaluador",
                specialties: [{ name: "Patología Clínica" }],
              },
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
        console.error("[usePatientLabResultsQuery] Offline load failed:", err);
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
    queryKey: patientLabKeys.list(page, search, status),
    queryFn: async () => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        return fetchOfflineLabResults(page, search, status);
      }

      try {
        const response = await patientLabApi.getPatientLabResults(
          page,
          search,
          status,
        );
        const paginated = response as Record<string, unknown>;
        const rawArray =
          (paginated?.data?.data as unknown[]) ||
          (paginated?.data as unknown[]) ||
          [];

        // Guardar en cache local Dexie
        if (rawArray.length > 0) {
          for (const rawResult of rawArray) {
            const res = rawResult as Record<string, unknown>;
            const resUuid = String(res.uuid ?? res.id ?? "");
            const requestObj = (res.lab_request ?? res.labRequest) as Record<
              string,
              unknown
            > | null;

            await db.labResults.put({
              uuid: resUuid,
              labRequestUuid: requestObj
                ? String(requestObj.uuid ?? requestObj.id ?? "")
                : "",
              patientUuid: patientUuid,
              fileUrl: String(res.file_url ?? res.fileUrl ?? ""),
              resultJson: (res.result_json ?? res.resultJson ?? {}) as Record<
                string,
                unknown
              >,
              notes: String(res.notes ?? ""),
              reviewedByDoctorUuid: res.reviewed_by
                ? String(
                    (res.reviewed_by as Record<string, unknown>).uuid ??
                      (res.reviewed_by as Record<string, unknown>).id ??
                      "",
                  )
                : null,
              reviewedAt: res.reviewed_at ? String(res.reviewed_at) : null,
              status: String(res.status ?? "COMPLETED").toUpperCase() as
                | "PENDING"
                | "COMPLETED"
                | "ABNORMAL"
                | "CANCELLED",
              performedAt: String(res.performed_at ?? res.performedAt ?? ""),
            });

            // Guardar también la solicitud de laboratorio
            if (requestObj) {
              await db.labRequests.put({
                uuid: String(requestObj.uuid ?? requestObj.id ?? ""),
                consultationUuid: String(requestObj.consultation_id ?? ""),
                examsList: (requestObj.exams_list ??
                  requestObj.examsList ??
                  []) as string[],
                instructions: String(requestObj.instructions ?? ""),
                isCompleted:
                  (requestObj.is_completed ?? requestObj.isCompleted ?? false)
                    ? true
                    : false,
              });
            }
          }
        }

        return paginated?.data || paginated;
      } catch (error) {
        console.warn(
          "[usePatientLabResultsQuery] Server fetch failed. Falling back to local cache.",
          error,
        );
        return fetchOfflineLabResults(page, search, status);
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!patientUuid,
  });
}
