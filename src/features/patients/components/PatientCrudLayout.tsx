"use client";

import { useState } from "react";
import {
	Plus,
	User,
	FileText,
	Calendar,
	Phone,
	Mail,
	MapPin,
	Droplet,
	UserCheck,
	AlertTriangle,
	ShieldAlert,
	Heart,
	Trash2,
	ArrowUpRight,
	Download,
	Users,
	Clock,
	ShieldAlert as ShieldIcon,
	UserX,
	Activity,
	HeartHandshake,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PatientTable } from "./PatientTable";
import { PatientForm } from "./PatientForm";
import type { Patient } from "../types";
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "../hooks/usePatients";
import { ScheduleFollowUpModal } from "@/features/consultations/components/ScheduleFollowUpModal";
import { bloodTypeLabels, biologicalSexLabels } from "../schemas";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { ClinicalHistoryTimeline } from "@/features/consultations";
import { ClinicGreeting } from "@/features/clinic-dashboard/components/ClinicGreeting";

interface PatientCrudLayoutProps {
	patients?: Patient[];
}

const MOCK_PATIENTS: Patient[] = [
	{
		firstName: "Juan",
		lastName: "Pérez",
		nationalId: "12.345.678",
		birthDate: "1988-05-12",
		gender: "male",
		phone: "+54 11 1234-5678",
		email: "juan.perez@mail.com",
		address: "Av. Rivadavia 1234, CABA",
		bloodType: "O_POSITIVE",
		allergies: "Penicilina, Polen",
		chronicConditions: "Hipertensión",
		emergencyContactName: "María Pérez (Cónyuge)",
		emergencyContactPhone: "+54 11 9876-5432",
	},
	{
		firstName: "Ana",
		lastName: "Gómez",
		nationalId: "23.456.789",
		birthDate: "1995-10-24",
		gender: "female",
		phone: "+54 11 5555-4321",
		email: "ana.gomez@mail.com",
		address: "Calle Corrientes 500, CABA",
		bloodType: "A_POSITIVE",
		allergies: "Aspirina",
		chronicConditions: "",
		emergencyContactName: "Pedro Gómez (Padre)",
		emergencyContactPhone: "+54 11 9999-8888",
	},
	{
		firstName: "Carlos",
		lastName: "Rodríguez",
		nationalId: "08.765.432",
		birthDate: "1954-03-15",
		gender: "male",
		phone: "+54 11 4321-8765",
		email: "carlos.rod@mail.com",
		address: "Av. Santa Fe 3456, CABA",
		bloodType: "O_NEGATIVE",
		allergies: "Penicilina, AINEs",
		chronicConditions: "Diabetes Tipo II, Hipertensión",
		emergencyContactName: "",
		emergencyContactPhone: "",
	},
	{
		firstName: "María Luz",
		lastName: "Ortega",
		nationalId: "48.123.456",
		birthDate: "2015-08-05",
		gender: "female",
		phone: "+54 11 8765-4321",
		email: "maria.luz@mail.com",
		address: "Pueyrredón 800, CABA",
		bloodType: "B_POSITIVE",
		allergies: "Polen",
		chronicConditions: "",
		emergencyContactName: "Lucía Ortega (Madre)",
		emergencyContactPhone: "+54 11 6543-2109",
	},
	{
		firstName: "Sofía",
		lastName: "Martínez",
		nationalId: "10.234.567",
		birthDate: "1961-11-30",
		gender: "female",
		phone: "+54 11 9999-1111",
		email: "sofia.martinez@mail.com",
		address: "Av. Cabildo 1500, CABA",
		bloodType: "AB_POSITIVE",
		allergies: "",
		chronicConditions: "Hipotiroidismo",
		emergencyContactName: "Esteban Martínez (Hijo)",
		emergencyContactPhone: "+54 11 2222-3333",
	},
] as any[] as Patient[];

interface HistoryEntry {
	id: string;
	date: Date;
	motivo: string;
	diagnostico: string;
	doctorName: string;
}

const MOCK_CLINICAL_HISTORY: Record<string, HistoryEntry[]> = {
	"12.345.678": [
		{
			id: "hist-1",
			date: new Date("2026-05-10"),
			motivo: "Dolor de garganta persistente, fiebre de 38.5°C",
			diagnostico: "Faringitis aguda bacteriana",
			doctorName: "Dr. Luca Admin",
		},
		{
			id: "hist-2",
			date: new Date("2026-02-15"),
			motivo: "Control anual de rutina e Hipertensión",
			diagnostico: "Hipertensión arterial controlada",
			doctorName: "Dr. Luca Admin",
		},
	],
	"23.456.789": [
		{
			id: "hist-3",
			date: new Date("2026-04-20"),
			motivo: "Revisión por alergia cutánea tras ingesta de Aspirina",
			diagnostico: "Reacción alérgica a AINEs",
			doctorName: "Dr. Luca Admin",
		},
	],
	"08.765.432": [
		{
			id: "hist-4",
			date: new Date("2026-03-01"),
			motivo: "Fatiga extrema y control de glucemia",
			diagnostico: "Diabetes Mellitus Tipo II descompensada",
			doctorName: "Dr. Luca Admin",
		},
	],
};

type Mode = "view" | "create" | "edit" | "history";

function calculateAge(birthDate: Date): number {
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}
	return age;
}

export function PatientCrudLayout({
	patients: initialPatients,
}: PatientCrudLayoutProps) {
	const { data: serverPatients = [], isLoading } = usePatients();
	const list = initialPatients ?? serverPatients;

	const createPatient = useCreatePatient();
	const updatePatient = useUpdatePatient();
	const deletePatient = useDeletePatient();

	const [mode, setMode] = useState<Mode | null>(null);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
	const [selectedPatientForFollowUp, setSelectedPatientForFollowUp] = useState<Patient | null>(null);
	const [activeTab, setActiveTab] = useState<"resumen" | "lista">("resumen");
	const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const loadHistory = async (patient: Patient) => {
		setIsLoadingHistory(true);
		try {
			// 1. Obtener historia local de Dexie (offline)
			const localConsultations = await db.consultations
				.where("patientUuid")
				.equals(patient.uuid)
				.toArray();

			const localEntries: HistoryEntry[] = localConsultations.map((c) => ({
				id: c.uuid,
				date: new Date(c.date),
				motivo: c.reason || "Sin motivo registrado",
				diagnostico: c.diagnosis || "Sin diagnóstico registrado",
				doctorName: "Médico del Sistema (Local)",
			}));

			// 2. Intentar obtener historia del servidor (online)
			let apiEntries: HistoryEntry[] = [];
			try {
				const response = await apiClient.get("/consultations", {
					params: { patient_uuid: patient.uuid },
				});
				const consultations = response.data?.data?.data ?? response.data?.data ?? [];
				apiEntries = consultations.map((c: any) => ({
					id: c.uuid,
					date: new Date(c.date ?? c.created_at ?? ""),
					motivo: c.reason ?? "Sin motivo registrado",
					diagnostico: c.diagnosis ?? "Sin diagnóstico registrado",
					doctorName: c.user?.full_name ?? "Médico del Sistema",
				}));
			} catch (err) {
				console.warn("No se pudo obtener la historia desde la API, usando local:", err);
			}

			// 3. Mezclar y dedupular por UUID
			const allEntriesMap = new Map<string, HistoryEntry>();
			localEntries.forEach((e) => allEntriesMap.set(e.id, e));
			apiEntries.forEach((e) => allEntriesMap.set(e.id, e));

			const sorted = Array.from(allEntriesMap.values()).sort(
				(a, b) => b.date.getTime() - a.date.getTime(),
			);
			setHistoryEntries(sorted);
		} catch (error) {
			console.error("Error al cargar la historia clínica:", error);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	const handleCreate = () => {
		setSelectedPatient(null);
		setMode("create");
	};

	const handleEdit = (patient: Patient) => {
		setSelectedPatient(patient);
		setMode("edit");
	};

	const handleView = (patient: Patient) => {
		setSelectedPatient(patient);
		setMode("view");
	};

	const handleViewHistory = (patient: Patient) => {
		setSelectedPatient(patient);
		setMode("history");
		loadHistory(patient);
	};

	const handleDelete = (uuid: string) => {
		setDeleteConfirm(uuid);
	};

	const handleConfirmDelete = () => {
		if (deleteConfirm) {
			deletePatient.mutate(deleteConfirm, {
				onSuccess: () => {
					setDeleteConfirm(null);
				},
			});
		}
	};

	const handleSubmit = (data: Patient) => {
		if (mode === "create") {
			createPatient.mutate(data, {
				onSuccess: () => {
					setMode(null);
					setSelectedPatient(null);
				},
			});
		} else if (mode === "edit" && selectedPatient) {
			updatePatient.mutate(
				{
					uuid: selectedPatient.uuid,
					data,
				},
				{
					onSuccess: () => {
						setMode(null);
						setSelectedPatient(null);
					},
				},
			);
		}
	};

	const handleClose = () => {
		setMode(null);
		setSelectedPatient(null);
	};

	if (isLoading && !initialPatients) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pharmako-primary"></div>
			</div>
		);
	}

	// ── Cálculos Dinámicos para el Panel Clínico ─────────────────
	const totalPatients = list.length;
	const chronicPatients = list.filter(
		(p) => p.chronicConditions && p.chronicConditions.length > 0,
	).length;
	const allergicPatients = list.filter(
		(p) => p.allergies && p.allergies.length > 0,
	).length;

	// Monitoreo mayor: pacientes >= 60 años
	const geriatricPatients = list.filter(
		(p) => calculateAge(new Date(p.birthDate)) >= 60,
	).length;
	// Pediátricos: pacientes < 18 años
	const pediatricPatients = list.filter(
		(p) => calculateAge(new Date(p.birthDate)) < 18,
	).length;
	// Jóvenes: 18 a 29 años
	const youthPatients = list.filter((p) => {
		const age = calculateAge(new Date(p.birthDate));
		return age >= 18 && age < 30;
	}).length;
	// Adultos: 30 a 59 años
	const adultPatients = list.filter((p) => {
		const age = calculateAge(new Date(p.birthDate));
		return age >= 30 && age < 60;
	}).length;

	// Promedio de edad
	const averageAge =
		totalPatients > 0
			? Math.round(
				list.reduce(
					(sum, p) => sum + calculateAge(new Date(p.birthDate)),
					0,
				) / totalPatients,
			)
			: 0;

	// Pacientes complejos (Multipatología >= 2 condiciones crónicas)
	const complexPatients = list.filter(
		(p) =>
			p.chronicConditions &&
			p.chronicConditions.split(",").filter(Boolean).length >= 2,
	).length;

	// Tipo de sangre crítico en urgencias (O Negativo - Donante Universal)
	const oNegativePatients = list.filter(
		(p) => p.bloodType === "O_NEGATIVE",
	).length;

	// Distribución de Género
	const malePatients = list.filter((p) => p.gender === "male").length;
	const femalePatients = list.filter((p) => p.gender === "female").length;
	const malePercentage =
		totalPatients > 0 ? (malePatients / totalPatients) * 100 : 0;
	const femalePercentage =
		totalPatients > 0 ? (femalePatients / totalPatients) * 100 : 0;

	// Alertas críticas: Pacientes sin contacto de emergencia registrado
	const missingEmergencyContact = list.filter((p) => !p.emergencyContactName);

	// Ranking de Alergias Frecuentes
	const allAllergies = list.flatMap((p) =>
		(p.allergies || "")
			.split(",")
			.map((s: string) => s.trim())
			.filter(Boolean),
	);
	const allergyCounts = allAllergies.reduce(
		(acc, curr) => {
			acc[curr] = (acc[curr] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topAllergies = Object.entries(allergyCounts)
		.map(([name, count]) => ({
			name,
			count,
			percentage: totalPatients > 0 ? (count / totalPatients) * 100 : 0,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 3);

	// Ranking de Patologías Crónicas Frecuentes
	const allChronic = list.flatMap((p) =>
		(p.chronicConditions || "")
			.split(",")
			.map((s: string) => s.trim())
			.filter(Boolean),
	);
	const chronicCounts = allChronic.reduce(
		(acc, curr) => {
			acc[curr] = (acc[curr] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topChronic = Object.entries(chronicCounts)
		.map(([name, count]) => ({
			name,
			count,
			percentage: totalPatients > 0 ? (count / totalPatients) * 100 : 0,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 3);
	return (
		<div className="flex flex-col gap-6">
			{/* Page Header Outside Table */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">
						Fichas de Pacientes
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Gestioná la información personal, constantes demográficas y
						antecedentes clínicos de la nómina.
					</p>
				</div>
				<Button
					onClick={handleCreate}
					className="gap-2 rounded-xl bg-pharmako-primary text-white hover:bg-pharmako-primary-hover h-11 px-6 font-semibold transition-all duration-200 active:scale-[0.98] self-start sm:self-auto shrink-0"
				>
					<Plus className="size-5" />
					Nuevo Paciente
				</Button>
			</div>

			{/* Tab Switcher */}
			<div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit">
				<button
					onClick={() => setActiveTab("resumen")}
					className={cn(
						"px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
						activeTab === "resumen"
							? "bg-slate-50 text-pharmako-care"
							: "text-slate-400 hover:text-slate-605",
					)}
				>
					Resumen
				</button>
				<button
					onClick={() => setActiveTab("lista")}
					className={cn(
						"px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
						activeTab === "lista"
							? "bg-slate-50 text-pharmako-care"
							: "text-slate-400 hover:text-slate-605",
					)}
				>
					Lista
				</button>
			</div>

			{/* Conditional View Rendering */}
			{activeTab === "resumen" ? (
				<div className="flex flex-col gap-6">
					{/* Quick Actions Row */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<button
							onClick={handleCreate}
							className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer"
						>
							<div className="flex items-center gap-3">
								<div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
									<Plus className="w-5 h-5" />
								</div>
								<div>
									<span className="block text-sm font-bold text-slate-900">
										Registrar Paciente
									</span>
									<span className="block text-xs text-slate-500 mt-0.5">
										Crear ficha clínica
									</span>
								</div>
							</div>
							<ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
						</button>

						<button
							onClick={() => setActiveTab("lista")}
							className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer"
						>
							<div className="flex items-center gap-3">
								<div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
									<Users className="w-5 h-5" />
								</div>
								<div>
									<span className="block text-sm font-bold text-slate-900">
										Ver Fichas
									</span>
									<span className="block text-xs text-slate-500 mt-0.5">
										Buscar y editar fichas
									</span>
								</div>
							</div>
							<ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
						</button>

						<button
							onClick={() => { }}
							className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between text-left transition-all duration-200 hover:border-pharmako-care hover:bg-pharmako-care-light/5 hover:-translate-y-0.5 group cursor-pointer"
						>
							<div className="flex items-center gap-3">
								<div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care group-hover:scale-110 transition-transform">
									<Download className="w-5 h-5" />
								</div>
								<div>
									<span className="block text-sm font-bold text-slate-900">
										Exportar Fichas
									</span>
									<span className="block text-xs text-slate-500 mt-0.5">
										Descargar PDF/Excel
									</span>
								</div>
							</div>
							<ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-pharmako-care transition-colors" />
						</button>
					</div>

					{/* Metric Cards Grid - 6 Column Layout */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
						{/* Card 1: Nómina Activa */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Nómina Activa
								</span>
								<div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
									<Users className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{totalPatients}
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									Pacientes registrados
								</span>
							</div>
						</div>

						{/* Card 2: Promedio de Edad */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Edad Promedio
								</span>
								<div className="bg-sky-50 rounded-lg p-2 text-sky-600">
									<Activity className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{averageAge}{" "}
									<span className="text-sm font-medium text-slate-500">
										años
									</span>
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									Población general
								</span>
							</div>
						</div>

						{/* Card 3: Control Crónico */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Control Crónico
								</span>
								<div className="bg-amber-50 rounded-lg p-2 text-amber-600">
									<ShieldIcon className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{chronicPatients}
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									{totalPatients > 0
										? ((chronicPatients / totalPatients) * 100).toFixed(0)
										: 0}
									% bajo tratamiento
								</span>
							</div>
						</div>

						{/* Card 4: Casos Complejos */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Casos Complejos
								</span>
								<div className="bg-purple-50 rounded-lg p-2 text-purple-600">
									<HeartHandshake className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{complexPatients}
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									Multipatología (2+)
								</span>
							</div>
						</div>

						{/* Card 5: Riesgo por Alergia */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Riesgo Alergia
								</span>
								<div className="bg-red-50 rounded-lg p-2 text-red-600">
									<AlertTriangle className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{allergicPatients}
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									Requieren alerta recetaria
								</span>
							</div>
						</div>

						{/* Card 6: Donantes Universales */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
							<div className="flex items-center justify-between">
								<span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
									Sangre Crítica
								</span>
								<div className="bg-rose-50 rounded-lg p-2 text-rose-600">
									<Droplet className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-3">
								<span className="text-3xl font-bold text-slate-900 tracking-tight">
									{oNegativePatients}
								</span>
								<span className="block text-xs text-slate-400 mt-1">
									Grupo O Negativo
								</span>
							</div>
						</div>
					</div>

					{/* Gráficos e Información Avanzada */}
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
						{/* Columna 1: Distribución por Edad */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
							<div className="flex items-center justify-between mb-4">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Distribución por Edad
								</span>
								<span className="text-[10px] font-semibold text-pharmako-care bg-pharmako-care-light px-2 py-0.5 rounded-full">
									Por grupo etario
								</span>
							</div>
							<div className="space-y-2.5">
								<div className="space-y-1">
									<div className="flex justify-between text-xs text-slate-700">
										<span className="font-medium">
											Pediatría ({"< 18 años"})
										</span>
										<span className="font-bold">
											{pediatricPatients} pac. (
											{totalPatients > 0
												? ((pediatricPatients / totalPatients) * 100).toFixed(0)
												: 0}
											%)
										</span>
									</div>
									<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
										<div
											className="bg-sky-400 h-full rounded-full"
											style={{
												width: `${totalPatients > 0 ? (pediatricPatients / totalPatients) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-xs text-slate-700">
										<span className="font-medium">Jóvenes (18 - 29 años)</span>
										<span className="font-bold">
											{youthPatients} pac. (
											{totalPatients > 0
												? ((youthPatients / totalPatients) * 100).toFixed(0)
												: 0}
											%)
										</span>
									</div>
									<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
										<div
											className="bg-teal-400 h-full rounded-full"
											style={{
												width: `${totalPatients > 0 ? (youthPatients / totalPatients) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-xs text-slate-700">
										<span className="font-medium">Adultos (30 - 59 años)</span>
										<span className="font-bold">
											{adultPatients} pac. (
											{totalPatients > 0
												? ((adultPatients / totalPatients) * 100).toFixed(0)
												: 0}
											%)
										</span>
									</div>
									<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
										<div
											className="bg-indigo-400 h-full rounded-full"
											style={{
												width: `${totalPatients > 0 ? (adultPatients / totalPatients) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-xs text-slate-700">
										<span className="font-medium">
											Geriátrico ({">= 60 años"})
										</span>
										<span className="font-bold">
											{geriatricPatients} pac. (
											{totalPatients > 0
												? ((geriatricPatients / totalPatients) * 100).toFixed(0)
												: 0}
											%)
										</span>
									</div>
									<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
										<div
											className="bg-amber-400 h-full rounded-full"
											style={{
												width: `${totalPatients > 0 ? (geriatricPatients / totalPatients) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Columna 2: Distribución de Género Biológico */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
							<div className="flex items-center justify-between mb-4">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Género Biológico
								</span>
								<span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
									Demográfico
								</span>
							</div>
							<div className="flex flex-col justify-center gap-4 my-auto">
								<div className="flex justify-between text-xs">
									<div className="flex items-center gap-2">
										<div className="size-3 rounded-full bg-pharmako-care" />
										<span className="text-slate-600 font-medium">
											Masculino
										</span>
									</div>
									<span className="font-bold text-slate-800">
										{malePatients} pac. ({malePercentage.toFixed(0)}%)
									</span>
								</div>
								<div className="flex justify-between text-xs">
									<div className="flex items-center gap-2">
										<div className="size-3 rounded-full bg-indigo-500" />
										<span className="text-slate-600 font-medium">Femenino</span>
									</div>
									<span className="font-bold text-slate-800">
										{femalePatients} pac. ({femalePercentage.toFixed(0)}%)
									</span>
								</div>
								<div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex mt-2">
									<div
										className="bg-pharmako-care h-full"
										style={{ width: `${malePercentage}%` }}
									/>
									<div
										className="bg-indigo-500 h-full"
										style={{ width: `${femalePercentage}%` }}
									/>
								</div>
							</div>
						</div>

						{/* Columna 3: Patologías Crónicas más Comunes */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Patologías Frecuentes
								</span>
								<span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
									Prevalencia
								</span>
							</div>
							<div className="space-y-3">
								{topChronic.length > 0 ? (
									topChronic.map((item, idx) => (
										<div key={idx} className="space-y-1">
											<div className="flex items-center justify-between text-xs">
												<span className="font-semibold text-slate-800 truncate max-w-[150px]">
													{item.name}
												</span>
												<span className="text-slate-450 font-medium">
													{item.count} pac.
												</span>
											</div>
											<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
												<div
													className="bg-amber-500 h-full rounded-full transition-all duration-500"
													style={{ width: `${item.percentage}%` }}
												/>
											</div>
										</div>
									))
								) : (
									<div className="text-xs text-slate-400 italic text-center py-8">
										Sin patologías registradas en la nómina
									</div>
								)}
							</div>
						</div>

						{/* Columna 4: Alergias Más Comunes */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Alergias más declaradas
								</span>
								<span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
									Alertas críticas
								</span>
							</div>
							<div className="space-y-3">
								{topAllergies.length > 0 ? (
									topAllergies.map((item, idx) => (
										<div key={idx} className="space-y-1">
											<div className="flex items-center justify-between text-xs">
												<span className="font-semibold text-slate-800 truncate max-w-[150px]">
													{item.name}
												</span>
												<span className="text-slate-450 font-medium">
													{item.count} pac.
												</span>
											</div>
											<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
												<div
													className="bg-red-500 h-full rounded-full transition-all duration-500"
													style={{ width: `${item.percentage}%` }}
												/>
											</div>
										</div>
									))
								) : (
									<div className="text-xs text-slate-400 italic text-center py-8">
										No hay alergias registradas en la nómina
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Alertas Clínicas y Casos Complejos */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Alertas de Fichas */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[180px]">
							<div className="flex items-center justify-between mb-4">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Alertas de Fichas e Información Faltante
								</span>
								<div className="bg-red-50 rounded-lg p-1.5 text-red-500">
									<UserX className="w-4 h-4" />
								</div>
							</div>
							<div className="space-y-3">
								{missingEmergencyContact.length > 0 ? (
									<>
										<div className="flex items-start gap-2.5 bg-red-50/50 border border-red-100 rounded-xl p-3">
											<AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
											<div>
												<span className="block text-xs font-bold text-red-800">
													Contacto de Emergencia Faltante
												</span>
												<span className="block text-[11px] text-red-700/80 mt-0.5">
													{missingEmergencyContact.length} ficha
													{missingEmergencyContact.length !== 1 ? "s" : ""} no
													tiene{missingEmergencyContact.length !== 1 ? "n" : ""}{" "}
													número de contacto de urgencia.
												</span>
												<div className="flex flex-wrap gap-1 mt-2">
													{missingEmergencyContact.map((p, i) => (
														<Badge
															key={i}
															variant="outline"
															className="bg-white text-red-700 border-red-150 text-[9px] py-0 px-1.5 font-bold"
														>
															{p.firstName} {p.lastName}
														</Badge>
													))}
												</div>
											</div>
										</div>
										<p className="text-[10px] text-slate-400 italic">
											Recomendamos completar esta información en la próxima
											consulta presencial.
										</p>
									</>
								) : (
									<div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
										<div className="text-emerald-600 shrink-0">✔</div>
										<div>
											<span className="block text-xs font-bold text-emerald-800">
												Fichas 100% completas
											</span>
											<span className="block text-[11px] text-emerald-700 mt-0.5">
												Todos tus pacientes tienen contacto de emergencia
												registrado.
											</span>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Casos Complejos Prioritarios */}
						<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[180px]">
							<div className="flex items-center justify-between mb-4">
								<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
									Pacientes Multipatología Activos
								</span>
								<div className="bg-purple-50 rounded-lg p-1.5 text-purple-600">
									<HeartHandshake className="w-4 h-4" />
								</div>
							</div>
							<div className="space-y-3">
								{complexPatients > 0 ? (
									<div className="space-y-2">
										<p className="text-xs text-slate-500">
											Pacientes con múltiples comorbilidades crónicas que
											requieren monitoreo estricto de dosis farmacológicas:
										</p>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
											{list
												.filter(
													(p) =>
														p.chronicConditions &&
														p.chronicConditions.split(",").filter(Boolean)
															.length >= 2,
												)
												.map((p, idx) => (
													<div
														key={idx}
														className="bg-purple-50/30 border border-purple-100/50 rounded-lg p-2.5 text-xs flex flex-col gap-1"
													>
														<span className="font-bold text-purple-900">
															{p.firstName} {p.lastName}
														</span>
														<div className="flex flex-wrap gap-1 mt-0.5">
															{(p.chronicConditions || "")
																.split(",")
																.filter(Boolean)
																.map((cond: string, i: number) => (
																	<Badge
																		key={i}
																		className="text-[8px] bg-purple-100 text-purple-800 border-none font-semibold py-0 px-1"
																	>
																		{cond.trim()}
																	</Badge>
																))}
														</div>
													</div>
												))}
										</div>
									</div>
								) : (
									<div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-500 italic">
										Ningún paciente en la nómina tiene comorbilidades complejas
										simultáneas.
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Altas Recientes - Fila Completa */}
					<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
								Pacientes Incorporados Recientemente
							</span>
							<div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
								<Clock className="w-4 h-4" />
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{list
								.slice(-3)
								.reverse()
								.map((p, idx) => (
									<div
										key={idx}
										onClick={() => handleView(p)}
										className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between hover:border-pharmako-care hover:bg-pharmako-care-light/5 transition-all duration-200 cursor-pointer group"
									>
										<div>
											<div className="flex justify-between items-start gap-2">
												<span className="block text-xs font-bold text-slate-900 truncate group-hover:text-pharmako-care transition-colors">
													{p.firstName} {p.lastName}
												</span>
												<Badge
													variant="outline"
													className="text-[8px] uppercase tracking-wider px-1.5 py-0 bg-white border-slate-200 text-slate-500 rounded-full font-bold shrink-0"
												>
													{(p.bloodType || "")
														.replace("_POSITIVE", "+")
														.replace("_NEGATIVE", "-")}
												</Badge>
											</div>
											<span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
												DNI {p.nationalId}
											</span>
										</div>
										<div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
											<span className="text-[10px] font-bold text-slate-500">
												{calculateAge(new Date(p.birthDate))} años
											</span>
											<span className="text-[10px] text-pharmako-care font-semibold group-hover:translate-x-0.5 transition-transform">
												Ficha →
											</span>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			) : (
				<PatientTable
					patients={list}
					onCreate={handleCreate}
					onEdit={handleEdit}
					onView={handleView}
					onDelete={handleDelete}
					onViewClinicalHistory={handleViewHistory}
					onScheduleFollowUp={(patient) => {
						setSelectedPatientForFollowUp(patient);
						setIsFollowUpOpen(true);
					}}
				/>
			)}
			<Sheet
				open={mode === "create" || mode === "edit"}
				onOpenChange={(open) => !open && handleClose()}
			>
				<SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
					<SheetHeader className="p-0 pb-5 border-b border-slate-100">
						<SheetTitle className="text-slate-900 font-semibold text-lg">
							{mode === "create" ? "Nuevo Paciente" : "Editar Paciente"}
						</SheetTitle>
						<SheetDescription className="text-slate-500 text-sm">
							{mode === "create"
								? "Completá los datos del nuevo paciente en tu nómina."
								: `Editando datos de ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
						</SheetDescription>
					</SheetHeader>
					<div className="mt-6">
						<PatientForm
							initialData={selectedPatient ?? undefined}
							onSubmit={handleSubmit}
							onCancel={handleClose}
						/>
					</div>
				</SheetContent>
			</Sheet>

			{/* View Sheet */}
			<Sheet
				open={mode === "view"}
				onOpenChange={(open) => !open && handleClose()}
			>
				<SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
					<SheetHeader className="p-0 pb-5 border-b border-slate-100">
						<SheetTitle className="text-slate-900 font-semibold text-lg">
							Detalle del Paciente
						</SheetTitle>
					</SheetHeader>
					{selectedPatient && (
						<div className="mt-6 space-y-6">
							{/* Sección 1: Identidad */}
							<div className="rounded-2xl p-6 space-y-5">
								<h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
									Identidad y Datos Biológicos
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
									{/* Nombre */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<User className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Nombre completo
											</span>
											<span
												className="block text-sm font-bold text-slate-900 mt-0.5 truncate"
												title={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
											>
												{selectedPatient.firstName} {selectedPatient.lastName}
											</span>
										</div>
									</div>

									{/* Cédula */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<FileText className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Documento / DNI
											</span>
											<span
												className="block text-sm font-semibold text-slate-900 mt-0.5 truncate"
												title={selectedPatient.nationalId}
											>
												{selectedPatient.nationalId}
											</span>
										</div>
									</div>

									{/* Fecha de Nacimiento */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<Calendar className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Edad y Nacimiento
											</span>
											<span className="block text-sm font-semibold text-slate-900 mt-0.5 truncate">
												{calculateAge(new Date(selectedPatient.birthDate))} años
												(
												{new Date(
													selectedPatient.birthDate,
												).toLocaleDateString()}
												)
											</span>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									{/* Sexo */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<UserCheck className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Sexo biológico
											</span>
											<span className="block text-sm font-semibold text-slate-900 mt-0.5">
												{biologicalSexLabels[selectedPatient.gender.toLowerCase() as keyof typeof biologicalSexLabels]}
											</span>
										</div>
									</div>

									{/* Grupo Sanguíneo */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<Droplet className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Grupo Sanguíneo
											</span>
											<Badge
												variant="outline"
												className="rounded-full bg-teal-50 border-teal-100 text-teal-700 font-semibold px-2.5 py-0.5 mt-1"
											>
												{bloodTypeLabels[selectedPatient.bloodType || ""]}
											</Badge>
										</div>
									</div>
								</div>
							</div>

							{/* Sección 2: Contacto */}
							<div className="rounded-2xl p-6 space-y-5">
								<h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
									Información de Contacto
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									{/* Teléfono */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<Phone className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Teléfono
											</span>
											<span className="block text-sm font-semibold text-slate-900 mt-0.5">
												{selectedPatient.phone}
											</span>
										</div>
									</div>

									{/* Correo */}
									<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
										<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
											<Mail className="size-5" />
										</div>
										<div className="min-w-0">
											<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Correo electrónico
											</span>
											<span
												className="block text-sm font-semibold text-slate-900 mt-0.5 truncate"
												title={selectedPatient.email}
											>
												{selectedPatient.email}
											</span>
										</div>
									</div>
								</div>

								{/* Dirección */}
								<div className="bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all hover:border-slate-350 hover:bg-pharmako-care-light/5">
									<div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
										<MapPin className="size-5" />
									</div>
									<div className="min-w-0 flex-1">
										<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
											Dirección de residencia
										</span>
										<span className="block text-sm font-semibold text-slate-900 mt-0.5">
											{selectedPatient.address}
										</span>
									</div>
								</div>
							</div>

							{/* Sección 3: Historial clínico básico */}
							<div className="rounded-2xl p-6 space-y-5">
								<h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
									Antecedentes y Alergias
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									{/* Alergias */}
									<div className="bg-white rounded-xl p-4 flex flex-col gap-2.5 transition-all hover:border-slate-350">
										<div className="flex items-center gap-2">
											<div className="bg-red-50 rounded-xl p-2 text-red-500 shrink-0">
												<AlertTriangle className="size-5" />
											</div>
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Alergias registradas
											</span>
										</div>
										<div className="flex flex-wrap gap-1.5 mt-1">
											{selectedPatient.allergies &&
												selectedPatient.allergies.length > 0 ? (
												selectedPatient.allergies
													.split(",")
													.map((a: string, i: number) => (
														<Badge
															key={i}
															variant="outline"
															className="rounded-full bg-red-50 border-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold"
														>
															{a}
														</Badge>
													))
											) : (
												<span className="text-xs text-slate-400 italic">
													Sin alergias conocidas
												</span>
											)}
										</div>
									</div>

									{/* Crónicas */}
									<div className="bg-white rounded-xl p-4 flex flex-col gap-2.5 transition-all hover:border-slate-350">
										<div className="flex items-center gap-2">
											<div className="bg-amber-50 rounded-xl p-2 text-amber-500 shrink-0">
												<ShieldAlert className="size-5" />
											</div>
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Condiciones Crónicas
											</span>
										</div>
										<div className="flex flex-wrap gap-1.5 mt-1">
											{selectedPatient.chronicConditions &&
												selectedPatient.chronicConditions.length > 0 ? (
												selectedPatient.chronicConditions
													.split(",")
													.map((c: string, i: number) => (
														<Badge
															key={i}
															variant="outline"
															className="rounded-full bg-slate-100 border-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-semibold"
														>
															{c}
														</Badge>
													))
											) : (
												<span className="text-xs text-slate-400 italic">
													Ninguna registrada
												</span>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Sección 4: Emergencia */}
							{(selectedPatient.emergencyContactName ||
								selectedPatient.emergencyContactPhone) && (
									<div className="rounded-2xl p-6 space-y-5">
										<h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200/60">
											Contacto de Emergencia
										</h3>
										<div className="bg-white rounded-xl p-5 flex items-start gap-4 transition-all hover:border-slate-350">
											<div className="bg-emerald-50 rounded-xl p-3 text-emerald-600 shrink-0">
												<Heart className="size-6" />
											</div>
											<div className="min-w-0 flex-1">
												<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
													Familiar o Responsable
												</span>
												<p className="text-sm font-semibold text-slate-800 mt-2 bg-slate-50/50 border border-slate-200/50 rounded-xl p-3 flex flex-col gap-1">
													<span>
														<strong>Nombre:</strong>{" "}
														{selectedPatient.emergencyContactName || "—"}
													</span>
													<span>
														<strong>Teléfono:</strong>{" "}
														{selectedPatient.emergencyContactPhone || "—"}
													</span>
												</p>
											</div>
										</div>
									</div>
								)}

							<div className="flex justify-end pt-3">
								<Button
									variant="outline"
									onClick={handleClose}
									className="rounded-xl h-11 px-6 font-semibold transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
								>
									Cerrar Ficha
								</Button>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Clinical History Sheet */}
			<Sheet
				open={mode === "history"}
				onOpenChange={(open) => !open && handleClose()}
			>
				<SheetContent className="w-full sm:max-w-xl md:max-w-2xl xl:max-w-3xl overflow-y-auto bg-white rounded-l-2xl border-l border-slate-200 p-8 md:p-10 lg:p-12">
					<SheetHeader className="p-0 pb-5 border-b border-slate-100">
						<SheetTitle className="text-slate-900 font-semibold text-lg flex items-center gap-2">
							<FileText className="w-5 h-5 text-pharmako-care" />
							Historia Clínica del Paciente
						</SheetTitle>
						<SheetDescription className="text-slate-500 text-sm">
							{selectedPatient
								? `Línea de tiempo de consultas y diagnósticos de ${selectedPatient.firstName} ${selectedPatient.lastName}`
								: ""}
						</SheetDescription>
					</SheetHeader>
					{selectedPatient && (
						<div className="mt-8 space-y-6">
							{/* Patient Info Card Header */}
							<div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div>
									<h4 className="text-sm font-bold text-slate-800">
										{selectedPatient.firstName} {selectedPatient.lastName}
									</h4>
									<span className="text-[11px] text-slate-400 font-medium block mt-0.5">
										DNI: {selectedPatient.nationalId} | Edad:{" "}
										{calculateAge(new Date(selectedPatient.birthDate))} años
									</span>
								</div>
								<div className="flex gap-2">
									<Badge
										variant="outline"
										className="bg-white text-slate-600 border-slate-200 text-[10px] rounded-full px-2.5 py-0.5"
									>
										Sangre:{" "}
										{(selectedPatient.bloodType ?? "")
											.replace("_POSITIVE", "+")
											.replace("_NEGATIVE", "-")}
									</Badge>
									{selectedPatient.chronicConditions &&
										selectedPatient.chronicConditions.length > 0 && (
											<Badge
												variant="outline"
												className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] rounded-full px-2.5 py-0.5 font-semibold"
											>
												Crónico
											</Badge>
										)}
								</div>
							</div>

							{/* History Timeline Component */}
							<div className="pt-2">
								{isLoadingHistory ? (
									<div className="flex flex-col items-center justify-center py-16 gap-3">
										<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pharmako-care"></div>
										<span className="text-xs text-slate-500 font-medium">Cargando consultas...</span>
									</div>
								) : historyEntries.length > 0 ? (
									<ClinicalHistoryTimeline entries={historyEntries} />
								) : (
									<div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
										No se registran consultas médicas previas para este paciente.
									</div>
								)}
							</div>

							<div className="flex justify-end pt-4 border-t border-slate-100">
								<Button
									variant="outline"
									onClick={handleClose}
									className="rounded-xl h-11 px-6 font-semibold transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
								>
									Cerrar Historia
								</Button>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation */}
			<Dialog
				open={!!deleteConfirm}
				onOpenChange={(open) => !open && setDeleteConfirm(null)}
			>
				<DialogContent className="rounded-2xl bg-white border border-slate-200 max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-slate-900 font-semibold">
							¿Eliminar paciente?
						</DialogTitle>
						<DialogDescription className="text-slate-500 text-sm mt-1">
							Esta acción no se puede deshacer. Se removerá de tu nómina
							clínica.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0 mt-4">
						<Button
							variant="outline"
							onClick={() => setDeleteConfirm(null)}
							className="rounded-xl"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							className="rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
						>
							<Trash2 className="size-4" />
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ScheduleFollowUpModal
				isOpen={isFollowUpOpen}
				onClose={() => {
					setIsFollowUpOpen(false);
					setSelectedPatientForFollowUp(null);
				}}
				patientUuid={selectedPatientForFollowUp?.uuid}
			/>
		</div>
	);
}
