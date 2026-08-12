import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacySetting } from "../types/pharmacy.types";
import { useOnlineStatus } from "../../offline/hooks/useOnlineStatus";
import { pharmacyOfflineService } from "../services/pharmacyOfflineService";
import { useAuthStore } from "@/store/auth";

export function usePharmacySettings() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  const settingsQuery = useQuery<{ settings: PharmacySetting; location: { latitude: number; longitude: number } }>({
    queryKey: ["pharmacy", "settings"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/pharmacy/settings");
        await pharmacyOfflineService.saveLocalSynced("pharmacySettings", {
          uuid: providerUuid, // Provider UUID as PK for settings
          providerUuid,
          settings: response.data.data,
          location: response.data.location
        } as any);
        return {
          settings: response.data.data,
          location: response.data.location,
        };
      } catch (error) {
        if (!isOnline) {
          const localData = await pharmacyOfflineService.getSettings(providerUuid);
          if (localData) {
            return {
              settings: localData.settings as any,
              location: localData.location as any,
            };
          }
        }
        throw error;
      }
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<PharmacySetting>) => {
      if (!isOnline) {
        return await pharmacyOfflineService.saveSettingsLocally(providerUuid, { settings: payload } as any);
      }
      const response = await apiClient.put("/pharmacy/settings", payload);
      await pharmacyOfflineService.saveLocalSynced("pharmacySettings", {
        uuid: providerUuid,
        providerUuid,
        settings: response.data.data,
        location: settingsQuery.data?.location // retain location
      } as any);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "settings"] });
    },
  });

  return {
    settings: settingsQuery.data?.settings,
    location: settingsQuery.data?.location,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
