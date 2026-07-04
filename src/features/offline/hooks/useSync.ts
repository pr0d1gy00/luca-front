"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSyncStore } from "../store/useSyncStore";
import { useOnlineStatus } from "./useOnlineStatus";
import { syncService } from "../services/syncService";
import axios from "axios";

const SYNC_INTERVAL = 30_000;

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncSuccess?: (response: unknown) => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Sync orchestrator hook
 * Coordinates online status, sync service, and store
 */
export function useSync(options: UseSyncOptions = {}) {
  const {
    autoSync = true,
    syncInterval = SYNC_INTERVAL,
    onSyncSuccess,
    onSyncError,
  } = options;

  const isOnline = useOnlineStatus();
  const {
    startSync,
    endSync,
    updateLastSync,
    state: syncState,
    setPendingCount,
  } = useSyncStore();

  const syncFnRef = useRef<(() => Promise<unknown>) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Main sync function
  const performSync = useCallback(async () => {
    if (!isOnline) return null;

    startSync();

    try {
      const response = await syncService.sync();

      // Handle pagination if has_more
      if (response.has_more) {
        let currentTimestamp = response.sync_timestamp;
        let hasMore = true;

        while (hasMore) {
          const nextResponse = await syncService.continueSync(currentTimestamp);
          currentTimestamp = nextResponse.sync_timestamp;
          hasMore = nextResponse.has_more;
        }
      }

      // Update pending count
      const pendingCount = await syncService.getPendingCount();
      setPendingCount(pendingCount);

      updateLastSync(response.sync_timestamp);
      endSync(true);

      onSyncSuccess?.(response);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Sync failed");

      // Handle 401 — token expired
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        useSyncStore.getState().resetSync();
      }

      endSync(false, err.message);
      toast.error(`Error de sincronización: ${err.message}`, {
        description:
          "Tus cambios se guardaron localmente y se subirán automáticamente al recuperar conexión.",
        duration: 5000,
      });
      onSyncError?.(err);
      return null;
    }
  }, [
    isOnline,
    startSync,
    endSync,
    updateLastSync,
    setPendingCount,
    onSyncSuccess,
    onSyncError,
  ]);

  // Store function ref for interval
  useEffect(() => {
    syncFnRef.current = performSync;
  }, [performSync]);

  // Auto-sync effect
  useEffect(() => {
    if (autoSync && isOnline) {
      performSync();

      intervalRef.current = setInterval(() => {
        syncFnRef.current?.();
      }, syncInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSync, isOnline, syncInterval, performSync]);

  // Manual trigger
  const triggerSync = useCallback(() => {
    if (isOnline) {
      performSync();
    }
  }, [isOnline, performSync]);

  return {
    triggerSync,
    isSyncing: syncState === "syncing",
    isOnline,
    syncState,
  };
}
