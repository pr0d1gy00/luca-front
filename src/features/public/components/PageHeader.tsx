"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
	title: string;
	description?: string;
	variant?: "doctors" | "pharmacies" | "clinics";
	backHref?: string;
	action?: ReactNode;
	filters?: ReactNode;
}

const VARIANT_COLORS = {
	doctors: {
		accent: "bg-pharmako-primary",
		text: "text-pharmako-primary",
		border: "border-pharmako-primary/20",
	},
	pharmacies: {
		accent: "bg-pharmako-care",
		text: "text-pharmako-care",
		border: "border-pharmako-care/20",
	},
	clinics: {
		accent: "bg-pharmako-accent",
		text: "text-pharmako-accent",
		border: "border-pharmako-accent/20",
	},
} as const;

export function PageHeader({
	title,
	description,
	variant = "doctors",
	backHref = "/",
	action,
	filters,
}: PageHeaderProps) {
	const colors = VARIANT_COLORS[variant];

	return (
		<div className="space-y-6">
			{/* Back link */}
			<Link href={backHref}>
				<Button
					variant="ghost"
					className="pl-0 text-pharmako-text-muted hover:text-pharmako-text-primary"
				>
					<ChevronLeft className="w-4 h-4 mr-1" />
					Volver al inicio
				</Button>
			</Link>

			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className={`relative rounded-2xl p-8 lg:p-10 overflow-hidden bg-gradient-to-br from-${colors.accent.replace("bg-", "")}/5 via-white to-white border ${colors.border}`}
			>
				{/* Decorative elements */}
				<div
					className={`absolute top-0 right-0 w-64 h-64 rounded-full bg-${colors.accent.replace("bg-", "")}/10 blur-3xl`}
				/>
				<div
					className={`absolute bottom-0 left-0 w-48 h-48 rounded-full bg-${colors.accent.replace("bg-", "")}/5 blur-2xl`}
				/>

				<div className="relative">
					{/* Accent bar */}
					<div className={`w-12 h-1.5 ${colors.accent} rounded-full mb-4`} />

					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
						<div className="flex-1">
							<h1 className="text-3xl lg:text-4xl font-bold text-pharmako-text-primary tracking-tight">
								{title}
							</h1>
							{description && (
								<p className="mt-2 text-pharmako-text-secondary max-w-xl">
									{description}
								</p>
							)}
						</div>

						{action && <div className="shrink-0">{action}</div>}
					</div>
				</div>
			</motion.div>

			{/* Filters */}
			{filters && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
					className="flex flex-col sm:flex-row gap-3"
				>
					{filters}
				</motion.div>
			)}
		</div>
	);
}
