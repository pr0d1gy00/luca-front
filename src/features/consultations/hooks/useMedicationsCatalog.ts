"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";

export interface MedicationCatalogItem {
  id: string;
  activePrinciple: string;
  concentration: string;
  presentation:
    | "CAPSULA"
    | "TABLETA"
    | "JARABE"
    | "GOTAS"
    | "AMPOLLA"
    | "CREMA";
  administrationRoute:
    | "ORAL"
    | "INTRAVENOSA"
    | "INTRAMUSCULAR"
    | "TOPICA"
    | "OFTALMICA";
}

interface ApiMedication {
  uuid: string;
  active_principle?: string;
  name?: string;
  concentration?: string;
  presentation?: string;
  administration_route?: string;
}

export function useMedicationsCatalog() {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: ["medications-catalog"],
    queryFn: async (): Promise<MedicationCatalogItem[]> => {
      if (!isOnline) {
        const localMeds = await db.medications.toArray();
        if (localMeds.length > 0) {
          return localMeds.map((m) => ({
            id: m.uuid,
            activePrinciple: m.activePrinciple || m.name || "",
            concentration: m.concentration || "—",
            presentation:
              (m.presentation?.toUpperCase() as MedicationCatalogItem["presentation"]) ||
              "TABLETA",
            administrationRoute:
              (m.administrationRoute?.toUpperCase() as MedicationCatalogItem["administrationRoute"]) ||
              "ORAL",
          }));
        }
        return [];
      }

      try {
        const { data } = await apiClient.get("/medications");
        const items: ApiMedication[] = data?.data?.data ?? data?.data ?? [];
        if (items.length > 0) {
          return items.map((m) => ({
            id: m.uuid,
            activePrinciple: m.active_principle || m.name || "",
            concentration: m.concentration || "—",
            presentation: (m.presentation ||
              "TABLETA") as MedicationCatalogItem["presentation"],
            administrationRoute: (m.administration_route ||
              "ORAL") as MedicationCatalogItem["administrationRoute"],
          }));
        }
        return [];
      } catch (err) {
        console.warn(
          "[useMedicationsCatalog] Failed to load from server, using Dexie/fallback",
          err,
        );
        const localMeds = await db.medications.toArray();
        if (localMeds.length > 0) {
          return localMeds.map((m) => ({
            id: m.uuid,
            activePrinciple: m.activePrinciple || m.name || "",
            concentration: m.concentration || "—",
            presentation:
              (m.presentation?.toUpperCase() as MedicationCatalogItem["presentation"]) ||
              "TABLETA",
            administrationRoute:
              (m.administrationRoute?.toUpperCase() as MedicationCatalogItem["administrationRoute"]) ||
              "ORAL",
          }));
        }
        return [];
      }
    },
    staleTime: 60 * 1000 * 5, // 5 minutos de cache
  });
}
