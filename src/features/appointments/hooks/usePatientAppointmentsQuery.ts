"use client";

import { useQuery } from "@tanstack/react-query";
import { appointmentApi } from "../api/appointmentApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useCallback } from "react";

export const patientAppointmentKeys = {
  all: ["patient-appointments"] as const,
  list: (page: number, filter: string) =>
    [...patientAppointmentKeys.all, "list", page, filter] as const,
};

export function usePatientAppointmentsQuery(
  page: number = 1,
  filter: string = "all",
) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  const fetchOfflineAppointments = useCallback(
    async (pageNumber: number, activeFilter: string) => {
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
        // 1. Obtener todas las citas locales
        const allLocal = await db.appointments.toArray();

        // 2. Filtrar por el paciente actual
        let patientApts = allLocal.filter(
          (apt) => apt.patientUuid === patientUuid,
        );

        // 3. Aplicar filtros locales de estado
        const todayStr = new Date().toISOString().split("T")[0];
        if (activeFilter === "upcoming") {
          patientApts = patientApts.filter(
            (apt) =>
              apt.date >= todayStr &&
              apt.status !== "CANCELLED" &&
              apt.status !== "COMPLETED",
          );
        } else if (activeFilter === "past") {
          patientApts = patientApts.filter(
            (apt) =>
              apt.status === "COMPLETED" ||
              (apt.date < todayStr && apt.status !== "CANCELLED"),
          );
        } else if (activeFilter === "cancelled") {
          patientApts = patientApts.filter((apt) => apt.status === "CANCELLED");
        }

        // 4. Ordenar por fecha y hora descendente (más recientes y futuras primero)
        patientApts.sort((a, b) => {
          const dateTimeA = `${a.date}T${a.time}`;
          const dateTimeB = `${b.date}T${b.time}`;
          return dateTimeB.localeCompare(dateTimeA);
        });

        // 5. Paginar localmente (20 elementos por página)
        const perPage = 20;
        const total = patientApts.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = patientApts.slice(startIndex, startIndex + perPage);

        // Mapeamos los campos locales a los campos esperados por la UI
        const mappedData = pagedData.map((apt) => ({
          ...apt,
          doctor: (apt as unknown as Record<string, unknown>).doctor ?? {
            full_name: "Médico de Guardia",
            specialties: [{ name: "Medicina General" }],
          },
          clinic_branch: (apt as unknown as Record<string, unknown>)
            .clinic_branch ?? {
            name: "Sede Principal LUCA",
            address: "Av. Principal",
          },
        }));

        return {
          current_page: pageNumber,
          data: mappedData,
          last_page: lastPage,
          per_page: perPage,
          total: total,
        };
      } catch (err) {
        console.error(
          "[usePatientAppointmentsQuery] Offline load failed:",
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
    queryKey: patientAppointmentKeys.list(page, filter),
    queryFn: async () => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        return fetchOfflineAppointments(page, filter);
      }

      try {
        const response = await appointmentApi.getPatientAppointments(
          page,
          filter,
        );
        const paginated = response as Record<string, unknown>;
        const appointmentsArray = (paginated?.data as unknown[]) || [];

        // Guardar las citas descargadas localmente en Dexie de forma asíncrona
        if (appointmentsArray.length > 0) {
          const localAptsToUpsert = appointmentsArray.map((rawApt) => {
            const apt = rawApt as Record<string, unknown>;
            return {
              uuid: String(apt.uuid ?? ""),
              patientUuid: String(apt.patient_uuid ?? apt.patientUuid ?? ""),
              doctorUuid: String(apt.doctor_uuid ?? apt.doctorUuid ?? ""),
              clinicBranchUuid: String(
                apt.clinic_branch_uuid ?? apt.clinicBranchUuid ?? "",
              ),
              date: String(apt.date ?? ""),
              time: String(apt.time ?? ""),
              slotTime: apt.slot_time
                ? String(apt.slot_time)
                : apt.slotTime
                  ? String(apt.slotTime)
                  : null,
              type: String(apt.type ?? "IN_PERSON") as "IN_PERSON" | "ONLINE",
              status: String(apt.status ?? "PENDING") as
                | "PENDING"
                | "CONFIRMED"
                | "IN_ROOM"
                | "COMPLETED"
                | "CANCELLED"
                | "NO_SHOW",
              notes: String(apt.notes ?? ""),
              reason: String(apt.reason ?? ""),
              createdAt: String(
                apt.created_at ?? apt.createdAt ?? new Date().toISOString(),
              ),
              updatedAt: String(
                apt.updated_at ?? apt.updatedAt ?? new Date().toISOString(),
              ),
            };
          });

          await db.appointments.bulkPut(localAptsToUpsert).catch((err) => {
            console.error(
              "[usePatientAppointmentsQuery] bulkPut local cache failed:",
              err,
            );
          });
        }

        return paginated;
      } catch (error) {
        console.warn(
          "[usePatientAppointmentsQuery] Server fetch failed. Falling back to local cache.",
          error,
        );
        return fetchOfflineAppointments(page, filter);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos de caché fresca
    enabled: !!patientUuid,
  });
}
