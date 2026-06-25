"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment, DoctorOption } from "../types";

interface AppointmentFormProps {
	initialData?: Partial<Appointment>;
	doctors: DoctorOption[];
	onSubmit: (data: Partial<Appointment>) => void;
	onCancel: () => void;
}

const inputClassName =
	"h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
	"h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer";

const searchInputClassName =
	"h-8 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export function AppointmentForm({
	initialData,
	doctors,
	onSubmit,
	onCancel,
}: AppointmentFormProps) {
	const [doctorSearch, setDoctorSearch] = useState("");
	const [selectedDoctorUuid, setSelectedDoctorUuid] = useState(
		initialData?.doctorUuid ?? "",
	);
	const [date, setDate] = useState(initialData?.date ?? "");
	const [time, setTime] = useState(initialData?.time ?? "");
	const [reason, setReason] = useState(initialData?.reason ?? "");
	const [type, setType] = useState<Appointment["type"]>(
		initialData?.type ?? "IN_PERSON",
	);
	const [status, setStatus] = useState<Appointment["status"]>(
		initialData?.status ?? "PENDING",
	);
	const [notes, setNotes] = useState(initialData?.notes ?? "");
	const [showDropdown, setShowDropdown] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const filteredDoctors = doctors.filter(
		(d) =>
			d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
			d.specialtyName.toLowerCase().includes(doctorSearch.toLowerCase()),
	);

	const selectedDoctor = doctors.find((d) => d.uuid === selectedDoctorUuid);

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!selectedDoctorUuid) newErrors.doctorUuid = "El doctor es requerido";
		if (!date) newErrors.date = "La fecha es requerida";
		if (!time) newErrors.time = "La hora es requerida";
		if (!reason.trim()) newErrors.reason = "El motivo es requerido";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		onSubmit({
			doctorUuid: selectedDoctorUuid,
			date,
			time,
			reason: reason.trim(),
			type,
			status,
			notes: notes.trim() || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-8">
			{/* ── Doctor & Reason ─────────────────────────────── */}
			<section>
				<h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-4 pb-2 border-b border-slate-100">
					Doctor y Motivo
				</h2>
				<div className="flex flex-col gap-4">
					{/* Doctor selector */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium text-slate-700">Doctor</label>
						<div className="relative">
							<div className="flex items-center gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
									<input
										type="text"
										placeholder="Buscar doctor por nombre o especialidad..."
										value={doctorSearch}
										onChange={(e) => {
											setDoctorSearch(e.target.value);
											setShowDropdown(true);
										}}
										onFocus={() => setShowDropdown(true)}
										className={searchInputClassName + " pl-8"}
									/>
								</div>
							</div>

							{showDropdown && (
								<div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-slate-100 shadow-lg max-h-44 overflow-y-auto">
									{filteredDoctors.length === 0 ? (
										<p className="px-3 py-2 text-xs text-slate-500">
											No se encontraron doctores
										</p>
									) : (
										filteredDoctors.map((doc) => (
											<button
												key={doc.uuid}
												type="button"
												onClick={() => {
													setSelectedDoctorUuid(doc.uuid);
													setDoctorSearch("");
													setShowDropdown(false);
												}}
												className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
													selectedDoctorUuid === doc.uuid ? "bg-teal-50" : ""
												}`}
											>
												<p className="text-sm font-medium text-slate-900">
													{doc.fullName}
												</p>
												<p className="text-xs text-slate-500">
													{doc.specialtyName}
												</p>
											</button>
										))
									)}
								</div>
							)}

							{selectedDoctorUuid && !showDropdown && (
								<div className="mt-1.5 flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
									<div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
										<span className="text-xs font-medium text-teal-700">
											{selectedDoctor?.fullName.charAt(0) ?? "?"}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-slate-900 truncate">
											{selectedDoctor?.fullName}
										</p>
										<p className="text-xs text-slate-500">
											{selectedDoctor?.specialtyName}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setSelectedDoctorUuid("")}
										className="text-slate-400 hover:text-slate-600 text-xs"
									>
										<X className="size-4" />
									</button>
								</div>
							)}
						</div>
						{errors.doctorUuid && (
							<p className="text-xs text-red-500">{errors.doctorUuid}</p>
						)}
					</div>

					{/* Reason */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="reason"
							className="text-sm font-medium text-slate-700"
						>
							Motivo de la consulta
						</label>
						<textarea
							id="reason"
							rows={3}
							placeholder="Ej. Control de presión arterial, seguimiento de tratamiento..."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className={inputClassName + " resize-none pt-2"}
						/>
						{errors.reason && (
							<p className="text-xs text-red-500">{errors.reason}</p>
						)}
					</div>
				</div>
			</section>

			{/* ── Date, Time & Type ───────────────────────────── */}
			<section>
				<h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-4 pb-2 border-b border-slate-100">
					Fecha, Hora y Modalidad
				</h2>
				<div className="grid grid-cols-2 gap-5">
					{/* Date */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="date"
							className="text-sm font-medium text-slate-700"
						>
							Fecha
						</label>
						<input
							id="date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className={inputClassName}
						/>
						{errors.date && (
							<p className="text-xs text-red-500">{errors.date}</p>
						)}
					</div>

					{/* Time */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="time"
							className="text-sm font-medium text-slate-700"
						>
							Hora
						</label>
						<select
							id="time"
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className={selectClassName}
						>
							<option value="">Seleccionar hora...</option>
							{/* Time slots will be populated from availability API */}
						</select>
						{errors.time && (
							<p className="text-xs text-red-500">{errors.time}</p>
						)}
					</div>

					{/* Type */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="type"
							className="text-sm font-medium text-slate-700"
						>
							Modalidad
						</label>
						<select
							id="type"
							value={type}
							onChange={(e) => setType(e.target.value as Appointment["type"])}
							className={selectClassName}
						>
							<option value="IN_PERSON">Presencial</option>
							<option value="ONLINE">Online</option>
						</select>
					</div>

					{/* Status */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="status"
							className="text-sm font-medium text-slate-700"
						>
							Estado
						</label>
						<select
							id="status"
							value={status}
							onChange={(e) =>
								setStatus(e.target.value as Appointment["status"])
							}
							className={selectClassName}
						>
							<option value="PENDING">Pendiente</option>
							<option value="CONFIRMED">Confirmada</option>
							<option value="IN_ROOM">En Sala</option>
							<option value="COMPLETED">Completada</option>
							<option value="CANCELLED">Cancelada</option>
						</select>
					</div>
				</div>

				{/* Notes */}
				<div className="flex flex-col gap-1.5 mt-5">
					<label htmlFor="notes" className="text-sm font-medium text-slate-700">
						Notas adicionales (opcional)
					</label>
					<textarea
						id="notes"
						rows={2}
						placeholder="Observaciones o preferencias..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						className={inputClassName + " resize-none pt-2"}
					/>
				</div>
			</section>

			{/* ── Actions ───────────────────────────────────── */}
			<div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="rounded-xl"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					className="rounded-xl bg-teal-600 text-white hover:bg-teal-700"
				>
					Guardar Cita
				</Button>
			</div>
		</form>
	);
}
