"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { BookingModal } from "@/features/appointments";
import { DoctorCatalogLayout, type Doctor } from "@/features/public";

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

export default function BookingPage() {
	const user = useAuthStore((s) => s.user) as { uuid?: string } | null;
	const patientUuid = user?.uuid ?? "";

	const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

	return (
		<div className="min-h-screen bg-transparent max-w-7xl mx-auto">
			{/* Header / Intro */}
			<motion.div
				className="w-full pb-8 bg-transparent border-b border-pharmako-border-soft mb-8"
				initial="hidden"
				animate="visible"
				variants={CONTAINER_VARIANTS}
			>
				<div className="max-w-4xl">
					<motion.div variants={FADE_UP_VARIANTS} className="flex items-center gap-3 mb-2">
						<div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl ">
							<Stethoscope className="w-8 h-8 text-pharmako-care" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-pharmako-text-primary tracking-tight">
								Agendar una Cita Médica
							</h1>
							<p className="text-xs sm:text-sm text-pharmako-text-secondary">
								Buscá especialistas verificados en tu zona y reservá en el instante
							</p>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* Main Content Split View */}
			<div className="w-full">
				<DoctorCatalogLayout
					onActionClick={(doctor) => setBookingDoctor(doctor)}
					actionLabel="Agendar Cita Médica"
					instanceIdPrefix="booking"
				/>
			</div>

			{/* Booking Modal */}
			{bookingDoctor && (
				<BookingModal
					open={!!bookingDoctor}
					onOpenChange={(open) => !open && setBookingDoctor(null)}
					doctor={{
						uuid: bookingDoctor.id, // catalog uses `id` as string UUID
						fullName: bookingDoctor.full_name,
						specialtyName: bookingDoctor.specialties[0]?.name ?? "",
						logoUrl: bookingDoctor.logo_url,
						clinics: bookingDoctor.clinics,
					}}
					patientUuid={patientUuid}
					onSuccess={() => setBookingDoctor(null)}
				/>
			)}
		</div>
	);
}
