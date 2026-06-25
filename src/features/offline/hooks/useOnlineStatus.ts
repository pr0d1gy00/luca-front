"use client";

import { useEffect, useCallback } from "react";
import { useSyncStore } from "../store/useSyncStore";

/**
 * Hook para detectar estado de conexión online/offline
 * Sincroniza con el sync store de Zustand
 */
export function useOnlineStatus() {
	const { isOnline, setOnline } = useSyncStore();

	const handleOnline = useCallback(() => {
		setOnline(true);
	}, [setOnline]);

	const handleOffline = useCallback(() => {
		setOnline(false);
	}, [setOnline]);

	useEffect(() => {
		// Establecer estado inicial basado en navigator.onLine
		setOnline(navigator.onLine);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [handleOnline, handleOffline, setOnline]);

	return isOnline;
}
