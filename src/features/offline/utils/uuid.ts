import { v4 as uuidv4 } from "uuid";

/**
 * Generate a new UUID v4
 * Used for all new entities created offline
 */
export function generateUUID(): string {
	return uuidv4();
}

/**
 * Validate UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
	const uuidV4Regex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidV4Regex.test(uuid);
}

/**
 * Convert server snake_case to client camelCase
 */
export function serverToClient<T>(serverObj: Record<string, unknown>): T {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(serverObj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
			letter.toUpperCase(),
		);
		result[camelKey] = value;
	}

	return result as T;
}

/**
 * Convert client camelCase to server snake_case
 */
export function clientToServer<T>(clientObj: Record<string, unknown>): T {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(clientObj)) {
		const snakeKey = key.replace(
			/[A-Z]/g,
			(letter) => `_${letter.toLowerCase()}`,
		);
		result[snakeKey] = value;
	}

	return result as T;
}

/**
 * Get current timestamp in ISO 8601 format with milliseconds
 */
export function getCurrentTimestamp(): string {
	return new Date().toISOString();
}
