"use client";

import { useSyncExternalStore } from "react";
import { useSyncStore } from "../store/useSyncStore";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSync } from "../hooks/useSync";
import { RefreshCw, WifiOff, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Hydration-safe client-only hook
function useIsClient() {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

interface SyncIndicatorProps {
	className?: string;
	showLabel?: boolean;
}

export function SyncIndicator({
	className,
	showLabel = true,
}: SyncIndicatorProps) {
	const isClient = useIsClient();
	const { state: syncState, stats, pendingChanges } = useSyncStore();
	const isOnline = useOnlineStatus();
	const { triggerSync, isSyncing } = useSync({ autoSync: false });

	if (!isClient) {
		return null;
	}

	const getStatusIcon = () => {
		if (!isOnline) {
			return <WifiOff className="h-4 w-4 text-slate-400" />;
		}
		if (syncState === "syncing" || isSyncing) {
			return <RefreshCw className="h-4 w-4 text-teal-600 animate-spin" />;
		}
		if (syncState === "error") {
			return <AlertCircle className="h-4 w-4 text-red-500" />;
		}
		if (pendingChanges > 0) {
			return <RefreshCw className="h-4 w-4 text-amber-500" />;
		}
		return <Check className="h-4 w-4 text-emerald-500" />;
	};

	const getStatusText = () => {
		if (!isOnline) return "Sin conexión";
		if (syncState === "syncing" || isSyncing) return "Sincronizando...";
		if (syncState === "error") return "Error de sync";
		if (pendingChanges > 0) return `${pendingChanges} pendientes`;
		if (stats.lastSyncTimestamp) {
			const lastSync = new Date(stats.lastSyncTimestamp);
			const now = new Date();
			const diffMs = now.getTime() - lastSync.getTime();
			const diffMins = Math.floor(diffMs / 60000);

			if (diffMins < 1) return "Sincronizado";
			if (diffMins < 60) return `Hace ${diffMins}m`;
			const diffHours = Math.floor(diffMins / 60);
			if (diffHours < 24) return `Hace ${diffHours}h`;
			return `Hace ${Math.floor(diffHours / 24)}d`;
		}
		return "Listo";
	};

	const getStatusColor = () => {
		if (!isOnline) return "text-slate-400";
		if (syncState === "syncing" || isSyncing) return "text-teal-600";
		if (syncState === "error") return "text-red-500";
		if (pendingChanges > 0) return "text-amber-500";
		return "text-emerald-500";
	};

	return (
		<button
			onClick={() => triggerSync()}
			disabled={!isOnline || isSyncing}
			className={cn(
				"flex items-center gap-2 px-3 py-1.5 rounded-lg",
				"bg-white border border-slate-200 shadow-sm",
				"hover:bg-slate-50 transition-colors duration-200",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			title={stats.lastSyncError ?? "Clic para sincronizar"}
		>
			{getStatusIcon()}
			{showLabel && (
				<span className={cn("text-sm font-medium", getStatusColor())}>
					{getStatusText()}
				</span>
			)}
		</button>
	);
}
