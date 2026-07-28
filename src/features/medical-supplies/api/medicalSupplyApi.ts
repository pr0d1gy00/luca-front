import apiClient from "@/lib/axios";
import {
  MedicalSupplySettings,
  InventoryItem,
  DashboardStats,
  TopDemandedItem,
  QuotePayload,
} from "../types";

export const medicalSupplyApi = {
  getSettings: async (): Promise<MedicalSupplySettings> => {
    const response = await apiClient.get("/v1/medical-supply/settings");
    return response.data.data || response.data;
  },

  updateSettings: async (
    settings: Partial<MedicalSupplySettings>,
  ): Promise<MedicalSupplySettings> => {
    const response = await apiClient.put(
      "/v1/medical-supply/settings",
      settings,
    );
    return response.data.data || response.data;
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get("/v1/medical-supply/inventory");
    return response.data.data || response.data;
  },

  addInventoryItem: async (
    item: Omit<InventoryItem, "id" | "provider_profile_id">,
  ): Promise<InventoryItem> => {
    const response = await apiClient.post("/v1/medical-supply/inventory", item);
    return response.data.data || response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/v1/medical-supply/dashboard/stats");
    return response.data.data || response.data;
  },

  getTopDemanded: async (): Promise<TopDemandedItem[]> => {
    const response = await apiClient.get(
      "/v1/medical-supply/dashboard/top-demanded",
    );
    return response.data.data || response.data;
  },

  submitManualQuote: async (payload: QuotePayload): Promise<void> => {
    await apiClient.post("/v1/medical-supply/quotes/manual", payload);
  },

  triggerAutoMatch: async (orderId: number): Promise<void> => {
    await apiClient.post(`/v1/medical-supply/quotes/auto-match/${orderId}`);
  },
};
