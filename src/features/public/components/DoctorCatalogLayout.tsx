"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Stethoscope, MapPin, CheckCircle2, Search, Calendar, Clock, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDoctors, useCities, useDebounce } from "@/features/public";
import type { City, Specialty, Doctor } from "@/features/public/types/catalog.types";

interface DoctorCatalogLayoutProps {
	onActionClick?: (doctor: Doctor) => void;
	actionLabel?: string;
	instanceIdPrefix?: string;
}

const FADE_UP_VARIANTS: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

const selectStyles = {
	control: (base: any, state: any) => ({
		...base,
		minHeight: "40px",
		height: "40px",
		borderRadius: "12px",
		borderColor: state.isFocused ? "#23dce1" : "#E2E8F0",
		boxShadow: state.isFocused ? "0 0 0 2px rgba(35, 220, 225, 0.2)" : "none",
		backgroundColor: "#FFFFFF",
		fontSize: "14px",
		fontFamily: "var(--font-sans)",
		color: "#0F172A",
		transition: "all 0.2s",
		"&:hover": {
			borderColor: state.isFocused ? "#23dce1" : "#cbd5e1"
		}
	}),
	valueContainer: (base: any) => ({
		...base,
		padding: "0 12px"
	}),
	input: (base: any) => ({
		...base,
		margin: 0,
		padding: 0,
		color: "#0F172A"
	}),
	singleValue: (base: any) => ({
		...base,
		color: "#0F172A",
		fontWeight: 500
	}),
	placeholder: (base: any) => ({
		...base,
		color: "#64748B"
	}),
	menu: (base: any) => ({
		...base,
		borderRadius: "12px",
		border: "1px solid #F0F1F3",
		boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
		zIndex: 50,
		backgroundColor: "#FFFFFF"
	}),
	option: (base: any, state: any) => ({
		...base,
		backgroundColor: state.isSelected
			? "#EBFAF3"
			: state.isFocused
				? "#FAF9F7"
				: "transparent",
		color: state.isSelected ? "#23DCE1" : "#0F172A",
		fontSize: "14px",
		cursor: "pointer",
		"&:active": {
			backgroundColor: "#EBFAF3"
		}
	})
};

export function DoctorCatalogLayout({
	onActionClick,
	actionLabel = "Agendar Cita Médica",
	instanceIdPrefix = "public"
}: DoctorCatalogLayoutProps) {
	const [selectedCity, setSelectedCity] = useState<string | undefined>();
	const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>();
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);

	const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);
	const [isDetailOpenOnMobile, setIsDetailOpenOnMobile] = useState(false);

	const debouncedSearch = useDebounce(searchQuery, 300);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
		setActiveDoctorId(null);
	}, [selectedCity, selectedSpecialty, debouncedSearch]);

	const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors({
		city_id: selectedCity ? Number(selectedCity) : undefined,
		specialty_id: selectedSpecialty ? Number(selectedSpecialty) : undefined,
		page,
		per_page: 10,
		search: debouncedSearch.trim() || undefined,
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

	const doctors = useMemo(() => {
		return doctorsData?.data ?? [];
	}, [doctorsData]);

	const activeDoctor = useMemo(() => {
		if (!doctors || doctors.length === 0) return null;
		if (activeDoctorId === null) return doctors[0];
		return doctors.find((d) => d.id === activeDoctorId) ?? doctors[0];
	}, [doctors, activeDoctorId]);

	const cityOptions = useMemo(() => {
		return [
			{ value: "", label: "Todas las ciudades" },
			...cities.map((city) => ({
				value: String(city.id),
				label: city.name,
			})),
		];
	}, [cities]);

	const specialtyOptions = useMemo(() => {
		return [
			{ value: "", label: "Todas las especialidades" },
			...specialties.map((s) => ({
				value: String(s.id),
				label: s.name,
			})),
		];
	}, [specialties]);

	const selectedCityOption = useMemo(() => {
		return cityOptions.find((opt) => opt.value === (selectedCity ?? "")) || cityOptions[0];
	}, [cityOptions, selectedCity]);

	const selectedSpecialtyOption = useMemo(() => {
		return specialtyOptions.find((opt) => opt.value === (selectedSpecialty ?? "")) || specialtyOptions[0];
	}, [specialtyOptions, selectedSpecialty]);

	return (
		<div className="w-full">
			{/* Filters */}
			<motion.div
				variants={FADE_UP_VARIANTS}
				initial="hidden"
				animate="visible"
				className="flex flex-col sm:flex-row items-center gap-3 mb-8 max-w-3xl"
			>
				{/* City Filter */}
				<div className="w-full sm:w-48 text-left">
					<Select
						instanceId={`${instanceIdPrefix}-city-select`}
						value={selectedCityOption}
						options={cityOptions}
						onChange={(newValue) => {
							setSelectedCity(newValue?.value || undefined);
							setActiveDoctorId(null);
						}}
						styles={selectStyles}
						isSearchable={true}
						placeholder="Ciudad"
					/>
				</div>

				{/* Specialty Filter */}
				<div className="w-full sm:w-56 text-left">
					<Select
						instanceId={`${instanceIdPrefix}-specialty-select`}
						value={selectedSpecialtyOption}
						options={specialtyOptions}
						onChange={(newValue) => {
							setSelectedSpecialty(newValue?.value || undefined);
							setActiveDoctorId(null);
						}}
						styles={selectStyles}
						isSearchable={true}
						placeholder="Especialidad"
					/>
				</div>

				{/* Search */}
				<div className="relative flex-1 w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharmako-text-muted" />
					<Input
						type="search"
						placeholder="Buscar doctor por nombre o especialidad..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setActiveDoctorId(null);
						}}
						className="pl-10 h-10 rounded-xl border border-pharmako-border bg-white focus:border-pharmako-care focus:ring-pharmako-care/20 text-pharmako-text-primary placeholder:text-pharmako-text-muted"
					/>
				</div>
			</motion.div>

			{/* Main content grid */}
			{isLoadingDoctors ? (
				<div className="flex items-center justify-center py-20">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-3 border-pharmako-care border-t-transparent rounded-full animate-spin" />
						<p className="text-pharmako-text-secondary text-sm">Cargando catálogo...</p>
					</div>
				</div>
			) : doctors.length === 0 ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col items-center justify-center py-20 text-center"
				>
					<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
						<Stethoscope className="w-8 h-8 text-pharmako-text-muted" />
					</div>
					<h3 className="text-lg font-semibold text-pharmako-text-primary mb-2">
						No se encontraron médicos
					</h3>
					<p className="text-pharmako-text-secondary max-w-sm">
						Prueba con otros filtros o busca en otra ciudad.
					</p>
				</motion.div>
			) : (
				<div className="flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 items-start">
					{/* Left Column: Doctors List */}
					<div
						className={`w-full flex-col gap-2 ${isDetailOpenOnMobile ? "hidden md:flex" : "flex"
							}`}
					>
						<div className="flex items-center justify-between px-2 mb-3">
							<h2 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
								Médicos disponibles ({doctorsData?.meta?.total ?? doctors.length})
							</h2>
						</div>

						<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 w-full max-h-[600px] md:max-h-[calc(100vh-280px)]">
							{doctors.map((doctor) => {
								const isSelected = activeDoctor?.id === doctor.id;
								return (
									<div
										key={doctor.id}
										onClick={() => {
											setActiveDoctorId(doctor.id);
											setIsDetailOpenOnMobile(true);
										}}
										className={`group p-3.5 cursor-pointer transition-all duration-200 flex items-center gap-3 ${isSelected
											? "border-b"
											: "bg-white hover:bg-slate-50/80 text-pharmako-text-secondary border-b rounded-none"
											}`}
									>
										{/* Avatar */}
										<div className="shrink-0">
											{doctor.logo_url ? (
												<img
													src={doctor.logo_url}
													alt={doctor.full_name}
													className="w-10 h-10 rounded-lg object-cover border border-pharmako-border-soft"
												/>
											) : (
												<div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-pharmako-border-soft ${isSelected ? "bg-pharmako-care text-white" : "bg-slate-100 text-pharmako-text-muted"
													}`}>
													<span className="text-sm font-bold">
														{doctor.full_name.charAt(0)}
													</span>
												</div>
											)}
										</div>

										{/* Simple info */}
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-1.5">
												<h4 className={`font-semibold text-sm truncate ${isSelected ? "text-pharmako-care" : "text-pharmako-text-primary"
													}`}>
													{doctor.full_name}
												</h4>
												{doctor.is_verified && (
													<CheckCircle2 className="w-3.5 h-3.5 text-pharmako-care fill-pharmako-care-light shrink-0" />
												)}
											</div>
											<p className="text-xs text-pharmako-text-secondary truncate mt-0.5">
												{doctor.specialties.map((s) => s.name).join(", ")}
											</p>
											{doctor.city && (
												<p className="text-[11px] text-pharmako-text-muted mt-0.5 flex items-center gap-1">
													<MapPin className="w-3.5 h-3.5 text-pharmako-text-muted" />
													{doctor.city.name}
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>

						{/* Pagination Controls */}
						{doctorsData?.meta && doctorsData.meta.last_page > 1 && (
							<div className="flex items-center justify-between mt-4 px-2 py-3 border-t border-slate-100 text-sm">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page === 1}
									className="flex items-center gap-1 h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
								>
									<ChevronLeft className="w-4 h-4" />
									<span>Anterior</span>
								</Button>
								<span className="text-slate-500 font-medium">
									Pág. {page} de {doctorsData.meta.last_page}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(p + 1, doctorsData.meta!.last_page))}
									disabled={page === doctorsData.meta.last_page}
									className="flex items-center gap-1 h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
								>
									<span>Siguiente</span>
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						)}
					</div>

					{/* Right Column: Doctor Detail Pane */}
					<div
						className={`w-full sticky top-24 ${isDetailOpenOnMobile ? "flex" : "hidden md:flex"
							}`}
					>
						{activeDoctor && (
							<AnimatePresence mode="wait">
								<motion.div
									key={activeDoctor.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2 }}
									className="w-full p-6 lg:p-8 bg-white border border-pharmako-border rounded-2xl flex flex-col gap-6"
								>
									{/* Mobile Back Button */}
									<button
										onClick={() => setIsDetailOpenOnMobile(false)}
										className="md:hidden self-start flex items-center gap-1.5 text-xs text-pharmako-text-secondary hover:text-pharmako-care mb-2"
									>
										<ArrowLeft className="w-4 h-4" />
										Volver al listado
									</button>

									{/* Detail Header */}
									<div className="flex items-start gap-5 pb-5 border-b border-pharmako-border-soft">
										{/* Big Avatar */}
										<div className="relative shrink-0">
											{activeDoctor.logo_url ? (
												<img
													src={activeDoctor.logo_url}
													alt={activeDoctor.full_name}
													className="w-20 h-20 rounded-2xl object-cover border border-pharmako-border-soft shadow-sm"
												/>
											) : (
												<div className="w-20 h-20 rounded-2xl bg-pharmako-care-light flex items-center justify-center border border-pharmako-border-soft">
													<span className="text-3xl font-bold text-pharmako-care">
														{activeDoctor.full_name.charAt(0)}
													</span>
												</div>
											)}
											{activeDoctor.is_verified && (
												<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pharmako-care rounded-full flex items-center justify-center shadow-md">
													<CheckCircle2 className="w-4 h-4 text-white fill-pharmako-care" />
												</div>
											)}
										</div>

										{/* Name and Quick Specs */}
										<div className="min-w-0 flex-1">
											<h2 className="text-xl sm:text-2xl font-bold text-pharmako-text-primary leading-tight">
												{activeDoctor.full_name}
											</h2>

											{/* Specialties */}
											{activeDoctor.specialties.length > 0 && (
												<div className="flex flex-wrap gap-1.5 mt-2">
													{activeDoctor.specialties.map((specialty) => (
														<span
															key={specialty.id}
															className="inline-flex items-center text-xs font-semibold text-pharmako-care px-2.5 py-0.5 rounded-md"
														>
															{specialty.name}
														</span>
													))}
												</div>
											)}
										</div>
									</div>

									{/* Detail Body */}
									<div className="grid gap-6 sm:grid-cols-2">
										{/* Info Block: Location */}
										<div className="flex gap-3">
											<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
												<MapPin className="w-5 h-5 text-pharmako-text-secondary" />
											</div>
											<div>
												<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
													Ubicación de Consulta
												</h4>
												<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
													{activeDoctor.city?.name ?? "No especificada"}
												</p>
												<p className="text-xs text-pharmako-text-secondary mt-0.5">
													Sucursal Principal, Consulta Presencial
												</p>
											</div>
										</div>

										{/* Info Block: Verification */}
										<div className="flex gap-3">
											<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
												<ShieldCheck className="w-5 h-5 text-pharmako-text-secondary" />
											</div>
											<div>
												<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
													Estado de Verificación
												</h4>
												<p className="text-sm font-semibold text-pharmako-text-primary mt-1 flex items-center gap-1.5">
													{activeDoctor.is_verified ? (
														<>
															<span className="w-2 h-2 rounded-full bg-emerald-500" />
															Médico Verificado LUCA
														</>
													) : (
														<>
															<span className="w-2 h-2 rounded-full bg-amber-500" />
															Registro en Proceso
														</>
													)}
												</p>
												<p className="text-xs text-pharmako-text-secondary mt-0.5">
													Credenciales y licencia médica validadas
												</p>
											</div>
										</div>

										{/* Info Block: Availability */}
										<div className="flex gap-3">
											<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
												<Clock className="w-5 h-5 text-pharmako-text-secondary" />
											</div>
											<div>
												<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
													Horario de Atención
												</h4>
												<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
													Lunes a Viernes
												</p>
												<p className="text-xs text-pharmako-text-secondary mt-0.5">
													08:00 AM - 05:00 PM (Previa Cita)
												</p>
											</div>
										</div>

										{/* Info Block: Modality */}
										<div className="flex gap-3">
											<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
												<Calendar className="w-5 h-5 text-pharmako-text-secondary" />
											</div>
											<div>
												<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
													Modalidad
												</h4>
												<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
													Telemedicina & Presencial
												</p>
												<p className="text-xs text-pharmako-text-secondary mt-0.5">
													Soporta recetas digitales integradas
												</p>
											</div>
										</div>
									</div>

									{/* Callout Notice */}
									<div className="p-4 border-t text-xs text-pharmako-text-secondary flex gap-2.5">
										<ShieldCheck className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
										<p>
											Este profesional de la salud está plenamente habilitado para emitir recetas digitales y órdenes médicas que se sincronizarán directamente con tu aplicación LUCA.
										</p>
									</div>

									{/* Booking Action */}
									{onActionClick && (
										<div className="pt-2">
											<Button
												onClick={() => onActionClick(activeDoctor)}
												className="w-full h-12 bg-pharmako-care hover:bg-pharmako-care/90 text-white text-base py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
											>
												{actionLabel}
											</Button>
										</div>
									)}
								</motion.div>
							</AnimatePresence>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
