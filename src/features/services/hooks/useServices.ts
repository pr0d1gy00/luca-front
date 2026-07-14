"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { db } from "@/features/offline/database/schema";
import type { Service, ProviderService } from "../schemas";

// --- Mock Data para inicialización offline de Servicios Maestro ---
const MOCK_GLOBAL_SERVICES: Service[] = [
  {
    uuid: "svc-eco-001",
    name: "Ecocardiograma Doppler",
    category: "IMAGING",
    description: "Estudio de ultrasonido para evaluar la estructura y función del corazón.",
    basePrice: 50,
  },
  {
    uuid: "svc-sut-002",
    name: "Sutura Simple (menor a 5cm)",
    category: "PROCEDURE",
    description: "Procedimiento menor para sutura y curación de heridas superficiales.",
    basePrice: 20,
  },
  {
    uuid: "svc-lab-003",
    name: "Perfil Veinte (Lab Completo)",
    category: "LAB",
    description: "Análisis de sangre que incluye hemograma, glicemia, urea, creatinina, perfil lipídico y hepático.",
    basePrice: 15,
  },
  {
    uuid: "svc-ray-004",
    name: "Radiografía de Tórax (PA)",
    category: "IMAGING",
    description: "Radiografía convencional del tórax.",
    basePrice: 25,
  },
  {
    uuid: "svc-ter-005",
    name: "Fisioterapia Sesión Individual",
    category: "THERAPY",
    description: "Sesión personalizada de rehabilitación física de 45 minutos.",
    basePrice: 30,
  },
];

// Seed inicial offline si la tabla de servicios está vacía
async function seedOfflineServicesIfEmpty() {
  const count = await db.services.count();
  if (count === 0) {
    const records = MOCK_GLOBAL_SERVICES.map(s => ({
      uuid: s.uuid,
      name: s.name,
      category: s.category,
      description: s.description || "",
      basePrice: s.basePrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _syncStatus: "synced" as const
    }));
    await db.services.bulkAdd(records);
    
    // Seed de algunos servicios del proveedor default
    const providerCount = await db.providerServices.count();
    if (providerCount === 0) {
      await db.providerServices.bulkAdd([
        {
          uuid: "psvc-001",
          serviceUuid: "svc-eco-001",
          providerUuid: "doc-default",
          providerType: "DOCTOR",
          price: 60,
          durationMinutes: 40,
          isStandaloneBookable: true,
          isActive: true,
          customName: "Eco Doppler Cardíaco",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _syncStatus: "synced" as const
        },
        {
          uuid: "psvc-002",
          serviceUuid: "svc-sut-002",
          providerUuid: "doc-default",
          providerType: "DOCTOR",
          price: 25,
          durationMinutes: 20,
          isStandaloneBookable: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _syncStatus: "synced" as const
        }
      ]);
    }
  }
}

// --- HOOKS ---

export function useGlobalServices() {
  const isOnline = useOnlineStatus();

  return useQuery<Service[]>({
    queryKey: ["global-services"],
    queryFn: async () => {
      await seedOfflineServicesIfEmpty();

      if (!isOnline) {
        const localServices = await db.services.toArray();
        return localServices.map((s) => ({
          uuid: s.uuid,
          name: s.name,
          category: s.category,
          description: s.description,
          basePrice: s.basePrice,
          code: s.code,
        }));
      }

      try {
        const { data } = await apiClient.get("/services/global");
        const servicesList = data?.data || MOCK_GLOBAL_SERVICES;

        // Sincronizar localmente en background
        for (const s of servicesList) {
          await db.services.put({
            uuid: s.uuid,
            name: s.name,
            category: s.category,
            description: s.description || "",
            basePrice: s.basePrice,
            code: s.code,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _syncStatus: "synced"
          });
        }

        return servicesList;
      } catch (err) {
        console.warn("Error fetching global services from API, reading from Dexie", err);
        const localServices = await db.services.toArray();
        return localServices;
      }
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useProviderServices(providerUuid: string) {
  const isOnline = useOnlineStatus();

  return useQuery<ProviderService[]>({
    queryKey: ["provider-services", providerUuid],
    queryFn: async () => {
      await seedOfflineServicesIfEmpty();

      if (!isOnline) {
        const local = await db.providerServices
          .where("providerUuid")
          .equals(providerUuid)
          .toArray();
        return local;
      }

      try {
        const { data } = await apiClient.get(`/services/provider/${providerUuid}`);
        const providerServicesList: ProviderService[] = data?.data || [];

        // Sincronizar localmente en background
        if (providerServicesList.length > 0) {
          // Limpiar locales anteriores para este proveedor
          await db.providerServices.where("providerUuid").equals(providerUuid).delete();
          for (const s of providerServicesList) {
            await db.providerServices.put({
              ...s,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              _syncStatus: "synced"
            });
          }
        }

        return providerServicesList;
      } catch (err) {
        console.warn("Error fetching provider services from API, reading from Dexie", err);
        const local = await db.providerServices
          .where("providerUuid")
          .equals(providerUuid)
          .toArray();
        return local;
      }
    },
    enabled: !!providerUuid,
  });
}

export function useSaveProviderService(providerUuid: string) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (payload: Omit<ProviderService, "uuid" | "providerUuid" | "providerType"> & { uuid?: string, providerType?: "DOCTOR" | "CLINIC" }) => {
      const isEdit = !!payload.uuid;
      const uuid = payload.uuid || `psvc-${Date.now()}`;
      const finalPayload: any = {
        uuid,
        providerUuid,
        providerType: payload.providerType || "DOCTOR",
        serviceUuid: payload.serviceUuid,
        price: payload.price,
        durationMinutes: payload.durationMinutes,
        isStandaloneBookable: payload.isStandaloneBookable,
        isActive: payload.isActive,
        customName: payload.customName || "",
        customDescription: payload.customDescription || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: isOnline ? "synced" : (isEdit ? "updated" : "created"),
      };

      // Guardar localmente en Dexie (Offline First)
      await db.providerServices.put(finalPayload);

      if (!isOnline) {
        // Encolar en syncQueue
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "providerServices" as any,
          entityUuid: uuid,
          action: isEdit ? "UPDATE" : "CREATE",
          payload: JSON.stringify(finalPayload),
          timestamp: Date.now(),
        });
        return finalPayload;
      }

      try {
        const url = isEdit ? `/services/provider-services/${uuid}` : "/services/provider-services";
        const method = isEdit ? "put" : "post";
        const { data } = await apiClient[method](url, finalPayload);
        return data?.data || finalPayload;
      } catch (err) {
        console.warn("Error saving provider service to API, synced locally in pending state", err);
        await db.providerServices.put({
          ...finalPayload,
          _syncStatus: isEdit ? "updated" : "created"
        });
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "providerServices" as any,
          entityUuid: uuid,
          action: isEdit ? "UPDATE" : "CREATE",
          payload: JSON.stringify(finalPayload),
          timestamp: Date.now(),
        });
        return finalPayload;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services", providerUuid] });
    },
  });
}

export function useDeleteProviderService(providerUuid: string) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (uuid: string) => {
      // Eliminar de Dexie localmente (Offline First)
      await db.providerServices.delete(uuid);

      if (!isOnline) {
        // Encolar acción DELETE
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "providerServices" as any,
          entityUuid: uuid,
          action: "DELETE",
          payload: JSON.stringify({ uuid }),
          timestamp: Date.now(),
        });
        return uuid;
      }

      try {
        await apiClient.delete(`/services/provider-services/${uuid}`);
        return uuid;
      } catch (err) {
        console.warn("Error deleting provider service online, queued locally", err);
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "providerServices" as any,
          entityUuid: uuid,
          action: "DELETE",
          payload: JSON.stringify({ uuid }),
          timestamp: Date.now(),
        });
        return uuid;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services", providerUuid] });
    },
  });
}
