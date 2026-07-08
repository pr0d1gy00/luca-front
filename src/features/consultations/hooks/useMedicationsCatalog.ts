"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";

export interface MedicationCatalogItem {
  id: string;
  activePrinciple: string;
  concentration: string;
  presentation: "CAPSULA" | "TABLETA" | "JARABE" | "GOTAS" | "AMPOLLA" | "CREMA";
  administrationRoute: "ORAL" | "INTRAVENOSA" | "INTRAMUSCULAR" | "TOPICA" | "OFTALMICA";
}

const DEFAULT_MEDICATIONS: MedicationCatalogItem[] = [
  {
    id: "1",
    activePrinciple: "Amoxicilina",
    concentration: "500mg",
    presentation: "CAPSULA",
    administrationRoute: "ORAL",
  },
  {
    id: "2",
    activePrinciple: "Ibuprofeno",
    concentration: "400mg",
    presentation: "TABLETA",
    administrationRoute: "ORAL",
  },
  {
    id: "3",
    activePrinciple: "Paracetamol",
    concentration: "500mg/ml",
    presentation: "JARABE",
    administrationRoute: "ORAL",
  },
  {
    id: "4",
    activePrinciple: "Cloranfenicol",
    concentration: "0.5%",
    presentation: "GOTAS",
    administrationRoute: "OFTALMICA",
  },
  {
    id: "5",
    activePrinciple: "Betametasona",
    concentration: "0.05%",
    presentation: "CREMA",
    administrationRoute: "TOPICA",
  },
  {
    id: "6",
    activePrinciple: "Omeprazol",
    concentration: "20mg",
    presentation: "CAPSULA",
    administrationRoute: "ORAL",
  },
  {
    id: "7",
    activePrinciple: "Metformina",
    concentration: "850mg",
    presentation: "TABLETA",
    administrationRoute: "ORAL",
  },
  {
    id: "8",
    activePrinciple: "Losartán",
    concentration: "50mg",
    presentation: "TABLETA",
    administrationRoute: "ORAL",
  },
  {
    id: "9",
    activePrinciple: "Dexametasona",
    concentration: "4mg/ml",
    presentation: "AMPOLLA",
    administrationRoute: "INTRAVENOSA",
  },
  {
    id: "10",
    activePrinciple: "Ceftriaxona",
    concentration: "1g",
    presentation: "AMPOLLA",
    administrationRoute: "INTRAMUSCULAR",
  },
];

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
            presentation: (m.presentation?.toUpperCase() as MedicationCatalogItem['presentation']) || "TABLETA",
            administrationRoute: (m.administrationRoute?.toUpperCase() as MedicationCatalogItem['administrationRoute']) || "ORAL",
          }));
        }
        return DEFAULT_MEDICATIONS;
      }

      try {
        const { data } = await apiClient.get("/medications");
        const items: ApiMedication[] = data?.data?.data ?? data?.data ?? [];
        if (items.length > 0) {
          return items.map((m) => ({
            id: m.uuid,
            activePrinciple: m.active_principle || m.name || "",
            concentration: m.concentration || "—",
            presentation: (m.presentation || "TABLETA") as MedicationCatalogItem['presentation'],
            administrationRoute: (m.administration_route || "ORAL") as MedicationCatalogItem['administrationRoute'],
          }));
        }
        return DEFAULT_MEDICATIONS;
      } catch (err) {
        console.warn("[useMedicationsCatalog] Failed to load from server, using Dexie/fallback", err);
        const localMeds = await db.medications.toArray();
        if (localMeds.length > 0) {
          return localMeds.map((m) => ({
            id: m.uuid,
            activePrinciple: m.activePrinciple || m.name || "",
            concentration: m.concentration || "—",
            presentation: (m.presentation?.toUpperCase() as MedicationCatalogItem['presentation']) || "TABLETA",
            administrationRoute: (m.administrationRoute?.toUpperCase() as MedicationCatalogItem['administrationRoute']) || "ORAL",
          }));
        }
        return DEFAULT_MEDICATIONS;
      }
    },
    staleTime: 60 * 1000 * 5, // 5 minutos de cache
  });
}
