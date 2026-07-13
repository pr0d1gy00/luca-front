"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { getLocalTodayString } from "@/lib/utils";
import { useCallback } from "react";

export const doctorAppointmentKeys = {
  all: ["doctor-appointments"] as const,
  list: (page: number, timeframe: string, status: string, search: string) =>
    [
      ...doctorAppointmentKeys.all,
      "list",
      page,
      timeframe,
      status,
      search,
    ] as const,
};

export function useDoctorAppointmentsQuery(
  page: number = 1,
  timeframe: string = "today",
  status: string = "",
  search: string = "",
) {
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? user?.id ?? "";
  const isOnline = useOnlineStatus();

  const fetchOfflineAppointments = useCallback(
    async (pageNumber: number, tf: string, st: string, srch: string) => {
      if (!doctorUuid) {
        return {
          current_page: pageNumber,
          data: [],
          last_page: 1,
          per_page: 20,
          total: 0,
        };
      }

      try {
        const todayStr = getLocalTodayString();

        // 1. Obtener todas las citas locales
        const allLocal = await db.appointments.toArray();

        // 2. Filtrar por el doctor actual
        let doctorApts = allLocal.filter(
          (apt) => apt.doctorUuid === doctorUuid,
        );

        // 3. Aplicar filtros locales de tiempo (timeframe)
        if (tf === "today") {
          doctorApts = doctorApts.filter((apt) => apt.date === todayStr);
        } else if (tf === "upcoming") {
          doctorApts = doctorApts.filter(
            (apt) => apt.date > todayStr && apt.status !== "CANCELLED",
          );
        } else if (tf === "past") {
          doctorApts = doctorApts.filter((apt) => apt.date < todayStr);
        }

        // 4. Aplicar filtros locales de estado (status)
        if (st) {
          doctorApts = doctorApts.filter(
            (apt) => apt.status.toLowerCase() === st.toLowerCase(),
          );
        }

        // 5. Filtrar por búsqueda multicampo (search)
        const matchedApts = [];
        const queryTerm = srch.toLowerCase().trim();

        for (const apt of doctorApts) {
          const patient = await db.patients.get(apt.patientUuid);
          const patientName = patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Paciente";

          // Si hay término de búsqueda, validar coincidencias
          if (queryTerm) {
            if (!patient) continue; // Si no hay datos de paciente, no puede coincidir

            const nameMatch = `${patient.firstName} ${patient.lastName}`
              .toLowerCase()
              .includes(queryTerm);
            const nationalIdMatch = (patient.nationalId ?? "")
              .toLowerCase()
              .includes(queryTerm);
            const phoneMatch = (patient.phone ?? "")
              .toLowerCase()
              .includes(queryTerm);
            const emailMatch = (patient.email ?? "")
              .toLowerCase()
              .includes(queryTerm);

            if (!nameMatch && !nationalIdMatch && !phoneMatch && !emailMatch) {
              continue; // Saltear si no hay coincidencia
            }
          }

          // Resolver relaciones locales para la UI
          const clinicBranch = await db.clinicBranches.get(
            apt.clinicBranchUuid,
          );

          // Construir clinical_summary localmente
          let clinicalSummary = null;
          if (patient) {
            // 1. Estilo de vida
            const lifestyleDb = await db.lifestyles
              .where("patientUuid")
              .equals(patient.uuid)
              .first();
            const lifestyle = lifestyleDb
              ? {
                  smoking_status: lifestyleDb.smokingStatus,
                  alcohol_consumption: lifestyleDb.alcoholConsumption,
                  activity_level: lifestyleDb.activityLevel,
                  diet_type: lifestyleDb.dietType,
                }
              : null;

            // 2. Antecedentes Quirúrgicos
            const surgicalDb = await db.surgicalHistories
              .where("patientUuid")
              .equals(patient.uuid)
              .toArray();
            const surgicalHistory = surgicalDb.map((item) => {
              const year = item.date ? item.date.split("-")[0] : null;
              return item.procedure + (year ? ` (${year})` : "");
            });

            // 3. Antecedentes Familiares
            const familyDb = await db.familyHistories
              .where("patientUuid")
              .equals(patient.uuid)
              .toArray();
            const familyHistory = familyDb.map(
              (item) =>
                `${item.condition} (${item.relationship.toLowerCase()})`,
            );

            // 4. Medicamentos Activos (Recetas Activas)
            const prescriptionsDb = await db.prescriptions
              .where("patientUuid")
              .equals(patient.uuid)
              .toArray();

            const activeMeds: string[] = [];
            const activeRxs = prescriptionsDb.filter(
              (rx) => rx.status === "ACTIVE" && rx.expirationDate >= todayStr,
            );

            for (const rx of activeRxs) {
              const items = await db.prescriptionItems
                .where("prescriptionUuid")
                .equals(rx.uuid)
                .toArray();
              for (const item of items) {
                const med = await db.medications.get(item.medicationUuid);
                const medName =
                  med?.commercialName && med?.activePrinciple
                    ? `${med.commercialName} (${med.activePrinciple})`
                    : med?.commercialName ||
                      med?.activePrinciple ||
                      med?.name ||
                      "Medicamento";
                activeMeds.push(
                  `${medName} ${item.dose} - ${item.frequency} (${item.duration})`,
                );
              }
            }

            // 5. Historial Reciente (Últimas 2 consultas locales)
            const consultationsDb = await db.consultations
              .where("patientUuid")
              .equals(patient.uuid)
              .toArray();

            consultationsDb.sort((a, b) => b.date.localeCompare(a.date));
            const recentConsultations = [];
            const topConsultations = consultationsDb.slice(0, 2);

            for (const c of topConsultations) {
              recentConsultations.push({
                date: c.date,
                diagnosis: c.diagnosis,
                reason: c.reason,
                doctor_name: "Médico Tratante",
              });
            }

            clinicalSummary = {
              allergies: patient.allergies || "",
              chronic_conditions: patient.chronicConditions || "",
              lifestyle,
              surgical_history: surgicalHistory,
              family_history: familyHistory,
              active_medications: Array.from(new Set(activeMeds)),
              recent_history: recentConsultations,
            };
          }

          matchedApts.push({
            id: apt.uuid,
            uuid: apt.uuid,
            patientUuid: apt.patientUuid,
            doctorUuid: apt.doctorUuid,
            clinicBranchUuid: apt.clinicBranchUuid,
            date: apt.date,
            time: apt.time,
            type: apt.type,
            status: apt.status.toLowerCase(), // unificar a minúsculas
            notes: apt.notes,
            reason: apt.reason,
            patient: {
              id: apt.patientUuid,
              first_name: patient?.firstName ?? "Paciente",
              last_name: patient?.lastName ?? "",
              national_id: patient?.nationalId ?? "",
              phone: patient?.phone ?? "",
              email: patient?.email ?? "",
              clinical_summary: clinicalSummary,
            },
            clinic_branch: {
              name: clinicBranch?.name ?? "Sede Principal",
              address: clinicBranch?.address ?? "",
              phone: clinicBranch?.phone ?? "",
            },
          });
        }

        // 6. Ordenar cronológicamente
        if (tf === "past") {
          matchedApts.sort((a, b) => {
            const dateTimeA = `${a.date}T${a.time}`;
            const dateTimeB = `${b.date}T${b.time}`;
            return dateTimeB.localeCompare(dateTimeA); // más recientes primero
          });
        } else {
          matchedApts.sort((a, b) => {
            const dateTimeA = `${a.date}T${a.time}`;
            const dateTimeB = `${b.date}T${b.time}`;
            return dateTimeA.localeCompare(dateTimeB); // cronológico ascendente
          });
        }

        // 7. Paginar localmente
        const perPage = 20;
        const total = matchedApts.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        const startIndex = (pageNumber - 1) * perPage;
        const pagedData = matchedApts.slice(startIndex, startIndex + perPage);

        return {
          current_page: pageNumber,
          data: pagedData,
          last_page: lastPage,
          per_page: perPage,
          total: total,
        };
      } catch (err) {
        console.error("[useDoctorAppointmentsQuery] Dexie load error:", err);
        throw err;
      }
    },
    [doctorUuid],
  );

  return useQuery({
    queryKey: doctorAppointmentKeys.list(page, timeframe, status, search),
    queryFn: async () => {
      if (!isOnline) {
        return fetchOfflineAppointments(page, timeframe, status, search);
      }
      try {
        const { data } = await apiClient.get("/appointments", {
          params: {
            page,
            timeframe,
            status: status || undefined,
            search: search || undefined,
          },
        });

        // La respuesta de la API de Laravel tiene la estructura { data: { data: [...] } } debido al paginate()
        const paginatedResult = data?.data ?? data;

        // Formatear los registros que vienen de la API para asegurar homogeneidad
        const formattedData = (paginatedResult?.data || []).map((apt: any) => ({
          ...apt,
          status: apt.status.toLowerCase(), // normalizar estado
        }));

        return {
          ...paginatedResult,
          data: formattedData,
        };
      } catch (err) {
        console.warn(
          "[useDoctorAppointmentsQuery] Server query failed, falling back to Dexie",
          err,
        );
        return fetchOfflineAppointments(page, timeframe, status, search);
      }
    },
    enabled: !!doctorUuid,
    staleTime: 15 * 1000,
  });
}
