"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
	Stethoscope,
	MapPin,
	CheckCircle2,
	Search,
	Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDoctors, useCities } from "@/features/public/hooks/useCatalog";
import type {
	City,
	Specialty,
	Doctor,
} from "@/features/public/types/catalog.types";

interface BookDoctorProps {
	onBookAppointment?: (doctor: Doctor) => void;
}

export function BookDoctorSection({ onBookAppointment }: BookDoctorProps) {
	const [selectedCity, setSelectedCity] = useState<string | undefined>();
	const [selectedSpecialty, setSelectedSpecialty] = useState<
		string | undefined
	>();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: doctorsData, isLoading } = useDoctors({
		city_id: selectedCity ? Number(selectedCity) : undefined,
		specialty_id: selectedSpecialty ? Number(selectedSpecialty) : undefined,
	});

	const { data: citiesData } = useCities();

	const cities: City[] = citiesData?.data ?? [];

	const specialties: Specialty[] = useMemo(() => {
		if (!doctorsData?.data) return [];
		const specialtyMap = new Map<number, Specialty>();
		doctorsData.data.forEach((doctor) => {
			doctor.specialties.forEach((s) => {
				if (!specialtyMap.has(s.id)) specialtyMap.set(s.id, s);
			});
		});
		return Array.from(specialtyMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [doctorsData]);

	const filteredDoctors = useMemo(() => {
		if (!doctorsData?.data) return [];
		if (!searchQuery.trim()) return doctorsData.data;
		const query = searchQuery.toLowerCase();
		return doctorsData.data.filter(
			(doctor) =>
				doctor.full_name.toLowerCase().includes(query) ||
				doctor.specialties.some((s) => s.name.toLowerCase().includes(query)),
		);
	}, [doctorsData, searchQuery]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="bg-white rounded-2xl border border-slate-100 p-6"
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-5">
				<div className="p-2 bg-[#23dce1]/10 rounded-xl">
					<Stethoscope className="w-5 h-5 text-[#23dce1]" />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-slate-900">
						Agendar una Cita
					</h2>
					<p className="text-sm text-slate-500">
						Buscá al médico que necesitás
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3 mb-5">
				<select
					value={selectedCity ?? ""}
					onChange={(e) => setSelectedCity(e.target.value || undefined)}
					className="w-full sm:w-44 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#23dce1]/20 focus:border-[#23dce1] transition-all"
				>
					<option value="">Todas las ciudades</option>
					{cities.map((city) => (
						<option key={city.id} value={city.id}>
							{city.name}
						</option>
					))}
				</select>

				<select
					value={selectedSpecialty ?? ""}
					onChange={(e) => setSelectedSpecialty(e.target.value || undefined)}
					className="w-full sm:w-48 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#23dce1]/20 focus:border-[#23dce1] transition-all"
				>
					<option value="">Todas las especialidades</option>
					{specialties.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>

				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<Input
						type="search"
						placeholder="Buscar médico..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-10 rounded-xl border border-slate-200 bg-white focus:border-[#23dce1] focus:ring-[#23dce1]/20"
					/>
				</div>
			</div>

			{/* Results count */}
			<div className="text-xs text-slate-500 mb-3">
				{filteredDoctors.length} médico{filteredDoctors.length !== 1 ? "s" : ""}{" "}
				encontrad{filteredDoctors.length !== 1 ? "os" : "o"}
			</div>

			{/* Doctors List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<div className="w-6 h-6 border-2 border-[#23dce1] border-t-transparent rounded-full animate-spin" />
				</div>
			) : filteredDoctors.length === 0 ? (
				<div className="text-center py-8 text-sm text-slate-500">
					No se encontraron médicos con esos filtros
				</div>
			) : (
				<div className="space-y-3 max-h-80 overflow-y-auto">
					{filteredDoctors.slice(0, 5).map((doctor) => (
						<DoctorBookingRow
							key={doctor.id}
							doctor={doctor}
							onBook={() => onBookAppointment?.(doctor)}
						/>
					))}
					{filteredDoctors.length > 5 && (
						<Button variant="ghost" className="w-full text-sm text-[#23dce1]">
							Ver todos ({filteredDoctors.length})
						</Button>
					)}
				</div>
			)}
		</motion.section>
	);
}

function DoctorBookingRow({
	doctor,
	onBook,
}: {
	doctor: Doctor;
	onBook: () => void;
}) {
	return (
		<div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-[#23dce1]/30 hover:bg-[#23dce1]/5 transition-all group">
			{/* Avatar */}
			<div className="relative shrink-0">
				{doctor.logo_url ? (
					<img
						src={doctor.logo_url}
						alt={doctor.full_name}
						className="w-12 h-12 rounded-full object-cover"
					/>
				) : (
					<div className="w-12 h-12 rounded-full bg-[#23dce1]/10 flex items-center justify-center">
						<span className="text-lg font-semibold text-[#23dce1]">
							{doctor.full_name.charAt(0)}
						</span>
					</div>
				)}
				{doctor.is_verified && (
					<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#23dce1] rounded-full flex items-center justify-center">
						<CheckCircle2 className="w-3 h-3 text-white" />
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<h3 className="font-medium text-slate-900 truncate text-sm">
						{doctor.full_name}
					</h3>
				</div>
				{doctor.specialties.length > 0 && (
					<p className="text-xs text-slate-500 truncate">
						{doctor.specialties[0].name}
						{doctor.specialties.length > 1 &&
							` +${doctor.specialties.length - 1}`}
					</p>
				)}
				{doctor.city && (
					<div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
						<MapPin className="w-3 h-3" />
						<span>{doctor.city.name}</span>
					</div>
				)}
			</div>

			{/* Book Button */}
			<Button
				size="sm"
				onClick={onBook}
				className="shrink-0 bg-[#23dce1] hover:bg-[#23dce1]/90 text-white transition-colors"
			>
				<Calendar className="w-4 h-4 mr-1" />
				Agendar
			</Button>
		</div>
	);
}
