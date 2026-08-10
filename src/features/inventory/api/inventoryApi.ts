import apiClient from "@/lib/api/client";
import { BulkInventoryUpload } from "../schemas";

export const inventoryApi = {
  getInventory: async (providerId: string) => {
    const { data } = await apiClient.get(`/pharmacy/inventory`, {
      params: { providerId },
    });
    return data;
  },

  getBatches: async (providerId: string) => {
    const { data } = await apiClient.get(`/pharmacy/inventory/batches`, {
      params: { providerId },
    });
    return data;
  },

  getMetrics: async (providerId: string) => {
    const { data } = await apiClient.get(`/pharmacy/inventory/metrics`, {
      params: { providerId },
    });
    return data;
  },

  uploadBatch: async (payload: BulkInventoryUpload) => {
    const { data } = await apiClient.post(`/pharmacy/inventory/batches`, payload);
    return data;
  },

  uploadDocuments: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await apiClient.post<{ urls: string[] }>(`/api/v1/storage/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.urls;
  },
};
