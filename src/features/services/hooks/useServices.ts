"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { db } from "@/features/offline/database/schema";
import type { Service, ProviderService } from "../schemas";

// --- HOOKS ---

export function useGlobalServices() {
  const isOnline = useOnlineStatus();

  return useQuery<Service[]>({
    queryKey: ["global-services"],
    queryFn: async () => {
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
        const servicesList: Service[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        // Sincronizar localmente en Dexie como caché de lecturas online
        if (servicesList.length > 0) {
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
              _syncStatus: "synced",
            });
          }
        }

        return servicesList;
      } catch (err) {
        console.warn(
          "Error fetching global services from API, fallback to Dexie cache",
          err,
        );
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
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useProviderServices(providerUuid: string) {
  const isOnline = useOnlineStatus();

  return useQuery<ProviderService[]>({
    queryKey: ["provider-services", providerUuid],
    queryFn: async () => {
      if (!isOnline) {
        const local = await db.providerServices
          .where("providerUuid")
          .equals(providerUuid)
          .toArray();
        return local;
      }

      try {
        const { data } = await apiClient.get(
          `/services/provider/${providerUuid}`,
        );
        const providerServicesList: ProviderService[] = Array.isArray(
          data?.data,
        )
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        // Sincronizar localmente en Dexie
        if (providerServicesList.length > 0) {
          await db.providerServices
            .where("providerUuid")
            .equals(providerUuid)
            .delete();
          for (const s of providerServicesList) {
            await db.providerServices.put({
              ...s,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              _syncStatus: "synced",
            });
          }
        }

        return providerServicesList;
      } catch (err) {
        console.warn(
          "Error fetching provider services from API, fallback to Dexie cache",
          err,
        );
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
    mutationFn: async (
      payload: Omit<
        ProviderService,
        "uuid" | "providerUuid" | "providerType"
      > & { uuid?: string; providerType?: "DOCTOR" | "CLINIC" },
    ) => {
      const isEdit = !!payload.uuid;
      // Para Dexie offline usamos un UUID v4 válido; el backend asigna el suyo en CREATE
      const localUuid = payload.uuid || crypto.randomUUID();

      const basePayload = {
        providerUuid,
        providerType: payload.providerType || "DOCTOR",
        serviceUuid: payload.serviceUuid,
        price: payload.price,
        durationMinutes: payload.durationMinutes,
        isStandaloneBookable: payload.isStandaloneBookable,
        isActive: payload.isActive,
        customName: payload.customName || undefined,
        customDescription: payload.customDescription || undefined,
      };

      // Dexie siempre necesita el uuid localmente
      const dexieRecord: ProviderService & {
        createdAt: string;
        updatedAt: string;
        _syncStatus: string;
      } = {
        ...basePayload,
        uuid: localUuid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncStatus: isOnline ? "synced" : isEdit ? "updated" : "created",
      };
      await db.providerServices.put(dexieRecord);

      if (!isOnline) {
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          entity: "patients",
          entityUuid: localUuid,
          action: isEdit ? "UPDATE" : "CREATE",
          payload: JSON.stringify(dexieRecord),
          timestamp: Date.now(),
        } as unknown as Parameters<typeof db.syncQueue.add>[0]);
        return dexieRecord;
      }

      try {
        if (isEdit) {
          // PUT incluye uuid en la URL, no en el body
          const { data } = await apiClient.put(
            `/services/provider-services/${localUuid}`,
            basePayload,
          );
          return data?.data || dexieRecord;
        } else {
          // POST sin uuid — el backend lo genera
          const { data } = await apiClient.post(
            "/services/provider-services",
            basePayload,
          );
          const serverRecord = data?.data || dexieRecord;
          // Reemplazar en Dexie con el uuid real del servidor
          if (serverRecord.uuid && serverRecord.uuid !== localUuid) {
            await db.providerServices.delete(localUuid);
            await db.providerServices.put({
              ...serverRecord,
              _syncStatus: "synced",
            });
          }
          return serverRecord;
        }
      } catch (err) {
        console.warn(
          "Error saving provider service to API, queued locally",
          err,
        );
        await db.providerServices.put({
          ...dexieRecord,
          _syncStatus: isEdit ? "updated" : "created",
        });
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          entity: "patients",
          entityUuid: localUuid,
          action: isEdit ? "UPDATE" : "CREATE",
          payload: JSON.stringify(dexieRecord),
          timestamp: Date.now(),
        } as unknown as Parameters<typeof db.syncQueue.add>[0]);
        return dexieRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["provider-services", providerUuid],
      });
    },
  });
}

export function useDeleteProviderService(providerUuid: string) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await db.providerServices.delete(uuid);

      if (!isOnline) {
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "patients",
          entityUuid: uuid,
          action: "DELETE",
          payload: JSON.stringify({ uuid }),
          timestamp: Date.now(),
        } as unknown as Parameters<typeof db.syncQueue.add>[0]);
        return uuid;
      }

      try {
        await apiClient.delete(`/services/provider-services/${uuid}`);
        return uuid;
      } catch (err) {
        console.warn(
          "Error deleting provider service online, queued locally",
          err,
        );
        await db.syncQueue.add({
          id: `sq-${Date.now()}`,
          entity: "patients",
          entityUuid: uuid,
          action: "DELETE",
          payload: JSON.stringify({ uuid }),
          timestamp: Date.now(),
        } as unknown as Parameters<typeof db.syncQueue.add>[0]);
        return uuid;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["provider-services", providerUuid],
      });
    },
  });
}
