"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Pill, MapPin, Phone, Store, Search, Clock, ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicHeader from "@/components/PublicHeader";
import { usePharmacies, useCities } from "@/features/public/hooks/useCatalog";
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

const CARD_VARIANTS: Variants = {
	hidden: { opacity: 0, y: 30 },
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
export default function PharmaciesPage() {
	const [selectedCity, setSelectedCity] = useState<string | undefined>();
	const [searchQuery, setSearchQuery] = useState("");
	const [activePharmacyId, setActivePharmacyId] = useState<number | null>(null);
	const [isDetailOpenOnMobile, setIsDetailOpenOnMobile] = useState(false);

	const { data: pharmaciesData, isLoading } = usePharmacies({
		city_id: selectedCity ? Number(selectedCity) : undefined,
	});

	const { data: citiesData } = useCities();

	const cities: City[] = citiesData?.data ?? [];

	const filteredPharmacies = useMemo(() => {
		if (!pharmaciesData?.data) return [];
		if (!searchQuery.trim()) return pharmaciesData.data;
		const query = searchQuery.toLowerCase();
		return pharmaciesData.data.filter(
			(p) =>
				p.commercial_name.toLowerCase().includes(query) ||
				p.address.toLowerCase().includes(query) ||
				p.city?.name.toLowerCase().includes(query),
		);
	}, [pharmaciesData, searchQuery]);

	const activePharmacy = useMemo(() => {
		if (!filteredPharmacies || filteredPharmacies.length === 0) return null;
		if (activePharmacyId === null) return filteredPharmacies[0];
		return filteredPharmacies.find((p) => p.id === activePharmacyId) ?? filteredPharmacies[0];
	}, [filteredPharmacies, activePharmacyId]);

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
							<Pill className="w-6 h-6 text-pharmako-care" />
						</div>
					</motion.div>

					{/* Title */}
					<motion.h1
						variants={FADE_UP_VARIANTS}
						className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pharmako-text-primary tracking-tight mb-3"
					>
						Farmacias <span className="text-pharmako-care">Cercanas</span>
					</motion.h1>

					{/* Subtitle */}
					<motion.p
						variants={FADE_UP_VARIANTS}
						className="text-base sm:text-lg text-pharmako-text-secondary max-w-xl mx-auto mb-8"
					>
						Encuentra farmacias abiertas en tu zona con entrega de medicamentos
					</motion.p>

					{/* Filters */}
					<motion.div
						variants={FADE_UP_VARIANTS}
						className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
					>
						<div className="w-full sm:w-48 text-left">
							<Select
								instanceId="pharmacy-city-select"
								value={selectedCityOption}
								options={cityOptions}
								onChange={(newValue) => {
									setSelectedCity(newValue?.value || undefined);
									setActivePharmacyId(null);
								}}
								styles={selectStyles}
								isSearchable={true}
								placeholder="Ciudad"
							/>
						</div>

						<div className="relative flex-1 w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharmako-text-muted" />
							<Input
								type="search"
								placeholder="Buscar farmacia..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setActivePharmacyId(null);
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
					) : filteredPharmacies.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center py-20 text-center"
						>
							<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
								<Pill className="w-8 h-8 text-pharmako-text-muted" />
							</div>
							<h3 className="text-lg font-semibold text-pharmako-text-primary mb-2">
								No se encontraron farmacias
							</h3>
							<p className="text-pharmako-text-secondary max-w-sm">
								Prueba buscando en otra ciudad.
							</p>
						</motion.div>
					) : (
						<div className="flex flex-col md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr] gap-6 items-start">
							{/* Left Column: Pharmacies List */}
							<div
								className={`w-full flex-col gap-2 ${isDetailOpenOnMobile ? "hidden md:flex" : "flex"
									}`}
							>
								<div className="flex items-center justify-between px-2 mb-3">
									<h2 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
										Farmacias registradas ({filteredPharmacies.length})
									</h2>
								</div>

								<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 w-full max-h-[600px] md:max-h-[calc(100vh-280px)]">
									{filteredPharmacies.map((pharmacy) => {
										const isSelected = activePharmacy?.id === pharmacy.id;
										return (
											<div
												key={pharmacy.id}
												onClick={() => {
													setActivePharmacyId(pharmacy.id);
													setIsDetailOpenOnMobile(true);
												}}
												className={`group p-3.5 cursor-pointer transition-all duration-200 flex items-center gap-3 ${isSelected
													? "border-b"
													: "bg-white hover:bg-slate-50/80 text-pharmako-text-secondary border-b rounded-none"
													}`}
											>
												{/* Avatar */}
												<div className="shrink-0">
													{pharmacy.logo_url ? (
														<img
															src={pharmacy.logo_url}
															alt={pharmacy.commercial_name}
															className="w-10 h-10 rounded-lg object-cover border border-pharmako-border-soft"
														/>
													) : (
														<div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-pharmako-border-soft ${isSelected
															? "bg-pharmako-care text-white"
															: "bg-slate-100 text-pharmako-text-muted"
															}`}>
															<Store className="w-5 h-5" />
														</div>
													)}
												</div>

												{/* Simple info */}
												<div className="min-w-0 flex-1">
													<h4 className={`font-semibold text-sm truncate ${isSelected ? "text-pharmako-care" : "text-pharmako-text-primary"
														}`}>
														{pharmacy.commercial_name}
													</h4>
													<p className="text-xs text-pharmako-text-secondary truncate mt-0.5">
														{pharmacy.rif}
													</p>
													{pharmacy.city && (
														<p className="text-[11px] text-pharmako-text-muted mt-0.5 flex items-center gap-1">
															<MapPin className="w-3.5 h-3.5" />
															{pharmacy.city.name}
														</p>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Right Column: Pharmacy Detail Pane */}
							<div
								className={`w-full sticky top-24 ${isDetailOpenOnMobile ? "flex" : "hidden md:flex"
									}`}
							>
								{activePharmacy && (
									<AnimatePresence mode="wait">
										<motion.div
											key={activePharmacy.id}
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
													{activePharmacy.logo_url ? (
														<img
															src={activePharmacy.logo_url}
															alt={activePharmacy.commercial_name}
															className="w-20 h-20 rounded-2xl object-cover border border-pharmako-border-soft shadow-sm"
														/>
													) : (
														<div className="w-20 h-20 rounded-2xl bg-pharmako-care-light flex items-center justify-center border border-pharmako-border-soft">
															<Store className="w-10 h-10 text-pharmako-care" />
														</div>
													)}
												</div>

												{/* Name and Quick Specs */}
												<div className="min-w-0 flex-1">
													<div className="flex items-start justify-between gap-3 flex-wrap">
														<h2 className="text-xl lg:text-2xl font-bold text-pharmako-text-primary">
															{activePharmacy.commercial_name}
														</h2>
														<span
															className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${activePharmacy.is_open
																? "bg-emerald-50 text-emerald-700 border border-emerald-100"
																: "bg-red-50 text-red-700 border border-red-100"
																}`}
														>
															{activePharmacy.is_open ? "Abierto" : "Cerrado"}
														</span>
													</div>
													<p className="text-xs text-pharmako-text-muted mt-1">
														RIF: {activePharmacy.rif}
													</p>
												</div>
											</div>

											{/* Detail Body */}
											<div className="grid gap-6 sm:grid-cols-2">
												{/* Info Block: Location */}
												<div className="flex gap-3">
													<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
														<MapPin className="w-5 h-5 text-pharmako-text-secondary" />
													</div>
													<div className="min-w-0">
														<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
															Dirección Principal
														</h4>
														<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
															{activePharmacy.city?.name ?? "No especificada"}
														</p>
														<p className="text-xs text-pharmako-text-secondary mt-0.5 break-words">
															{activePharmacy.address}
														</p>
													</div>
												</div>

												{/* Info Block: Branches */}
												<div className="flex gap-3">
													<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
														<Building2 className="w-5 h-5 text-pharmako-text-secondary" />
													</div>
													<div>
														<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
															Sucursales
														</h4>
														<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
															{activePharmacy.branches.length} sucursales registradas
														</p>
														<p className="text-xs text-pharmako-text-secondary mt-0.5">
															{activePharmacy.branches.filter((b) => b.is_open).length} sucursales abiertas actualmente
														</p>
													</div>
												</div>

												{/* Info Block: Contact */}
												{activePharmacy.phone && (
													<div className="flex gap-3">
														<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
															<Phone className="w-5 h-5 text-pharmako-text-secondary" />
														</div>
														<div>
															<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
																Teléfono de Contacto
															</h4>
															<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
																{activePharmacy.phone}
															</p>
															<a
																href={`tel:${activePharmacy.phone}`}
																className="text-xs text-pharmako-care hover:underline mt-0.5 block"
															>
																Llamar ahora
															</a>
														</div>
													</div>
												)}

												{/* Info Block: Integration */}
												<div className="flex gap-3">
													<div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center border border-pharmako-border-soft">
														<ShieldCheck className="w-5 h-5 text-pharmako-text-secondary" />
													</div>
													<div>
														<h4 className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
															Integración LUCA
														</h4>
														<p className="text-sm font-semibold text-pharmako-text-primary mt-1">
															Sincronización de Recetas
														</p>
														<p className="text-xs text-pharmako-text-secondary mt-0.5">
															Despacho inmediato de recetas digitales
														</p>
													</div>
												</div>
											</div>

											{/* Notice */}
											<div className="p-4 border-t border-pharmako-border-soft text-xs text-pharmako-text-secondary flex gap-2.5">
												<Pill className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
												<p>
													Esta farmacia está enlazada al sistema LUCA. Podés comprar tus medicamentos recetados y validar tus recetas directamente en caja o solicitar envío a domicilio.
												</p>
											</div>

											{/* Action Buttons */}
											<div className="flex gap-3 pt-2">
												<Button
													className="flex-1 h-12 bg-pharmako-care hover:bg-pharmako-care-hover text-white text-base py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
												>
													Ver sucursales
												</Button>
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
