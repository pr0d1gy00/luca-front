import {
  db,
  getLastSyncTimestamp,
  setLastSyncTimestamp,
} from "../database/schema";
import { syncApi } from "../api/syncApi";
import { queueService } from "./queueService";
import {
  clientToServer,
  serverToClient,
  getCurrentTimestamp,
} from "../utils/uuid";
import type {
  SyncRequest,
  SyncResponse,
  EntityType,
} from "../types/sync.types";
import { SYNC_ENTITY_ORDER } from "../types/sync.types";

/**
 * Sync Service
 * Core business logic for offline-first synchronization
 */
export const syncService = {
  /**
   * Build push payload from queued changes
   */
  buildPushPayload: async (): Promise<SyncRequest["push"]> => {
    const queuedChanges = await queueService.getAll();

    // Group by entity
    const grouped: Partial<Record<EntityType, unknown[]>> = {};
    for (const change of queuedChanges) {
      if (!grouped[change.entity]) {
        grouped[change.entity] = [];
      }

      const serverData = clientToServer(change.data as Record<string, unknown>);
      grouped[change.entity]!.push({
        ...(serverData as Record<string, unknown>),
        updated_at: change.timestamp,
      });
    }

    // Order by topological dependencies
    const orderedPush: SyncRequest["push"] = {};
    for (const entity of SYNC_ENTITY_ORDER) {
      const entityData = grouped[entity];
      if (entityData && entityData.length > 0) {
        orderedPush[entity] = entityData as SyncRequest["push"][EntityType];
      }
    }

    return orderedPush;
  },

  /**
   * Process push results from server
   */
  processPushResults: async (response: SyncResponse): Promise<void> => {
    const pushResults = response.push_results ?? {};

    for (const [entity, result] of Object.entries(pushResults)) {
      const entityResult = result as {
        success: string[];
        errors: Array<{ uuid: string; field: string; message: string }>;
      };

      // Process successes
      for (const uuid of entityResult.success ?? []) {
        const queued = await queueService.findByEntityUUID(
          entity as EntityType,
          uuid,
        );

        if (queued) {
          await queueService.dequeue(queued.id);

          // Update sync status in local entity table if it exists in the schema
          const tableName = entity.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase(),
          );
          const tableExists = db.tables.some((t) => t.name === tableName);
          if (tableExists) {
            const table = db.table(tableName);
            if (await table.get(uuid)) {
              await table.update(uuid, { _syncStatus: "synced" });
            }
          }
        }
      }

      // Process errors
      for (const error of entityResult.errors ?? []) {
        // Store error for user review
        await db.syncErrors.add({
          uuid: error.uuid,
          entity: entity as EntityType,
          field: error.field,
          message: error.message,
          retryCount: 0,
          createdAt: getCurrentTimestamp(),
        });

        // Increment retry count
        const queued = await queueService.findByEntityUUID(
          entity as EntityType,
          error.uuid,
        );
        if (queued) {
          await queueService.incrementRetry(queued.id);
        }
      }
    }
  },

  /**
   * Process pull data with Last-Write-Wins merge
   */
  processPull: async (pull: SyncResponse["pull"]): Promise<void> => {
    const pullData = pull ?? {};

    for (const [entity, records] of Object.entries(pullData)) {
      if (!records || records.length === 0) continue;

      const tableName = entity.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      const tableExists = db.tables.some((t) => t.name === tableName);
      if (!tableExists) {
        console.warn(
          `[SyncService] Table ${entity} (mapped to ${tableName}) does not exist in local Dexie database. Skipping.`,
        );
        continue;
      }

      const table = db.table(tableName);

      for (const serverRecord of records) {
        const serverRecordObj = serverRecord as unknown as Record<
          string,
          unknown
        >;
        const clientRecord = serverToClient(serverRecordObj);
        const clientTyped = clientRecord as Record<string, unknown>;

        // Check soft delete
        const isDeleted =
          "deletedAt" in clientTyped && clientTyped.deletedAt !== null;
        const uuid = clientTyped.uuid as string;

        if (isDeleted) {
          await table.delete(uuid);
        } else {
          const localRecord = await table.get(uuid);

          if (!localRecord) {
            // New record from server
            await table.add({
              ...(clientTyped as object),
              _syncStatus: "synced",
            });
          } else {
            // Last-Write-Wins
            const localUpdatedAt =
              (localRecord as { updatedAt?: string }).updatedAt ?? "";
            const serverUpdatedAt =
              (clientTyped as { updatedAt?: string }).updatedAt ?? "";

            if (serverUpdatedAt > localUpdatedAt) {
              await table.update(uuid, {
                ...(clientTyped as object),
                _syncStatus: "synced",
              });
            }
          }
        }
      }
    }
  },

  /**
   * Perform full sync cycle
   */
  sync: async (): Promise<SyncResponse> => {
    // 1. Build push payload from queue
    const pushPayload = await syncService.buildPushPayload();
    const lastSyncTimestamp = await getLastSyncTimestamp();

    const request: SyncRequest = {
      last_sync_timestamp: lastSyncTimestamp,
      push: pushPayload,
    };

    // 2. Call API
    const response = await syncApi.sync(request);

    // 3. Process results
    await syncService.processPushResults(response);
    await syncService.processPull(response.pull);

    // 4. Update sync timestamp
    await setLastSyncTimestamp(response.sync_timestamp);

    return response;
  },

  /**
   * Continue sync with pagination (has_more = true)
   */
  continueSync: async (lastTimestamp: string): Promise<SyncResponse> => {
    const pushPayload = await syncService.buildPushPayload();

    const request: SyncRequest = {
      last_sync_timestamp: lastTimestamp,
      push: pushPayload,
    };

    const response = await syncApi.sync(request);

    await syncService.processPushResults(response);
    await syncService.processPull(response.pull);
    await setLastSyncTimestamp(response.sync_timestamp);

    return response;
  },

  /**
   * Get pending changes count
   */
  getPendingCount: async (): Promise<number> => {
    return queueService.count();
  },

  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp: async (): Promise<string | null> => {
    return getLastSyncTimestamp();
  },
};
