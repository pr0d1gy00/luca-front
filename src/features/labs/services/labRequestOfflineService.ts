import { db, type LabRequest } from "@/features/offline/database/schema";
import { queueService } from "@/features/offline/services/queueService";
import {
  generateUUID,
  getCurrentTimestamp,
} from "@/features/offline/utils/uuid";
import type { CreateLabRequestDTO, UpdateLabRequestDTO } from "../api/labRequestApi";
import type { EntityType } from "@/features/offline/types/sync.types";

const ENTITY: EntityType = "lab_requests";

export const labRequestOfflineService = {
  create: async (data: CreateLabRequestDTO, doctorUuid: string): Promise<LabRequest> => {
    const now = getCurrentTimestamp();
    const uuid = generateUUID();

    const labRequest: LabRequest = {
      uuid,
      patientUuid: data.patientUuid,
      doctorUuid: doctorUuid,
      consultationUuid: data.consultationUuid ?? null,
      examsList: data.examsList,
      instructions: data.instructions ?? "",
      isCompleted: data.isCompleted ?? false,
      updatedAt: now,
      createdAt: now,
      _syncStatus: "pending",
    };

    await db.labRequests.add(labRequest);
    await queueService.enqueue(ENTITY, "create", labRequest);
    return labRequest;
  },

  update: async (
    uuid: string,
    data: UpdateLabRequestDTO
  ): Promise<LabRequest | null> => {
    const existing = await db.labRequests.get(uuid);
    if (!existing) return null;

    const now = getCurrentTimestamp();
    const updated: LabRequest = {
      ...existing,
      ...data,
      uuid,
      updatedAt: now,
      _syncStatus: "pending",
    };

    await db.labRequests.put(updated);
    await queueService.enqueue(ENTITY, "update", updated);
    return updated;
  },

  delete: async (uuid: string): Promise<boolean> => {
    const existing = await db.labRequests.get(uuid);
    if (!existing) return false;

    const now = getCurrentTimestamp();
    await db.labRequests.update(uuid, {
      updatedAt: now,
      deletedAt: now,
      _syncStatus: "pending",
    });
    await queueService.enqueue(ENTITY, "delete", { uuid });
    return true;
  },

  getAll: async (): Promise<LabRequest[]> => {
    return db.labRequests.toArray();
  },

  getByUUID: async (uuid: string): Promise<LabRequest | undefined> => {
    return db.labRequests.get(uuid);
  },

  getByPatient: async (patientUuid: string): Promise<LabRequest[]> => {
    return db.labRequests.where("patientUuid").equals(patientUuid).toArray();
  },

  saveLocalSynced: async (labRequest: LabRequest): Promise<void> => {
    await db.labRequests.put({
      ...labRequest,
      _syncStatus: "synced",
    });
  },

  deleteLocal: async (uuid: string): Promise<void> => {
    await db.labRequests.delete(uuid);
  },
};
