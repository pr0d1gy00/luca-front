"use client";

import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { City, Specialty } from "../types/catalog.types";

interface CatalogFiltersProps {
	variant?: "doctors" | "pharmacies" | "clinics";
	cities?: City[];
	specialties?: Specialty[];
	selectedCity?: string;
	selectedSpecialty?: string;
	searchQuery?: string;
	onCityChange?: (cityId: string | undefined) => void;
	onSpecialtyChange?: (specialtyId: string | undefined) => void;
	onSearchChange?: (query: string) => void;
}

const VARIANT_ICONS = {
	doctors: "text-pharmako-primary",
	pharmacies: "text-pharmako-care",
	clinics: "text-pharmako-accent",
} as const;

export function CatalogFilters({
	variant = "doctors",
	cities = [],
	specialties = [],
	selectedCity,
	selectedSpecialty,
	searchQuery = "",
	onCityChange,
	onSpecialtyChange,
	onSearchChange,
}: CatalogFiltersProps) {
	const iconColor = VARIANT_ICONS[variant];

	return (
		<div className="bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft p-4">
			<div className="flex flex-col lg:flex-row gap-3">
				{/* City filter */}
				<div className="w-full lg:w-48 shrink-0">
					<Select
						value={selectedCity ?? "all"}
						onValueChange={(value: string) =>
							onCityChange?.(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="border-pharmako-border bg-white">
							<MapPin className={`w-4 h-4 mr-2 ${iconColor}`} />
							<SelectValue placeholder="Ciudad" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas las ciudades</SelectItem>
							{cities.map((city) => (
								<SelectItem key={city.id} value={String(city.id)}>
									{city.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Specialty filter (doctors only) */}
				{variant === "doctors" && specialties.length > 0 && (
					<div className="w-full lg:w-56 shrink-0">
						<Select
							value={selectedSpecialty ?? "all"}
							onValueChange={(value: string) =>
								onSpecialtyChange?.(value === "all" ? undefined : value)
							}
						>
							<SelectTrigger className="border-pharmako-border bg-white">
								<SelectValue placeholder="Especialidad" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas las especialidades</SelectItem>
								{specialties.map((specialty) => (
									<SelectItem key={specialty.id} value={String(specialty.id)}>
										{specialty.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Search */}
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharmako-text-muted" />
						<Input
							type="search"
							placeholder="Buscar..."
							value={searchQuery}
							onChange={(e) => onSearchChange?.(e.target.value)}
							className="pl-10 border-pharmako-border bg-white"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
