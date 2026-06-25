"use client";

import { useEffect, useState } from "react";
import { db } from "@/features/offline/database/schema";

/**
 * Initializes Dexie (IndexedDB) when the app starts.
 * Renders children immediately — DB initialization is async and non-blocking.
 * Shows a minimal loading overlay only on first-ever visit (cold start).
 */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		// Open the database — triggers version 1 migrations
		db.open()
			.then(() => setReady(true))
			.catch((err) => {
				console.error("[OfflineProvider] IndexedDB open failed:", err);
				// Still mark ready so the app doesn't freeze
				setReady(true);
			});
	}, []);

	return <>{children}</>;
}
