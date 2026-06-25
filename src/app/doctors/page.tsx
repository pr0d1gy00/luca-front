"use client";

import { motion, type Variants } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import { DoctorCatalogLayout } from "@/features/public";

const CONTAINER_VARIANTS: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.08, delayChildren: 0.1 },
	},
};

const FADE_UP_VARIANTS: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

export default function DoctorsPage() {
	const router = useRouter();

	const handleActionClick = () => {
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Public Header */}
			<PublicHeader />

			{/* Hero Section */}
			<motion.section
				className="w-full py-12 lg:py-16 px-4 sm:px-6 lg:px-12 bg-white border-b border-pharmako-border-soft"
				initial="hidden"
				animate="visible"
				variants={CONTAINER_VARIANTS}
			>
				<div className="max-w-4xl mx-auto text-center">
					<motion.div variants={FADE_UP_VARIANTS} className="mb-4">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl">
							<Stethoscope className="w-10 h-10 text-pharmako-care" />
						</div>
					</motion.div>

					<motion.h1
						variants={FADE_UP_VARIANTS}
						className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pharmako-text-primary tracking-tight mb-3"
					>
						Encuentra tu <span className="text-pharmako-care">Médico</span>
					</motion.h1>

					<motion.p
						variants={FADE_UP_VARIANTS}
						className="text-base sm:text-lg text-pharmako-text-secondary max-w-xl mx-auto"
					>
						Doctores verificados en tu zona, listos para atenderte
					</motion.p>
				</div>
			</motion.section>

			{/* Catalog Split View */}
			<section className="w-full bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<DoctorCatalogLayout
						onActionClick={handleActionClick}
						actionLabel="Agendar Cita Médica"
						instanceIdPrefix="public"
					/>
				</div>
			</section>
		</div>
	);
}
