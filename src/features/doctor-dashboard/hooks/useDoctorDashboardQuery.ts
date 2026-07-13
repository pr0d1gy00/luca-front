"use client";

import { useQuery } from "@tanstack/react-query";
import { doctorDashboardApi } from "../api/doctorDashboardApi";
import { db } from "@/features/offline/database/schema";
import { useAuthStore } from "@/store/auth";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { getLocalTodayString } from "@/lib/utils";

export const doctorDashboardKeys = {
  all: ["doctor-dashboard"] as const,
  summary: () => [...doctorDashboardKeys.all, "summary"] as const,
};

export function useDoctorDashboardQuery() {
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? user?.id ?? "";
  const isOnline = useOnlineStatus();

  const fetchOfflineDashboard = async () => {
    if (!doctorUuid) {
      return {
        kpis: [
          { label: "Pacientes hoy", value: 0, trend: 0, subtitle: "hoy" },
          { label: "Recetas emitidas", value: 0, trend: 0, subtitle: "hoy" },
          { label: "Citas pendientes", value: 0, trend: 0, subtitle: "restantes hoy" },
        ],
        agenda: [],
        next_patient: null,
        actions: [],
      };
    }

    try {
      const todayStr = getLocalTodayString();

      // 1. Obtener todas las citas, recetas y laboratorios locales de Dexie
      const allLocalAppointments = await db.appointments.toArray();
      const allLocalPrescriptions = await db.prescriptions.toArray();
      const allLocalLabs = await db.labResults.toArray();
      const allLocalFollowUps = await db.followUps.toArray();

      // 2. Filtrar para el doctor actual y fecha de hoy
      const doctorAptsToday = allLocalAppointments.filter(
        (apt) => apt.doctorUuid === doctorUuid && apt.date === todayStr
      );

      const doctorPrescriptionsToday = allLocalPrescriptions.filter(
        (rx) => rx.doctorUuid === doctorUuid && rx.date.startsWith(todayStr)
      );

      // 3. Calcular KPIs
      const pacientesHoyCount = doctorAptsToday.filter(
        (apt) => apt.status !== "CANCELLED"
      ).length;

      const citasPendientesCount = doctorAptsToday.filter(
        (apt) => apt.status === "PENDING" || apt.status === "CONFIRMED" || apt.status === "IN_ROOM"
      ).length;

      const recetasEmitidasCount = doctorPrescriptionsToday.length;

      // 4. Mapear agenda de hoy resolviendo nombres de pacientes
      const agendaList = [];
      for (const apt of doctorAptsToday) {
        const patient = await db.patients.get(apt.patientUuid);
        const patientName = patient
          ? `${patient.firstName} ${patient.lastName}`
          : "Paciente";

        agendaList.push({
          id: apt.uuid,
          patientName,
          type: apt.type === "ONLINE" ? "Virtual" : "Presencial",
          time: apt.time,
          status: apt.status.toLowerCase(), // en-espera, en-curso, etc.
        });
      }

      // Ordenar la agenda cronológicamente
      agendaList.sort((a, b) => a.time.localeCompare(b.time));

      // 5. Encontrar el siguiente paciente
      const nextApt = doctorAptsToday
        .filter((apt) => apt.status === "PENDING" || apt.status === "CONFIRMED" || apt.status === "IN_ROOM")
        .sort((a, b) => a.time.localeCompare(b.time))[0];

      let nextPatient = null;
      if (nextApt) {
        const patient = await db.patients.get(nextApt.patientUuid);
        const alerts = [];

        if (patient) {
          if (patient.allergies) {
            alerts.push({
              type: "allergy" as const,
              label: `Alergia: ${patient.allergies}`,
            });
          }
          if (patient.chronicConditions) {
            alerts.push({
              type: "chronic" as const,
              label: `Crónico: ${patient.chronicConditions}`,
            });
          }
        }

        nextPatient = {
          id: nextApt.uuid,
          name: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
          time: nextApt.time,
          type: nextApt.type === "ONLINE" ? "Virtual" : "Presencial",
          reason: nextApt.reason || nextApt.notes || "Consulta de control",
          alerts,
        };
      }

      // 6. Calcular Acciones Requeridas offline en Dexie
      const actionsList = [];

      // A. Laboratorios pendientes de revisión
      const pendingLabsOffline = allLocalLabs.filter(
        (lab) => !lab.reviewedAt && lab.status === "PENDING"
      );
      for (const lab of pendingLabsOffline) {
        const patient = await db.patients.get(lab.patientUuid);
        actionsList.push({
          id: `lab-${lab.uuid}`,
          label: "Revisar resultado crítico de laboratorio",
          type: "lab" as const,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
          completed: false,
        });
      }

      // B. Citas pasadas pendientes (inasistencias)
      const missedAptsOffline = allLocalAppointments.filter(
        (apt) => apt.doctorUuid === doctorUuid && apt.date < todayStr && (apt.status === "PENDING" || apt.status === "CONFIRMED")
      );
      for (const apt of missedAptsOffline) {
        const patient = await db.patients.get(apt.patientUuid);
        actionsList.push({
          id: `call-${apt.uuid}`,
          label: "Llamar a paciente que no asistió",
          type: "call" as const,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
          completed: false,
        });
      }

      // C. Seguimientos pendientes
      const pendingFollowsOffline = allLocalFollowUps.filter(
        (follow) => follow.status === "PENDING"
      );
      for (const follow of pendingFollowsOffline) {
        const patient = await db.patients.get(follow.patientUuid);
        actionsList.push({
          id: `follow-${follow.uuid}`,
          label: "Agendar seguimiento / Contacto médico",
          type: "follow-up" as const,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
          completed: false,
        });
      }

      return {
        kpis: [
          {
            label: "Pacientes hoy",
            value: pacientesHoyCount,
            trend: 0,
            subtitle: "hoy",
          },
          {
            label: "Recetas emitidas",
            value: recetasEmitidasCount,
            trend: 0,
            subtitle: "hoy",
          },
          {
            label: "Citas pendientes",
            value: citasPendientesCount,
            trend: 0,
            subtitle: "restantes hoy",
          },
        ],
        agenda: agendaList,
        next_patient: nextPatient,
        actions: actionsList,
      };
    } catch (err) {
      console.error("[useDoctorDashboardQuery] Dexie load error:", err);
      throw err;
    }
  };

  return useQuery({
    queryKey: doctorDashboardKeys.summary(),
    queryFn: async () => {
      if (!isOnline) {
        return fetchOfflineDashboard();
      }
      try {
        return await doctorDashboardApi.getDoctorDashboard();
      } catch (err) {
        console.warn("[useDoctorDashboardQuery] Server query failed, falling back to Dexie", err);
        return fetchOfflineDashboard();
      }
    },
    enabled: !!doctorUuid,
    staleTime: 20 * 1000,
  });
}
