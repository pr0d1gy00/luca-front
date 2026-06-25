import Image from "next/image";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doctor } from "../types/catalog.types";

interface DoctorCardProps {
	doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
	return (
		<article className="group bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft overflow-hidden hover:shadow-md transition-all duration-200">
			{/* Accent border top */}
			<div className="h-1 bg-pharmako-primary" />

			<div className="p-5 lg:p-6">
				{/* Header: Avatar + Info */}
				<div className="flex items-start gap-4 mb-4">
					{/* Avatar */}
					<div className="relative shrink-0">
						{doctor.logo_url ? (
							<Image
								src={doctor.logo_url}
								alt={doctor.full_name}
								width={64}
								height={64}
								className="rounded-full object-cover ring-2 ring-pharmako-primary-light"
							/>
						) : (
							<div className="w-16 h-16 rounded-full bg-pharmako-primary-light flex items-center justify-center">
								<span className="text-2xl font-semibold text-pharmako-primary">
									{doctor.full_name.charAt(0)}
								</span>
							</div>
						)}

						{/* Verified badge */}
						{doctor.is_verified && (
							<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pharmako-primary rounded-full flex items-center justify-center">
								<CheckCircle2 className="w-4 h-4 text-white" />
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-pharmako-text-primary truncate">
							{doctor.full_name}
						</h3>

						{/* City */}
						{doctor.city && (
							<div className="flex items-center gap-1.5 text-sm text-pharmako-text-muted mt-1">
								<MapPin className="w-3.5 h-3.5 shrink-0" />
								<span>{doctor.city.name}</span>
							</div>
						)}
					</div>
				</div>

				{/* Specialties */}
				{doctor.specialties.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mb-4">
						{doctor.specialties.slice(0, 3).map((specialty) => (
							<Badge
								key={specialty.id}
								variant="secondary"
								className="bg-pharmako-primary-light text-pharmako-primary text-xs font-medium px-2 py-0.5 rounded-full"
							>
								{specialty.name}
							</Badge>
						))}
						{doctor.specialties.length > 3 && (
							<Badge
								variant="secondary"
								className="bg-pharmako-canvas text-pharmako-text-muted text-xs px-2 py-0.5 rounded-full"
							>
								+{doctor.specialties.length - 3}
							</Badge>
						)}
					</div>
				)}

				{/* Actions */}
				<Button
					variant="outline"
					className="w-full border-pharmako-primary text-pharmako-primary hover:bg-pharmako-primary hover:text-white transition-colors"
				>
					Ver perfil
				</Button>
			</div>
		</article>
	);
}
