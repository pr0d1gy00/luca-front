"use client";

import { useQuery } from "@tanstack/react-query";
import { prescriptionApi } from "../api/prescriptionApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export const patientPrescriptionKeys = {
  all: ["patient-prescriptions"] as const,
  list: (page: number) =>
    [...patientPrescriptionKeys.all, "list", page] as const,
};

export function usePatientPrescriptionsQuery(page: number = 1) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  const fetchOfflinePrescriptions = useCallback(
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
        // 1. Obtener todas las recetas locales
        const allLocal = await db.prescriptions.toArray();

        // 2. Filtrar por el paciente actual
        const patientPrescs = allLocal.filter(
          (p) => p.patientUuid === patientUuid,
        );

        // 3. Ordenar por fecha descendente
        patientPrescs.sort((a, b) => b.date.localeCompare(a.date));

        // 4. Paginar localmente (20 por página)
        const perPage = 20;
        const total = patientPrescs.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = patientPrescs.slice(startIndex, startIndex + perPage);

        // Para cada receta offline, cargamos también sus items locales
        const mappedData = await Promise.all(
          pagedData.map(async (presc) => {
            const items = await db.prescriptionItems
              .where("prescriptionUuid")
              .equals(presc.uuid)
              .toArray();

            // Mapeamos a la estructura esperada por el UI
            return {
              id: presc.uuid,
              uuid: presc.uuid,
              date: presc.date,
              expiration_date: presc.expirationDate,
              notes: presc.notes,
              public_token: presc.publicToken,
              status: presc.status,
              // Relación simulada del médico para offline
              user: (presc as unknown as Record<string, unknown>).user ?? {
                full_name: "Médico de Guardia",
                specialties: [{ name: "Medicina General" }],
              },
              items: items.map((item) => ({
                id: item.uuid,
                uuid: item.uuid,
                dose: item.dose,
                frequency: item.frequency,
                duration: item.duration,
                quantity: item.quantity,
                notes: item.notes,
                medication: {
                  name: "Medicamento",
                  concentration: "500mg",
                },
              })),
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
          "[usePatientPrescriptionsQuery] Offline load failed:",
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
    queryKey: patientPrescriptionKeys.list(page),
    queryFn: async () => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        return fetchOfflinePrescriptions(page);
      }

      try {
        const response = await prescriptionApi.getPatientPrescriptions(page);
        const paginated = response as Record<string, unknown>;
        const rawArray =
          (paginated?.data?.data as unknown[]) ||
          (paginated?.data as unknown[]) ||
          [];

        // Guardar las recetas descargadas en Dexie de forma asíncrona
        if (rawArray.length > 0) {
          for (const rawPresc of rawArray) {
            const presc = rawPresc as Record<string, unknown>;
            const prescUuid = String(presc.uuid ?? presc.id ?? "");

            await db.prescriptions.put({
              uuid: prescUuid,
              patientUuid: String(
                presc.patient_id ?? presc.patient_uuid ?? patientUuid,
              ),
              doctorUuid: String(presc.user_id ?? presc.doctor_uuid ?? ""),
              clinicBranchUuid: presc.clinic_branch_id
                ? String(presc.clinic_branch_id)
                : null,
              date: String(presc.date ?? ""),
              expirationDate: String(presc.expiration_date ?? ""),
              notes: String(presc.notes ?? ""),
              publicToken: String(
                presc.public_token ?? presc.publicToken ?? "",
              ),
              status: String(presc.status ?? "ACTIVE").toUpperCase() as
                | "ACTIVE"
                | "EXPIRED"
                | "CANCELLED",
            });

            // Guardar también los items de la receta si existen en la respuesta
            const items = (presc.items as unknown[]) || [];
            for (const rawItem of items) {
              const item = rawItem as Record<string, unknown>;
              await db.prescriptionItems.put({
                uuid: String(item.uuid ?? item.id ?? ""),
                prescriptionUuid: prescUuid,
                medicationUuid: String(
                  item.medication_id ?? item.medication_uuid ?? "",
                ),
                dose: String(item.dose ?? ""),
                frequency: String(item.frequency ?? ""),
                duration: String(item.duration ?? ""),
                quantity: Number(item.quantity ?? 1),
                notes: String(item.notes ?? ""),
              });
            }
          }
        }

        return paginated?.data || paginated;
      } catch (error) {
        console.warn(
          "[usePatientPrescriptionsQuery] Server fetch failed. Falling back to local cache.",
          error,
        );
        return fetchOfflinePrescriptions(page);
      }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!patientUuid,
  });
}
