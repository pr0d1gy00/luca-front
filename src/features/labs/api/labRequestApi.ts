import apiClient from "@/lib/api/client";
import { serverToClient, clientToServer } from "@/features/offline/utils/uuid";
import type { LabRequest } from "@/features/offline/database/schema";

export interface CreateLabRequestDTO {
  patientUuid: string;
  consultationUuid?: string | null;
  examsList: string[];
  instructions?: string;
  isCompleted?: boolean;
}

export interface UpdateLabRequestDTO {
  uuid: string;
  examsList?: string[];
  instructions?: string;
  isCompleted?: boolean;
}

export interface LabRequestResponse {
  data: LabRequest;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface LabRequestsResponse {
  data: LabRequest[];
  pagination: PaginationMeta;
}

export const labRequestApi = {
  /**
   * Get all lab requests for current doctor, optionally filtered by patient UUID, paginated
   */
  getAll: async (
    patientUuid?: string,
    page = 1,
    perPage = 10,
  ): Promise<LabRequestsResponse> => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("per_page", perPage.toString());
    if (patientUuid) {
      params.set("patient_uuid", patientUuid);
    }

    const response = await apiClient.get<Record<string, unknown>>(
      `/lab-requests?${params.toString()}`,
    );

    const rootData = response.data as Record<string, unknown>;
    const paginator = (
      rootData?.data &&
      typeof rootData.data === "object" &&
      "data" in (rootData.data as object)
        ? rootData.data
        : (rootData?.data ?? rootData)
    ) as Record<string, unknown>;
    const rawItems = Array.isArray(paginator.data)
      ? (paginator.data as Record<string, unknown>[])
      : Array.isArray(paginator)
        ? (paginator as Record<string, unknown>[])
        : [];

    const mapped = rawItems.map((r) => serverToClient<LabRequest>(r));

    const currentPage = (paginator.current_page as number) ?? page;
    const lastPage = (paginator.last_page as number) ?? 1;
    const total = (paginator.total as number) ?? mapped.length;
    const from =
      (paginator.from as number | null) ??
      (mapped.length > 0 ? (currentPage - 1) * perPage + 1 : 0);
    const to =
      (paginator.to as number | null) ??
      (mapped.length > 0 ? (from ?? 1) + mapped.length - 1 : 0);

    return {
      data: mapped,
      pagination: {
        currentPage,
        lastPage,
        perPage: (paginator.per_page as number) ?? perPage,
        total,
        from,
        to,
      },
    };
  },

  /**
   * Get single lab request by UUID
   */
  getByUUID: async (uuid: string): Promise<LabRequestResponse> => {
    const response = await apiClient.get<{ data: Record<string, unknown> }>(
      `/lab-requests/${uuid}`,
    );
    const mapped = serverToClient<LabRequest>(
      response.data.data ?? response.data,
    );
    return { data: mapped };
  },

  /**
   * Create new lab request
   */
  create: async (data: CreateLabRequestDTO): Promise<LabRequestResponse> => {
    const serverData = clientToServer(
      data as unknown as Record<string, unknown>,
    );
    const response = await apiClient.post<{ data: Record<string, unknown> }>(
      "/lab-requests",
      serverData,
    );
    const mapped = serverToClient<LabRequest>(
      response.data.data ?? response.data,
    );
    return { data: mapped };
  },

  /**
   * Update existing lab request
   */
  update: async (data: UpdateLabRequestDTO): Promise<LabRequestResponse> => {
    const serverData = clientToServer(
      data as unknown as Record<string, unknown>,
    );
    const response = await apiClient.put<{ data: Record<string, unknown> }>(
      `/lab-requests/${data.uuid}`,
      serverData,
    );
    const mapped = serverToClient<LabRequest>(
      response.data.data ?? response.data,
    );
    return { data: mapped };
  },

  /**
   * Delete lab request (soft delete)
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/lab-requests/${uuid}`);
  },
};
