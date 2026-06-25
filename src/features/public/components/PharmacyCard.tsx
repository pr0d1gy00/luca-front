import Image from "next/image";
import { MapPin, Phone, ExternalLink, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Pharmacy } from "../types/catalog.types";

interface PharmacyCardProps {
	pharmacy: Pharmacy;
}

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
	const openBranches = pharmacy.branches.filter((b) => b.is_open).length;

	return (
		<article className="group bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft overflow-hidden hover:shadow-md transition-all duration-200">
			{/* Accent border top */}
			<div className="h-1 bg-pharmako-care" />

			<div className="p-5 lg:p-6">
				{/* Header: Logo + Info */}
				<div className="flex items-start gap-4 mb-4">
					{/* Logo */}
					<div className="relative shrink-0">
						{pharmacy.logo_url ? (
							<Image
								src={pharmacy.logo_url}
								alt={pharmacy.commercial_name}
								width={64}
								height={64}
								className="rounded-lg object-cover ring-1 ring-pharmako-care-light"
							/>
						) : (
							<div className="w-16 h-16 rounded-lg bg-pharmako-care-light flex items-center justify-center">
								<Store className="w-8 h-8 text-pharmako-care" />
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<h3 className="font-semibold text-pharmako-text-primary truncate">
								{pharmacy.commercial_name}
							</h3>
							<Badge
								variant="secondary"
								className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
									pharmacy.is_open
										? "bg-pharmako-success-light text-pharmako-success"
										: "bg-pharmako-danger-light text-pharmako-danger"
								}`}
							>
								{pharmacy.is_open ? "Abierto" : "Cerrado"}
							</Badge>
						</div>

						{/* RIF */}
						<p className="text-xs text-pharmako-text-muted mt-0.5">
							{pharmacy.rif}
						</p>

						{/* Location */}
						{pharmacy.city && (
							<div className="flex items-center gap-1.5 text-sm text-pharmako-text-muted mt-1">
								<MapPin className="w-3.5 h-3.5 shrink-0" />
								<span>{pharmacy.city.name}</span>
							</div>
						)}
					</div>
				</div>

				{/* Address */}
				<div className="flex items-start gap-2 text-sm text-pharmako-text-secondary mb-3">
					<MapPin className="w-4 h-4 shrink-0 mt-0.5 text-pharmako-care" />
					<span className="line-clamp-2">{pharmacy.address}</span>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-pharmako-text-muted mb-4">
					<div className="flex items-center gap-1.5">
						<Store className="w-4 h-4 text-pharmako-care" />
						<span>
							{pharmacy.branches.length} sucursale
							{pharmacy.branches.length !== 1 ? "s" : ""}
						</span>
					</div>
					{openBranches > 0 && (
						<Badge
							variant="secondary"
							className="bg-pharmako-success-light text-pharmako-success text-xs"
						>
							{openBranches} abierta{openBranches !== 1 ? "s" : ""}
						</Badge>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex-1 border-pharmako-care text-pharmako-care hover:bg-pharmako-care hover:text-white transition-colors"
					>
						Ver sucursales
					</Button>
					{pharmacy.phone && (
						<Button
							size="icon"
							variant="outline"
							className="border-pharmako-care text-pharmako-care hover:bg-pharmako-care hover:text-white"
							asChild
						>
							<a href={`tel:${pharmacy.phone}`} aria-label="Llamar">
								<Phone className="w-4 h-4" />
							</a>
						</Button>
					)}
				</div>
			</div>
		</article>
	);
}
