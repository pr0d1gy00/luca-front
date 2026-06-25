"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CatalogGridProps {
	children: ReactNode;
	columns?: 1 | 2 | 3 | 4;
}

const COLUMN_CLASSES = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export function CatalogGrid({ children, columns = 3 }: CatalogGridProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0.2 }}
			className={`grid gap-5 ${COLUMN_CLASSES[columns]}`}
		>
			{children}
		</motion.div>
	);
}
