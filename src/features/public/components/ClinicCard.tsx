import Image from "next/image";
import { MapPin, Globe, Users, Building2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Clinic } from "../types/catalog.types";

interface ClinicCardProps {
	clinic: Clinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
	const mainBranch =
		clinic.branches.find((b) => b.is_main_branch) ?? clinic.branches[0];
	const totalDoctors = clinic.branches.reduce(
		(sum, b) => sum + b.doctors.length,
		0,
	);

	return (
		<article className="group bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft overflow-hidden hover:shadow-md transition-all duration-200">
			{/* Accent border top */}
			<div className="h-1 bg-pharmako-accent" />

			<div className="p-5 lg:p-6">
				{/* Header: Logo + Info */}
				<div className="flex items-start gap-4 mb-4">
					{/* Logo */}
					<div className="relative shrink-0">
						{clinic.logo_url ? (
							<Image
								src={clinic.logo_url}
								alt={clinic.name}
								width={64}
								height={64}
								className="rounded-lg object-cover ring-1 ring-pharmako-accent-light"
							/>
						) : (
							<div className="w-16 h-16 rounded-lg bg-pharmako-accent-light flex items-center justify-center">
								<Building2 className="w-8 h-8 text-pharmako-accent" />
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-pharmako-text-primary truncate">
							{clinic.name}
						</h3>

						{/* RIF */}
						<p className="text-xs text-pharmako-text-muted mt-0.5">
							{clinic.rif}
						</p>

						{/* Website */}
						{clinic.website && (
							<a
								href={clinic.website}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm text-pharmako-accent hover:underline mt-1"
							>
								<Globe className="w-3.5 h-3.5" />
								<span className="truncate max-w-[150px]">Sitio web</span>
								<ExternalLink className="w-3 h-3 shrink-0" />
							</a>
						)}
					</div>
				</div>

				{/* Main branch info */}
				{mainBranch && (
					<div className="flex items-start gap-2 text-sm text-pharmako-text-secondary mb-3">
						<MapPin className="w-4 h-4 shrink-0 mt-0.5 text-pharmako-accent" />
						<div>
							<p className="font-medium text-pharmako-text-primary">
								{mainBranch.name}
							</p>
							<p className="text-pharmako-text-muted text-xs line-clamp-1">
								{mainBranch.address}
							</p>
						</div>
					</div>
				)}

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-pharmako-text-muted mb-4">
					<div className="flex items-center gap-1.5">
						<Building2 className="w-4 h-4 text-pharmako-accent" />
						<span>
							{clinic.branches.length} sucursale
							{clinic.branches.length !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Users className="w-4 h-4 text-pharmako-accent" />
						<span>
							{totalDoctors} doctor{totalDoctors !== 1 ? "es" : ""}
						</span>
					</div>
				</div>

				{/* Featured doctors */}
				{totalDoctors > 0 && (
					<div className="mb-4">
						<p className="text-xs text-pharmako-text-muted mb-2">
							Doctores destacados
						</p>
						<div className="flex flex-wrap gap-1">
							{clinic.branches
								.flatMap((b) => b.doctors)
								.slice(0, 3)
								.map((doctor) => (
									<Badge
										key={doctor.id}
										variant="secondary"
										className="bg-pharmako-accent-light text-pharmako-accent text-xs font-normal"
									>
										{doctor.full_name}
									</Badge>
								))}
							{totalDoctors > 3 && (
								<Badge
									variant="secondary"
									className="bg-pharmako-canvas text-pharmako-text-muted text-xs"
								>
									+{totalDoctors - 3}
								</Badge>
							)}
						</div>
					</div>
				)}

				{/* Actions */}
				<Button
					variant="outline"
					className="w-full border-pharmako-accent text-pharmako-accent hover:bg-pharmako-accent hover:text-white transition-colors"
				>
					Ver todas las sucursales
				</Button>
			</div>
		</article>
	);
}
