import apiClient from "@/lib/api/client";
import type { SyncRequest, SyncResponse } from "../types/sync.types";

const TIMEOUT_MS = 60_000;

/**
 * Sync API client
 * Handles all HTTP communication with the sync server
 */
export const syncApi = {
	/**
	 * Perform bulk sync: push local changes, pull server updates
	 */
	sync: async (request: SyncRequest): Promise<SyncResponse> => {
		const response = await apiClient.post<SyncResponse>("/sync", request, {
			timeout: TIMEOUT_MS,
			headers: {
				"Content-Type": "application/json",
			},
		});

		return response.data;
	},

	/**
	 * Upload binary document
	 */
	uploadDocument: async (
		uuid: string,
		file: File,
	): Promise<{ uuid: string }> => {
		const formData = new FormData();
		formData.append("uuid", uuid);
		formData.append("file", file);

		const response = await apiClient.post<{ uuid: string; message: string }>(
			"/documents/upload",
			formData,
			{
				timeout: TIMEOUT_MS,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		return { uuid: response.data.uuid };
	},
};
