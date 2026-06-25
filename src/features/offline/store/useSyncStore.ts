import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	SyncEngineState,
	SyncTimestamp,
	SyncStatusType,
} from "../types/sync.types";

interface SyncStore extends SyncEngineState {
	// Actions
	setOnline: (isOnline: boolean) => void;
	startSync: () => void;
	endSync: (success: boolean, error?: string) => void;
	setPendingCount: (count: number) => void;
	updateLastSync: (timestamp: SyncTimestamp) => void;
	resetSync: () => void;
}

const initialState: SyncEngineState = {
	state: "idle",
	stats: {
		pendingCount: 0,
		lastSyncTimestamp: null,
		lastSyncError: null,
	},
	isOnline: true,
	isSyncing: false,
	pendingChanges: 0,
};

export const useSyncStore = create<SyncStore>()(
	persist(
		(set) => ({
			...initialState,

			setOnline: (isOnline) =>
				set((s) => ({
					isOnline,
					state: (!isOnline
						? "offline"
						: s.isSyncing
							? "syncing"
							: "idle") as SyncStatusType,
				})),

			startSync: () =>
				set({
					state: "syncing",
					isSyncing: true,
				}),

			endSync: (success, error) =>
				set((s) => ({
					state: success ? "idle" : "error",
					isSyncing: false,
					stats: {
						...s.stats,
						lastSyncError: error ?? null,
					},
				})),

			setPendingCount: (count) =>
				set({
					pendingChanges: count,
				}),

			updateLastSync: (timestamp) =>
				set((s) => ({
					stats: {
						...s.stats,
						lastSyncTimestamp: timestamp,
						lastSyncError: null,
					},
				})),

			resetSync: () => set(initialState),
		}),
		{
			name: "luca-sync-store",
			partialize: (state) => ({
				stats: state.stats,
			}),
		},
	),
);
