import { db } from "../database/schema";
import { generateUUID, getCurrentTimestamp } from "../utils/uuid";
import type { EntityType, QueuedChange } from "../types/sync.types";

/**
 * Queue Service
 * Pure business logic for managing the offline change queue
 */
export const queueService = {
	/**
	 * Add a new change to the queue
	 */
	enqueue: async <T extends { uuid?: string }>(
		entity: EntityType,
		action: "create" | "update" | "delete",
		data: T,
	): Promise<string> => {
		const id = generateUUID();
		const timestamp = getCurrentTimestamp();

		const queuedChange: QueuedChange<T> = {
			id,
			entity,
			action,
			data,
			timestamp,
			retryCount: 0,
			maxRetries: 3,
		};

		await db.syncQueue.add(queuedChange as QueuedChange);
		return id;
	},

	/**
	 * Remove a change from the queue
	 */
	dequeue: async (id: string): Promise<void> => {
		await db.syncQueue.delete(id);
	},

	/**
	 * Get all queued changes, optionally filtered by entity
	 */
	getAll: async (entity?: EntityType): Promise<QueuedChange[]> => {
		if (entity) {
			return db.syncQueue.where("entity").equals(entity).sortBy("timestamp");
		}
		return db.syncQueue.orderBy("timestamp").toArray();
	},

	/**
	 * Get a single queued change by ID
	 */
	getById: async (id: string): Promise<QueuedChange | undefined> => {
		return db.syncQueue.get(id);
	},

	/**
	 * Find queued change by entity and UUID
	 */
	findByEntityUUID: async (
		entity: EntityType,
		uuid: string,
	): Promise<QueuedChange | undefined> => {
		return db.syncQueue
			.where("entity")
			.equals(entity)
			.and((q) => (q.data as { uuid: string }).uuid === uuid)
			.first();
	},

	/**
	 * Increment retry count for a change
	 * Returns false if max retries reached
	 */
	incrementRetry: async (id: string): Promise<boolean> => {
		const change = await db.syncQueue.get(id);
		if (!change) return false;

		const newRetryCount = change.retryCount + 1;
		if (newRetryCount >= change.maxRetries) {
			await db.syncQueue.delete(id);
			return false;
		}

		await db.syncQueue.update(id, { retryCount: newRetryCount });
		return true;
	},

	/**
	 * Clear all queued changes
	 */
	clear: async (): Promise<void> => {
		await db.syncQueue.clear();
	},

	/**
	 * Get count of pending changes
	 */
	count: async (): Promise<number> => {
		return db.syncQueue.count();
	},

	/**
	 * Get changes grouped by entity in topological order
	 */
	getGroupedByEntity: async (): Promise<
		Partial<Record<EntityType, QueuedChange[]>>
	> => {
		const changes = await queueService.getAll();
		const grouped: Partial<Record<EntityType, QueuedChange[]>> = {};

		for (const change of changes) {
			if (!grouped[change.entity]) {
				grouped[change.entity] = [];
			}
			grouped[change.entity]!.push(change);
		}

		return grouped;
	},
};
