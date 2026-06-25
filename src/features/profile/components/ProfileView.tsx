"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
	User,
	Mail,
	Phone,
	MapPin,
	ShieldCheck,
	Save,
	Loader2,
	CreditCard,
	AtSign,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type { PatientAccount, UserProfile } from "@/features/auth/types";
import { useGetCities } from "@/features/auth/hooks/useGetCities";

// ── Schema ─────────────────────────────────────────────────

const patientSchema = z.object({
	full_name: z.string().min(2, "Requerido"),
	email: z.string().email("Email inválido").or(z.literal("")),
	phone: z.string().min(10, "Teléfono inválido").or(z.literal("")),
	username: z.string().optional(),
	national_id: z.string().optional(),
	city_id: z.string().optional(),
});

const userSchema = z.object({
	full_name: z.string().min(2, "Requerido"),
	email: z.string().email("Email inválido"),
	phone: z.string().min(10, "Teléfono inválido").or(z.literal("")),
	city_id: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;
type UserForm = z.infer<typeof userSchema>;

// ── Skeleton ────────────────────────────────────────────────

function ProfileSkeleton() {
	return (
		<div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-pulse">
			<div className="space-y-1.5">
				<div className="h-8 w-40 bg-pharmako-canvas rounded-lg" />
				<div className="h-4 w-60 bg-pharmako-background rounded" />
			</div>
			<div className="bg-pharmako-surface rounded-2xl border border-pharmako-border-soft p-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="space-y-1.5">
							<div className="h-3 w-20 bg-pharmako-background rounded" />
							<div className="h-10 bg-pharmako-background rounded-xl" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ── Form field ─────────────────────────────────────────────

function Field({
	label,
	icon: Icon,
	children,
}: {
	label: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Icon className="w-3.5 h-3.5 text-pharmako-text-muted" />
				<label className="text-xs font-medium text-pharmako-text-secondary">{label}</label>
			</div>
			{children}
		</div>
	);
}

// ── Input ──────────────────────────────────────────────────

function FInput({
	error,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
	return (
		<div>
			<input
				{...props}
				className={[
					"w-full px-3 py-2.5 rounded-xl border bg-pharmako-surface text-sm text-pharmako-text-primary",
					"placeholder:text-pharmako-text-muted/40",
					"focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20 focus:border-pharmako-primary",
					"transition-colors duration-200",
					error ? "border-pharmako-danger focus:ring-pharmako-danger/20 focus:border-pharmako-danger" : "border-pharmako-border",
					className,
				]
					.filter(Boolean)
					.join(" ")}
			/>
			{error && <p className="text-xs text-pharmako-danger mt-1">{error}</p>}
		</div>
	);
}

// ── Status badge ───────────────────────────────────────────

function StatusBadge({
	status,
	verified,
}: {
	status?: string;
	verified?: boolean;
}) {
	if (status === "ACTIVE" && verified) {
		return (
			<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pharmako-success-light border border-pharmako-success/20 text-xs font-semibold text-pharmako-success">
				<ShieldCheck className="w-3.5 h-3.5" />
				Cuenta verificada
			</span>
		);
	}
	if (!verified) {
		return (
			<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pharmako-warning-light border border-pharmako-warning/20 text-xs font-semibold text-pharmako-warning">
				<ShieldCheck className="w-3.5 h-3.5" />
				Pendiente de verificación
			</span>
		);
	}
	return null;
}

// ── Info row ───────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex items-center justify-between py-2.5 border-b border-pharmako-border-soft last:border-0">
			<span className="text-xs font-medium text-pharmako-text-muted">{label}</span>
			<span className="text-sm text-pharmako-text-secondary font-medium text-right truncate max-w-[60%]">
				{value || "—"}
			</span>
		</div>
	);
}

// ── Patient form ───────────────────────────────────────────

function PatientFormInner({ initial }: { initial: PatientAccount }) {
	const { token, setAuth, userType } = useAuthStore();
	const { data: cities } = useGetCities();
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const {
		register,
		handleSubmit,
		formState: { errors: formErrors, isDirty },
	} = useForm<PatientForm>({
		resolver: zodResolver(patientSchema),
		defaultValues: {
			full_name: initial.full_name,
			email: initial.email ?? "",
			phone: initial.phone ?? "",
			username: initial.username ?? "",
			national_id: initial.national_id ?? "",
			city_id: initial.city_id ?? "",
		},
	});

	const onSubmit = async (payload: PatientForm) => {
		setLoading(true);
		setErrors({});
		try {
			const { data } = await apiClient.patch<PatientAccount>(
				"/auth/patients/me",
				payload,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (token && userType) {
				setAuth(token, userType, data, true);
			}
			toast.success("¡Perfil actualizado!");
		} catch (err: unknown) {
			const e = err as {
				response?: { data?: { errors?: Record<string, string[]> } };
			};
			if (e.response?.data?.errors) {
				const be = e.response.data.errors;
				const mapped: Record<string, string> = {};
				Object.keys(be).forEach((k) => {
					mapped[k] = be[k][0];
				});
				setErrors(mapped);
				toast.error("Corregí los campos marcados.");
			} else {
				toast.error("Error al actualizar el perfil.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<Field label="Nombre completo" icon={User}>
					<FInput
						{...register("full_name")}
						placeholder="Tu nombre completo"
						error={formErrors.full_name?.message ?? errors.full_name}
					/>
				</Field>

				<Field label="Correo electrónico" icon={Mail}>
					<FInput
						{...register("email")}
						type="email"
						placeholder="tu@email.com"
						error={formErrors.email?.message ?? errors.email}
					/>
				</Field>

				<Field label="Teléfono" icon={Phone}>
					<FInput
						{...register("phone")}
						type="tel"
						placeholder="+58 412 123 4567"
						error={formErrors.phone?.message ?? errors.phone}
					/>
				</Field>

				<Field label="Nombre de usuario" icon={AtSign}>
					<FInput
						{...register("username")}
						placeholder="@usuario"
						error={formErrors.username?.message ?? errors.username}
					/>
				</Field>

				<Field label="Cédula / ID" icon={CreditCard}>
					<FInput
						{...register("national_id")}
						placeholder="V-12345678"
						error={formErrors.national_id?.message ?? errors.national_id}
					/>
				</Field>

				<Field label="Ciudad" icon={MapPin}>
					<select
						{...register("city_id")}
						className="w-full px-3 py-2.5 rounded-xl border border-pharmako-border bg-pharmako-surface text-sm text-pharmako-text-primary
                       focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20 focus:border-pharmako-primary
                       transition-colors duration-200"
					>
						<option value="">Seleccionar ciudad</option>
						{cities?.map((city) => (
							<option key={city.id} value={city.id}>
								{city.name}
							</option>
						))}
					</select>
				</Field>
			</div>

			{/* Info readonly */}
			<div className="rounded-xl bg-pharmako-background border border-pharmako-border-soft p-4">
				<InfoRow label="ID de cuenta" value={initial.uuid} />
				<InfoRow label="Estado" value={initial.status} />
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={!isDirty || loading}
					className={[
						"flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm",
						"transition-all duration-200",
						isDirty && !loading
							? "bg-pharmako-primary hover:bg-pharmako-primary-hover text-white shadow-sm hover:shadow-md cursor-pointer"
							: "bg-pharmako-background text-pharmako-text-muted/50 border border-pharmako-border-soft cursor-not-allowed",
					].join(" ")}
				>
					{loading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Guardando…
						</>
					) : (
						<>
							<Save className="w-4 h-4" />
							Guardar cambios
						</>
					)}
				</button>
			</div>
		</form>
	);
}

// ── User form ─────────────────────────────────────────────

function UserProfileFormInner({ initial }: { initial: UserProfile }) {
	const { token, setAuth, userType } = useAuthStore();
	const { data: cities } = useGetCities();
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const {
		register,
		handleSubmit,
		formState: { errors: formErrors, isDirty },
	} = useForm<UserForm>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			full_name: initial.full_name,
			email: initial.email,
			phone: initial.phone ?? "",
			city_id: initial.city_id ?? "",
		},
	});

	const onSubmit = async (payload: UserForm) => {
		setLoading(true);
		setErrors({});
		try {
			const { data } = await apiClient.patch<UserProfile>(
				"/auth/users/me",
				payload,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (token && userType) {
				setAuth(token, userType, data, data.is_verified);
			}
			toast.success("¡Perfil actualizado!");
		} catch (err: unknown) {
			const e = err as {
				response?: { data?: { errors?: Record<string, string[]> } };
			};
			if (e.response?.data?.errors) {
				const be = e.response.data.errors;
				const mapped: Record<string, string> = {};
				Object.keys(be).forEach((k) => {
					mapped[k] = be[k][0];
				});
				setErrors(mapped);
				toast.error("Corregí los campos marcados.");
			} else {
				toast.error("Error al actualizar el perfil.");
			}
		} finally {
			setLoading(false);
		}
	};

	const isProvider = !!initial.provider_profile;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<Field label="Nombre completo" icon={User}>
					<FInput
						{...register("full_name")}
						placeholder="Tu nombre completo"
						error={formErrors.full_name?.message ?? errors.full_name}
					/>
				</Field>

				<Field label="Correo electrónico" icon={Mail}>
					<FInput
						{...register("email")}
						type="email"
						placeholder="tu@email.com"
						error={formErrors.email?.message ?? errors.email}
					/>
				</Field>

				<Field label="Teléfono" icon={Phone}>
					<FInput
						{...register("phone")}
						type="tel"
						placeholder="+58 412 123 4567"
						error={formErrors.phone?.message ?? errors.phone}
					/>
				</Field>

				<Field label="Ciudad" icon={MapPin}>
					<select
						{...register("city_id")}
						className="w-full px-3 py-2.5 rounded-xl border border-pharmako-border bg-pharmako-surface text-sm text-pharmako-text-primary
                       focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20 focus:border-pharmako-primary
                       transition-colors duration-200"
					>
						<option value="">Seleccionar ciudad</option>
						{cities?.map((city) => (
							<option key={city.id} value={city.id}>
								{city.name}
							</option>
						))}
					</select>
				</Field>
			</div>

			{/* Info readonly */}
			<div className="rounded-xl bg-pharmako-background border border-pharmako-border-soft p-4 space-y-0">
				<InfoRow label="Rol" value={initial.role} />
				{initial.plan_type && (
					<InfoRow label="Plan" value={initial.plan_type} />
				)}
				<InfoRow label="ID de cuenta" value={initial.uuid} />
			</div>

			{initial.provider_profile && (
				<div className="rounded-xl bg-pharmako-background border border-pharmako-border-soft p-4">
					<p className="text-xs font-semibold text-pharmako-text-muted mb-2 pb-2 border-b border-pharmako-border-soft">
						Datos comerciales
					</p>
					<div className="space-y-0">
						<InfoRow
							label="Nombre comercial"
							value={initial.provider_profile.commercial_name}
						/>
						<InfoRow label="RIF" value={initial.provider_profile.rif} />
						<InfoRow label="Tipo" value={initial.provider_profile.type} />
					</div>
				</div>
			)}

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={!isDirty || loading}
					className={[
						"flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm",
						"transition-all duration-200",
						isDirty && !loading
							? isProvider
								? "bg-pharmako-care hover:bg-pharmako-care-hover text-white shadow-sm hover:shadow-md cursor-pointer"
								: "bg-pharmako-primary hover:bg-pharmako-primary-hover text-white shadow-sm hover:shadow-md cursor-pointer"
							: "bg-pharmako-background text-pharmako-text-muted/50 border border-pharmako-border-soft cursor-not-allowed",
					].join(" ")}
				>
					{loading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Guardando…
						</>
					) : (
						<>
							<Save className="w-4 h-4" />
							Guardar cambios
						</>
					)}
				</button>
			</div>
		</form>
	);
}

// ── ProfileView ────────────────────────────────────────────

export function ProfileView() {
	const { token, userType, isVerified } = useAuthStore();
	const isPatient = userType === "patient";

	const [profileData, setProfileData] = useState<
		PatientAccount | UserProfile | null
	>(null);
	const [loading, setLoading] = useState(false);
	const hasFetched = useRef(false);

	useEffect(() => {
		if (!token || hasFetched.current) return;
		hasFetched.current = true;

		const endpoint = isPatient ? "/auth/patients/me" : "/auth/users/me";
		setLoading(true);

		apiClient
			.get<PatientAccount | UserProfile>(endpoint, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(({ data }) => setProfileData(data))
			.catch(() => toast.error("No se pudo cargar el perfil."))
			.finally(() => setLoading(false));
	}, [token, isPatient]);

	if (loading || !profileData) {
		return <ProfileSkeleton />;
	}

	const patient = profileData as PatientAccount;
	const user = profileData as UserProfile;

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: { opacity: 1, transition: { duration: 0.3 } },
			}}
			className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
						Mi Perfil
					</h1>
					<p className="text-sm text-pharmako-text-secondary mt-1">
						Gestiona tu información personal y configuración de cuenta.
					</p>
				</div>
				<StatusBadge
					status={isPatient ? patient.status : user.status}
					verified={isVerified}
				/>
			</div>

			{/* Form card */}
			<div className="bg-pharmako-surface rounded-2xl border border-pharmako-border-soft p-8 shadow-sm">
				{isPatient ? (
					<PatientFormInner initial={patient} />
				) : (
					<UserProfileFormInner initial={user} />
				)}
			</div>
		</motion.div>
	);
}
