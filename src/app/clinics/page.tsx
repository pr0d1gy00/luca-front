"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Building2, MapPin, Globe, Users, Search, Phone, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "react-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicHeader from "@/components/PublicHeader";
import { useClinics, useCities, useDebounce } from "@/features/public";
import type { City } from "@/features/public/types/catalog.types";

// ─────────────────────────────────────────────────────────────
// Animation Variants — same style as landing
// ─────────────────────────────────────────────────────────────
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

const selectStyles = {
	control: (base: any, state: any) => ({
		...base,
		minHeight: "44px",
		height: "44px",
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

// ─────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────
export default function ClinicsPage() {
	const [selectedCity, setSelectedCity] = useState<string | undefined>();
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
	const [isDetailOpenOnMobile, setIsDetailOpenOnMobile] = useState(false);

	const debouncedSearch = useDebounce(searchQuery, 300);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
		setActiveClinicId(null);
	}, [selectedCity, debouncedSearch]);

	const parseFilterId = (val?: string) => {
		if (!val) return undefined;
		const num = Number(val);
		return isNaN(num) ? val : num;
	};

	const { data: clinicsData, isLoading } = useClinics({
		city_id: parseFilterId(selectedCity),
		page,
		per_page: 10,
		search: debouncedSearch.trim() || undefined,
	});

	const { data: citiesData } = useCities();

	const cities: City[] = citiesData?.data ?? [];

	const clinics = useMemo(() => {
		return clinicsData?.data ?? [];
	}, [clinicsData]);

	const activeClinic = useMemo(() => {
		if (!clinics || clinics.length === 0) return null;
		if (activeClinicId === null) return clinics[0];
		return clinics.find((c) => c.id === activeClinicId) ?? clinics[0];
	}, [clinics, activeClinicId]);

	const cityOptions = useMemo(() => {
		return [
			{ value: "", label: "Todas las ciudades" },
			...cities.map((city) => ({
				value: String(city.id),
				label: city.name,
			})),
		];
	}, [cities]);

	const selectedCityOption = useMemo(() => {
		return cityOptions.find((opt) => opt.value === (selectedCity ?? "")) || cityOptions[0];
	}, [cityOptions, selectedCity]);

	return (
		<div className="min-h-screen bg-white">
			{/* ── Same Header as Landing ── */}
			<PublicHeader />

			{/* ── Hero Section ── */}
			<motion.section
				className="w-full py-12 lg:py-16 px-4 sm:px-6 lg:px-12 bg-white border-b border-pharmako-border-soft"
				initial="hidden"
				animate="visible"
				variants={CONTAINER_VARIANTS}
			>
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<motion.div variants={FADE_UP_VARIANTS} className="mb-4">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-pharmako-care-light">
							<Building2 className="w-6 h-6 text-pharmako-care" />
						</div>
					</motion.div>

					{/* Title */}
					<motion.h1
						variants={FADE_UP_VARIANTS}
						className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pharmako-text-primary tracking-tight mb-3"
					>
						Clínicas y <span className="text-pharmako-care">Centros Médicos</span>
					</motion.h1>

					{/* Subtitle */}
					<motion.p
						variants={FADE_UP_VARIANTS}
						className="text-base sm:text-lg text-pharmako-text-secondary max-w-xl mx-auto mb-8"
					>
						Encuentra clínicas verificadas con doctores y especialistas listos para atenderte
					</motion.p>

					{/* Filters */}
					<motion.div
						variants={FADE_UP_VARIANTS}
						className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
					>
						{/* City Filter */}
						<div className="w-full sm:w-48 text-left">
							<Select
								instanceId="clinic-city-select"
								value={selectedCityOption}
								options={cityOptions}
								onChange={(newValue) => {
									setSelectedCity(newValue?.value || undefined);
									setActiveClinicId(null);
								}}
								styles={selectStyles}
								isSearchable={true}
								placeholder="Ciudad"
							/>
						</div>

						{/* Search */}
						<div className="relative flex-1 w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharmako-text-muted" />
							<Input
								type="search"
								placeholder="Buscar clínica..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setActiveClinicId(null);
								}}
								className="pl-10 h-11 rounded-xl border border-pharmako-border bg-white focus:border-pharmako-care focus:ring-pharmako-care/20 text-pharmako-text-primary placeholder:text-pharmako-text-muted"
							/>
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* ── Main Content Split View ── */}
			<section className="w-full bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<div className="w-8 h-8 border-3 border-pharmako-care border-t-transparent rounded-full animate-spin" />
								<p className="text-pharmako-text-secondary text-sm">Cargando catálogo...</p>
							</div>
						</div>
					) : clinics.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center py-20 text-center"
						>
							<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
								<Building2 className="w-8 h-8 text-pharmako-text-muted" />
							</div>
							<h3 className="text-lg font-semibold text-pharmako-text-primary mb-2">
								No se encontraron clínicas
							</h3>
							<p className="text-pharmako-text-secondary max-w-sm">
								Prueba buscando en otra ciudad o ajusta los criterios de búsqueda.
							</p>
						</motion.div>
					) : (
						<div className="flex flex-col md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr] gap-6 items-start">
							{/* Left Column: Clinics List */}
							<div
								className={`w-full flex-col gap-2 ${isDetailOpenOnMobile ? "hidden md:flex" : "flex"
									}`}
							>
								<div className="flex items-center justify-between px-2 mb-3">
									<h2 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
										Clínicas registradas ({clinicsData?.meta?.total ?? clinics.length})
									</h2>
								</div>

								<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 w-full max-h-[600px] md:max-h-[calc(100vh-280px)]">
									{clinics.map((clinic) => {
										const isSelected = activeClinic?.id === clinic.id;
										const mainBranch = clinic.branches.find((b) => b.is_main_branch) ?? clinic.branches[0];

										return (
											<div
												key={clinic.id}
												onClick={() => {
													setActiveClinicId(clinic.id);
													setIsDetailOpenOnMobile(true);
												}}
												className={`group p-3.5 cursor-pointer transition-all duration-200 flex items-center gap-3 ${isSelected
													? "border-b"
													: "bg-white hover:bg-slate-50/80 text-pharmako-text-secondary border-b rounded-none"
													}`}
											>
												{/* Avatar */}
												<div className="shrink-0">
													{clinic.logo_url ? (
														<img
															src={clinic.logo_url}
															alt={clinic.name}
															className="w-10 h-10 rounded-lg object-cover border border-pharmako-border-soft"
														/>
													) : (
														<div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-pharmako-border-soft ${isSelected
															? "bg-pharmako-care text-white"
															: "bg-slate-100 text-pharmako-text-muted"
															}`}>
															<Building2 className="w-5 h-5" />
														</div>
													)}
												</div>

												{/* Simple info */}
												<div className="min-w-0 flex-1">
													<h4 className={`font-semibold text-sm truncate ${isSelected ? "text-pharmako-care" : "text-pharmako-text-primary"
														}`}>
														{clinic.name}
													</h4>
													<p className="text-xs text-pharmako-text-secondary truncate mt-0.5">
														{clinic.rif}
													</p>
													{mainBranch?.city && (
														<p className="text-[11px] text-pharmako-text-muted mt-0.5 flex items-center gap-1">
															<MapPin className="w-3.5 h-3.5 text-pharmako-text-muted" />
															{mainBranch.city.name}
														</p>
													)}
												</div>
											</div>
										);
									})}
								</div>

								{/* Pagination Controls */}
								{clinicsData?.meta && clinicsData.meta.last_page > 1 && (
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
											Pág. {page} de {clinicsData.meta.last_page}
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => Math.min(p + 1, clinicsData.meta!.last_page))}
											disabled={page === clinicsData.meta.last_page}
											className="flex items-center gap-1 h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
										>
											<span>Siguiente</span>
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								)}
							</div>

							{/* Right Column: Clinic Detail Pane */}
							<div
								className={`w-full sticky top-24 ${isDetailOpenOnMobile ? "flex" : "hidden md:flex"
									}`}
							>
								{activeClinic && (
									<AnimatePresence mode="wait">
										<motion.div
											key={activeClinic.id}
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
												{/* Logo */}
												<div className="relative shrink-0">
													{activeClinic.logo_url ? (
														<img
															src={activeClinic.logo_url}
															alt={activeClinic.name}
															className="w-20 h-20 rounded-2xl object-cover border border-pharmako-border-soft shadow-sm"
														/>
													) : (
														<div className="w-20 h-20 rounded-2xl bg-pharmako-care-light flex items-center justify-center border border-pharmako-border-soft">
															<Building2 className="w-10 h-10 text-pharmako-care" />
														</div>
													)}
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<h2 className="text-xl sm:text-2xl font-bold text-pharmako-text-primary leading-tight">
															{activeClinic.name}
														</h2>
														<ShieldCheck className="w-5 h-5 text-pharmako-care shrink-0" />
													</div>
													<p className="text-sm text-pharmako-text-secondary mt-1">RIF: {activeClinic.rif}</p>

													{activeClinic.website && (
														<a
															href={activeClinic.website}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1.5 text-xs text-pharmako-care hover:text-pharmako-care-hover hover:underline mt-2 font-medium"
														>
															<Globe className="w-3.5 h-3.5 text-pharmako-care" />
															Visitar sitio web oficial
														</a>
													)}
												</div>
											</div>

											{/* Branches Section */}
											<div>
												<h3 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider mb-3">
													Sucursales ({activeClinic.branches.length})
												</h3>

												<div className="flex flex-col">
													{activeClinic.branches.map((branch) => {
														return (
															<div key={branch.id} className="py-5 border-b border-pharmako-border-soft last:border-0 last:pb-0 flex flex-col gap-4">
																<div className="flex items-start justify-between gap-4">
																	<div className="flex-1 min-w-0">
																		<div className="flex items-center gap-2 flex-wrap">
																			<h4 className="font-semibold text-pharmako-text-primary text-sm">
																				{branch.name}
																			</h4>
																			{branch.is_main_branch && (
																				<Badge className=" bg-white text-pharmako-care border border-pharmako-care/10 font-medium text-[12px] px-1.5 py-0">
																					Principal
																				</Badge>
																			)}
																		</div>
																		<p className="text-xs text-pharmako-text-secondary mt-1.5 flex items-start gap-1.5">
																			<MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-pharmako-text-muted" />
																			<span>{branch.address}</span>
																		</p>
																	</div>

																	{branch.google_maps_url && (
																		<a
																			href={branch.google_maps_url}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="text-xs text-pharmako-care hover:text-pharmako-care-hover hover:underline shrink-0 font-medium"
																		>
																			Cómo llegar
																		</a>
																	)}
																</div>

																{/* Metadata: Phone and City in a clean, inline layout */}
																<div className="flex items-center gap-4 text-xs text-pharmako-text-secondary flex-wrap">
																	<span className="flex items-center gap-1.5">
																		<Phone className="w-3.5 h-3.5 text-pharmako-text-muted" />
																		{branch.phone || "Sin teléfono"}
																	</span>

																	{branch.city && (
																		<span className="flex items-center gap-1.5">
																			<MapPin className="w-3.5 h-3.5 text-pharmako-text-muted" />
																			{branch.city.name}
																		</span>
																	)}
																</div>

																{/* Doctors inside this branch */}
																{branch.doctors && branch.doctors.length > 0 && (
																	<div className="pt-2">
																		<p className="text-[10px] font-semibold text-pharmako-text-muted uppercase tracking-wider mb-2">
																			Doctores en esta sucursal ({branch.doctors.length})
																		</p>
																		<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
																			{branch.doctors.map((doc) => (
																				<div key={doc.id} className="flex items-center gap-2 py-1.5">
																					{doc.logo_url ? (
																						<img
																							src={doc.logo_url}
																							alt={doc.full_name}
																							className="w-7 h-7 rounded-full object-cover border border-pharmako-border-soft"
																						/>
																					) : (
																						<div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-pharmako-border-soft text-pharmako-text-muted">
																							<Users className="w-3.5 h-3.5" />
																						</div>
																					)}
																					<div className="min-w-0">
																						<p className="text-xs font-semibold text-pharmako-text-primary truncate">
																							{doc.full_name}
																						</p>
																						{doc.department && (
																							<p className="text-[10px] text-pharmako-text-secondary truncate">
																								{doc.department} {doc.office_number ? `· Consultorio ${doc.office_number}` : ""}
																							</p>
																						)}
																					</div>
																				</div>
																			))}
																		</div>
																	</div>
																)}
															</div>
														);
													})}
												</div>
											</div>
										</motion.div>
									</AnimatePresence>
								)}
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
