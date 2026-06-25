"use client";

import { useCallback } from "react";
import { queueService } from "../services/queueService";
import { useSyncStore } from "../store/useSyncStore";
import type { EntityType, QueuedChange } from "../types/sync.types";

/**
 * Sync queue hook
 * Exposes queue operations with reactive store updates
 */
export function useSyncQueue() {
	const { setPendingCount } = useSyncStore();

	const enqueue = useCallback(
		async <T extends { uuid?: string }>(
			entity: EntityType,
			action: "create" | "update" | "delete",
			data: T,
		): Promise<string> => {
			const id = await queueService.enqueue(entity, action, data);
			const count = await queueService.count();
			setPendingCount(count);
			return id;
		},
		[setPendingCount],
	);

	const dequeue = useCallback(
		async (id: string): Promise<void> => {
			await queueService.dequeue(id);
			const count = await queueService.count();
			setPendingCount(count);
		},
		[setPendingCount],
	);

	const getQueuedChanges = useCallback(
		async (entity?: EntityType): Promise<QueuedChange[]> => {
			return queueService.getAll(entity);
		},
		[],
	);

	const incrementRetry = useCallback(async (id: string): Promise<boolean> => {
		return queueService.incrementRetry(id);
	}, []);

	const clearQueue = useCallback(async (): Promise<void> => {
		await queueService.clear();
		setPendingCount(0);
	}, [setPendingCount]);

	const getPendingCount = useCallback(async (): Promise<number> => {
		return queueService.count();
	}, []);

	return {
		enqueue,
		dequeue,
		getQueuedChanges,
		incrementRetry,
		clearQueue,
		getPendingCount,
	};
}
