"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
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
  Camera,
  Calendar,
  Activity,
  Heart,
  Droplet,
  FileText,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Select from "react-select";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { PatientAccount, UserProfile } from "@/features/auth/types";
import { useGetCities } from "@/features/auth/hooks/useGetCities";
import { db } from "@/features/offline/database/schema";
import { syncService } from "@/features/offline/services/syncService";
import { DoctorScheduleView } from "@/features/doctor-dashboard/components/DoctorScheduleView";

// ── Schemas de Validación ──────────────────────────────────

const patientSchema = z.object({
  full_name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electrónico inválido").or(z.literal("")),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .or(z.literal("")),
  username: z.string().optional(),
  national_id: z.string().optional(),
  city_id: z.string().optional(),
  avatar_url: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

const userSchema = z.object({
  full_name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .or(z.literal("")),
  city_id: z.string().optional(),
  logo_url: z.string().optional(),
  signature_url: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;
type UserForm = z.infer<typeof userSchema>;

// ── Opciones para React-Select ─────────────────────────────

const genderOptions = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "OTHER", label: "Otro" },
];

const bloodTypeOptions = [
  { value: "O+", label: "O Positivo (O+)" },
  { value: "O-", label: "O Negativo (O-)" },
  { value: "A+", label: "A Positivo (A+)" },
  { value: "A-", label: "A Negativo (A-)" },
  { value: "B+", label: "B Positivo (B+)" },
  { value: "B-", label: "B Negativo (B-)" },
  { value: "AB+", label: "AB Positivo (AB+)" },
  { value: "AB-", label: "AB Negativo (AB-)" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#0057FF" : "#E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 87, 255, 0.15)" : "none",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "var(--font-sans)",
    color: "#0F172A",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: state.isFocused ? "#0057FF" : "#cbd5e1",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "0 12px",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#0F172A",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#64748B",
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "12px",
    border: "1px solid #F0F1F3",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
    backgroundColor: "#FFFFFF",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#EEF5FF"
      : state.isFocused
        ? "#FAF9F7"
        : "transparent",
    color: state.isSelected ? "#0057FF" : "#0F172A",
    fontSize: "14px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#EEF5FF",
    },
  }),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Skeletons ───────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-pulse py-6">
      <div className="flex items-center gap-5">
        <div className="w-24 h-24 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-100 rounded-lg" />
          <div className="h-4 w-32 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
        <div className="h-64 bg-white rounded-xl border border-slate-200" />
      </div>
    </div>
  );
}

// ── Componentes de Soporte de Diseño (Notion-isomatic) ──────

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft">
      <div className="px-6 py-4 border-b border-pharmako-border-soft flex items-center gap-3">
        <div className="p-1.5rounded-lg">
          <Icon className="h-6 w-6 text-pharmako-care" />
        </div>
        <h3 className="text-sm font-bold text-pharmako-text-primary uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

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
      <div className="flex items-center gap-1.5 pl-0.5">
        <Icon className="w-3.5 h-3.5 text-pharmako-text-muted" />
        <label className="text-xs font-bold text-pharmako-text-secondary">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

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
          "w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-pharmako-text-primary",
          "placeholder:text-pharmako-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-pharmako-primary-light focus:border-pharmako-primary",
          "transition-colors duration-200 border-pharmako-border",
          error
            ? "border-pharmako-danger focus:ring-pharmako-danger-light focus:border-pharmako-danger"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && (
        <p className="text-xs text-pharmako-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

function FTextarea({
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div>
      <textarea
        {...props}
        className={[
          "w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-pharmako-text-primary min-h-[80px]",
          "placeholder:text-pharmako-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-pharmako-primary-light focus:border-pharmako-primary",
          "transition-colors duration-200 border-pharmako-border",
          error
            ? "border-pharmako-danger focus:ring-pharmako-danger-light focus:border-pharmako-danger"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && (
        <p className="text-xs text-pharmako-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-pharmako-border-soft last:border-0">
      <span className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-pharmako-text-primary font-bold truncate max-w-[65%]">
        {value || "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const isActive = status === "ACTIVE" || status === "active";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
        isActive
          ? "bg-pharmako-success-light border-pharmako-success/30 text-pharmako-success"
          : "bg-pharmako-warning-light border-pharmako-warning/30 text-pharmako-warning",
      ].join(" ")}
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      {isActive ? "Cuenta Activa" : "Estado: " + (status || "Inactivo")}
    </span>
  );
}

// ── Patient Profile Form ────────────────────────────────────
function PatientFormInner({ initial }: { initial: PatientAccount }) {
  const { setAuth, userType } = useAuthStore();
  const { data: cities } = useGetCities();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initial.avatarUrl ?? initial.avatar_url ?? null,
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors: formErrors, isDirty },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: initial.fullName ?? initial.full_name,
      email: initial.email ?? "",
      phone: initial.phone ?? "",
      username: initial.username ?? "",
      national_id: initial.nationalId ?? initial.national_id ?? "",
      city_id: initial.cityId ?? initial.city_id ?? "",
      avatar_url: initial.avatarUrl ?? initial.avatar_url ?? "",
      address: initial.address ?? "",
      birth_date: initial.birthDate ?? initial.birth_date ?? "",
      gender: initial.gender ?? "",
      blood_type: initial.bloodType ?? initial.blood_type ?? "",
      allergies: initial.allergies ?? "",
      chronic_conditions:
        initial.chronicConditions ?? initial.chronic_conditions ?? "",
      emergency_contact_name:
        initial.emergencyContactName ?? initial.emergency_contact_name ?? "",
      emergency_contact_phone:
        initial.emergencyContactPhone ?? initial.emergency_contact_phone ?? "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La foto de perfil debe pesar menos de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setAvatarPreview(base64Str);
        setValue("avatar_url", base64Str, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (payload: PatientForm) => {
    setLoading(true);
    setErrors({});
    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Guardado Offline en Dexie IndexedDB
      db.pendingProfileUpdates
        .put({
          id: "patient",
          payload: JSON.stringify(payload),
          updatedAt: new Date().toISOString(),
        })
        .catch((err) =>
          console.error("[PatientProfile] Dexie save error:", err),
        );

      const updatedUser: PatientAccount = {
        ...initial,
        fullName: payload.full_name,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        username: payload.username ?? initial.username,
        nationalId:
          payload.national_id ?? initial.nationalId ?? initial.national_id,
        cityId: payload.city_id ?? initial.cityId ?? initial.city_id,
        avatarUrl:
          payload.avatar_url ?? initial.avatarUrl ?? initial.avatar_url,
        address: payload.address ?? initial.address,
        birthDate:
          payload.birth_date ?? initial.birthDate ?? initial.birth_date,
        gender: payload.gender ?? initial.gender,
        bloodType:
          payload.blood_type ?? initial.bloodType ?? initial.blood_type,
        allergies: payload.allergies ?? initial.allergies,
        chronicConditions:
          payload.chronic_conditions ??
          initial.chronicConditions ??
          initial.chronic_conditions,
        emergencyContactName:
          payload.emergency_contact_name ??
          initial.emergencyContactName ??
          initial.emergency_contact_name,
        emergencyContactPhone:
          payload.emergency_contact_phone ??
          initial.emergencyContactPhone ??
          initial.emergency_contact_phone,
      };

      if (userType) {
        setAuth(userType, updatedUser, true);
      }
      toast.success(
        "¡Tu perfil de paciente ha sido guardado localmente en IndexedDB! Se sincronizará cuando recuperes la conexión.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.patch<{
        status: string;
        user: PatientAccount;
      }>("/auth/patients/me", payload);
      await db.pendingProfileUpdates.delete("patient");
      if (userType) {
        setAuth(userType, data.user, true);
      }
      toast.success(
        "¡Tu perfil de paciente ha sido actualizado correctamente!",
      );
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
        toast.error("Por favor, corrige los campos del formulario.");
      } else {
        toast.error("Hubo un error al actualizar los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cityOptions =
    cities?.map((c) => ({ value: c.id, label: c.name })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sección Superior: Avatar y Nombre */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-pharmako-border-soft">
        <div className="relative group w-24 h-24 rounded-full overflow-hidden border-1 border-pharmako-border flex items-center justify-center">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-pharmako-text-muted" />
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          >
            <Camera className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Cambiar</span>
          </button>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-pharmako-text-primary">
            {initial.full_name ?? initial.fullName}
          </h2>
          <p className="text-xs text-pharmako-text-secondary font-medium">
            Expediente de Paciente Global
          </p>
          <div className="flex justify-center sm:justify-start pt-1">
            <StatusBadge status={initial.status} />
          </div>
        </div>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Datos Personales */}
        <Card title="Datos Personales" icon={User}>
          <div className="space-y-4">
            <Field label="Nombre Completo" icon={User}>
              <FInput
                {...register("full_name")}
                placeholder="Nombre y apellido"
                error={formErrors.full_name?.message ?? errors.full_name}
              />
            </Field>

            <Field label="Cédula / Documento de Identidad" icon={CreditCard}>
              <FInput
                {...register("national_id")}
                placeholder="V-12345678"
                error={formErrors.national_id?.message ?? errors.national_id}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de Nacimiento" icon={Calendar}>
                <FInput
                  {...register("birth_date")}
                  type="date"
                  error={formErrors.birth_date?.message ?? errors.birth_date}
                />
              </Field>

              <Field label="Género" icon={User}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      options={genderOptions}
                      placeholder="Seleccionar"
                      noOptionsMessage={() => "Sin opciones"}
                      styles={selectStyles}
                      value={
                        genderOptions.find((o) => o.value === field.value) ||
                        null
                      }
                      onChange={(val) => field.onChange(val?.value ?? "")}
                    />
                  )}
                />
                {formErrors.gender?.message && (
                  <p className="text-xs text-pharmako-danger mt-1 font-medium">
                    {formErrors.gender.message}
                  </p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre de Usuario" icon={AtSign}>
                <FInput
                  {...register("username")}
                  placeholder="@usuario"
                  error={formErrors.username?.message ?? errors.username}
                />
              </Field>

              <Field label="Ciudad" icon={MapPin}>
                <Controller
                  control={control}
                  name="city_id"
                  render={({ field }) => (
                    <Select
                      options={cityOptions}
                      placeholder="Seleccionar ciudad"
                      noOptionsMessage={() => "No hay ciudades"}
                      styles={selectStyles}
                      value={
                        cityOptions.find((c) => c.value === field.value) || null
                      }
                      onChange={(val) => field.onChange(val?.value ?? "")}
                    />
                  )}
                />
                {(formErrors.city_id?.message ?? errors.city_id) && (
                  <p className="text-xs text-pharmako-danger mt-1 font-medium">
                    {formErrors.city_id?.message ?? errors.city_id}
                  </p>
                )}
              </Field>
            </div>
          </div>
        </Card>

        {/* Card 2: Información de Contacto */}
        <Card title="Contacto de Cuenta" icon={Mail}>
          <div className="space-y-4">
            <Field label="Correo Electrónico" icon={Mail}>
              <FInput
                {...register("email")}
                type="email"
                placeholder="correo@ejemplo.com"
                error={formErrors.email?.message ?? errors.email}
              />
            </Field>

            <Field label="Teléfono (WhatsApp)" icon={Phone}>
              <FInput
                {...register("phone")}
                type="tel"
                placeholder="+58 412 123 4567"
                error={formErrors.phone?.message ?? errors.phone}
              />
            </Field>

            <Field label="Dirección de Habitación" icon={MapPin}>
              <FTextarea
                {...register("address")}
                placeholder="Calle, urbanización, edificio..."
                error={formErrors.address?.message ?? errors.address}
              />
            </Field>
          </div>
        </Card>

        {/* Card 3: Información Médica */}
        <Card title="Expediente Clínico" icon={Activity}>
          <div className="space-y-4">
            <Field label="Tipo de Sangre" icon={Droplet}>
              <Controller
                control={control}
                name="blood_type"
                render={({ field }) => (
                  <Select
                    options={bloodTypeOptions}
                    placeholder="Seleccionar"
                    noOptionsMessage={() => "Sin opciones"}
                    styles={selectStyles}
                    value={
                      bloodTypeOptions.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(val) => field.onChange(val?.value ?? "")}
                  />
                )}
              />
              {formErrors.blood_type?.message && (
                <p className="text-xs text-pharmako-danger mt-1 font-medium">
                  {formErrors.blood_type.message}
                </p>
              )}
            </Field>

            <Field label="Alergias Conocidas" icon={Heart}>
              <FTextarea
                {...register("allergies")}
                placeholder="Medicamentos, alimentos, etc."
                error={formErrors.allergies?.message ?? errors.allergies}
              />
            </Field>

            <Field label="Condiciones Crónicas" icon={Activity}>
              <FTextarea
                {...register("chronic_conditions")}
                placeholder="Hipertensión, asma, diabetes, etc."
                error={
                  formErrors.chronic_conditions?.message ??
                  errors.chronic_conditions
                }
              />
            </Field>
          </div>
        </Card>

        {/* Card 4: Contacto de Emergencia */}
        <Card title="Contacto de Emergencia" icon={Heart}>
          <div className="space-y-4">
            <Field label="Nombre del Contacto" icon={User}>
              <FInput
                {...register("emergency_contact_name")}
                placeholder="Nombre de un familiar o allegado"
                error={
                  formErrors.emergency_contact_name?.message ??
                  errors.emergency_contact_name
                }
              />
            </Field>

            <Field label="Teléfono del Contacto" icon={Phone}>
              <FInput
                {...register("emergency_contact_phone")}
                type="tel"
                placeholder="Teléfono de contacto"
                error={
                  formErrors.emergency_contact_phone?.message ??
                  errors.emergency_contact_phone
                }
              />
            </Field>

            <div className="rounded-xl bg-slate-50 border border-pharmako-border-soft p-4 mt-6">
              <InfoRow label="ID Expediente" value={initial.uuid} />
              <InfoRow
                label="Fecha Registro"
                value={
                  initial.created_at
                    ? new Date(initial.created_at).toLocaleDateString()
                    : null
                }
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Botón de Guardado */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!isDirty || loading}
          className={[
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200",
            isDirty && !loading
              ? "bg-pharmako-care hover:bg-pharmako-primary-hover text-white hover:shadow-md cursor-pointer"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando cambios…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Perfil
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── User Profile Form (Doctor/Pharmacy/Clinic) ──────────────

function UserProfileFormInner({ initial }: { initial: UserProfile }) {
  const { setAuth, userType } = useAuthStore();
  const { data: cities } = useGetCities();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initial.logo_url ?? null,
  );
  const [sigPreview, setSigPreview] = useState<string | null>(
    initial.signature_url ?? null,
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors: formErrors, isDirty },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: initial.full_name,
      email: initial.email,
      phone: initial.phone ?? "",
      city_id: initial.city_id ?? "",
      logo_url: initial.logo_url ?? "",
      signature_url: initial.signature_url ?? "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La foto de perfil/logo debe pesar menos de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setLogoPreview(base64Str);
        setValue("logo_url", base64Str, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("La firma digital debe pesar menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setSigPreview(base64Str);
        setValue("signature_url", base64Str, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (payload: UserForm) => {
    setLoading(true);
    setErrors({});
    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Guardado Offline en Dexie IndexedDB
      db.pendingProfileUpdates
        .put({
          id: "user",
          payload: JSON.stringify(payload),
          updatedAt: new Date().toISOString(),
        })
        .catch((err) => console.error("[UserProfile] Dexie save error:", err));

      const updatedUser: UserProfile = {
        ...initial,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone ?? initial.phone,
        city_id: payload.city_id ?? initial.city_id,
        logo_url: payload.logo_url ?? initial.logo_url,
        signature_url: payload.signature_url ?? initial.signature_url,
      };

      if (userType) {
        setAuth(userType, updatedUser, updatedUser.is_verified);
      }
      toast.success(
        "¡Tu perfil profesional ha sido guardado localmente en IndexedDB! Se sincronizará cuando recuperes la conexión.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.patch<{
        status: string;
        user: UserProfile;
      }>("/auth/users/me", payload);
      await db.pendingProfileUpdates.delete("user");
      if (userType) {
        setAuth(userType, data.user, data.user.is_verified);
      }
      toast.success("¡Perfil actualizado con éxito!");
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
        toast.error("Corrige los campos del formulario.");
      } else {
        toast.error("Error al actualizar la información.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cityOptions =
    cities?.map((c) => ({ value: c.id, label: c.name })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Superior: Logo y Nombre */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-pharmako-border-soft">
        <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-pharmako-border bg-slate-50 shadow-sm flex items-center justify-center">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-pharmako-text-muted" />
          )}
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          >
            <Camera className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Cambiar</span>
          </button>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-pharmako-text-primary">
            {initial.full_name}
          </h2>
          <p className="text-xs text-pharmako-text-secondary font-medium">
            Portal Profesional — Rol: {initial.role}
          </p>
          <div className="flex justify-center sm:justify-start pt-1">
            <StatusBadge status={initial.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Datos de Usuario */}
        <Card title="Información de Usuario" icon={User}>
          <div className="space-y-4">
            <Field label="Nombre Completo" icon={User}>
              <FInput
                {...register("full_name")}
                placeholder="Nombre completo"
                error={formErrors.full_name?.message ?? errors.full_name}
              />
            </Field>

            <Field label="Correo Electrónico" icon={Mail}>
              <FInput
                {...register("email")}
                type="email"
                placeholder="correo@ejemplo.com"
                error={formErrors.email?.message ?? errors.email}
              />
            </Field>

            <Field label="Teléfono" icon={Phone}>
              <FInput
                {...register("phone")}
                type="tel"
                placeholder="Teléfono móvil"
                error={formErrors.phone?.message ?? errors.phone}
              />
            </Field>

            <Field label="Ciudad" icon={MapPin}>
              <Controller
                control={control}
                name="city_id"
                render={({ field }) => (
                  <Select
                    options={cityOptions}
                    placeholder="Seleccionar ciudad"
                    noOptionsMessage={() => "No hay ciudades"}
                    styles={selectStyles}
                    value={
                      cityOptions.find((c) => c.value === field.value) || null
                    }
                    onChange={(val) => field.onChange(val?.value ?? "")}
                  />
                )}
              />
              {(formErrors.city_id?.message ?? errors.city_id) && (
                <p className="text-xs text-pharmako-danger mt-1 font-medium">
                  {formErrors.city_id?.message ?? errors.city_id}
                </p>
              )}
            </Field>
          </div>
        </Card>

        {/* Card 2: Firma Digital e Info */}
        <Card title="Firma y Licencias" icon={FileText}>
          <div className="space-y-5">
            {initial.role === "DOCTOR" && (
              <div className="space-y-2">
                <Field label="Firma Digital (Sello)" icon={FileText}>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 border border-dashed border-pharmako-border rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                      {sigPreview ? (
                        <img
                          src={sigPreview}
                          alt="Firma"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-pharmako-text-muted font-medium">
                          Sin firma
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => sigInputRef.current?.click()}
                        className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-xs font-bold"
                      >
                        Subir firma
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={sigInputRef}
                      onChange={handleSigChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="space-y-0.5 text-xs text-pharmako-text-secondary">
                      <p className="font-semibold text-pharmako-text-primary">
                        Firma Médica
                      </p>
                      <p className="text-[10px] text-pharmako-text-muted">
                        Formatos JPG/PNG. Máx 1MB.
                      </p>
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {initial.provider_profile && (
              <div className="bg-slate-50 border border-pharmako-border-soft rounded-xl p-4 mt-2">
                <p className="text-xs font-bold text-pharmako-text-primary uppercase tracking-wide border-b border-pharmako-border-soft pb-2 mb-3">
                  Datos del Proveedor
                </p>
                <div className="space-y-1">
                  <InfoRow
                    label="Nombre Comercial"
                    value={initial.provider_profile.commercial_name}
                  />
                  <InfoRow label="RIF" value={initial.provider_profile.rif} />
                  <InfoRow label="Tipo" value={initial.provider_profile.type} />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-pharmako-border-soft p-4">
              <InfoRow label="Plan de Cuenta" value={initial.plan_type} />
              <InfoRow label="Código de Cuenta" value={initial.uuid} />
            </div>
          </div>
        </Card>
      </div>

      {/* Botón de Guardado */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!isDirty || loading}
          className={[
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm",
            isDirty && !loading
              ? "bg-pharmako-primary hover:bg-pharmako-primary-hover text-white hover:shadow-md cursor-pointer"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando cambios…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Perfil
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface LocalQueueItem {
  id: string;
  entity: string;
  action: string;
  timestamp: string;
}

interface LocalErrorItem {
  id?: number;
  entity: string;
  message: string;
  createdAt?: string;
}

function SyncStatusPanel() {
  const [queue, setQueue] = useState<LocalQueueItem[]>([]);
  const [errors, setErrors] = useState<LocalErrorItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  const loadSyncData = useCallback(async (active: boolean) => {
    try {
      const q = (await db.syncQueue.toArray()) as unknown as LocalQueueItem[];
      const errs =
        (await db.syncErrors.toArray()) as unknown as LocalErrorItem[];
      if (active) {
        setQueue(q);
        setErrors(errs);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Llamada inicial asíncrona diferida para evitar set-state-in-effect warnings síncronos
    const timer = setTimeout(() => {
      loadSyncData(active);
    }, 0);

    const interval = setInterval(() => {
      loadSyncData(active);
    }, 4000);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, [loadSyncData]);

  const handleSyncNow = async () => {
    if (!navigator.onLine) {
      toast.error("No tienes conexión a internet.");
      return;
    }
    setIsSyncing(true);
    try {
      await syncService.sync();
      toast.success("Sincronización completada.");
      await loadSyncData(true);
    } catch {
      // toast.error ya se dispara en el catch de useSync, pero forzamos recarga
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearErrors = async () => {
    try {
      await db.syncErrors.clear();
      toast.success("Historial de errores limpio.");
      await loadSyncData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      appointments: "Cita Médica",
      patients: "Datos del Paciente",
      consultations: "Consulta Médica",
      vital_signs: "Signos Vitales",
      prescriptions: "Receta Médica",
      prescription_items: "Medicamento",
      lab_requests: "Examen de Laboratorio",
      quote_requests: "Solicitud de Presupuesto",
    };
    return labels[entity] ?? entity;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Registrar",
      update: "Actualizar",
      delete: "Eliminar",
    };
    return labels[action] ?? action;
  };

  return (
    <div className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-6 flex flex-col gap-5 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pharmako-border-soft pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#23dce1]/10 rounded-xl border border-pharmako-border-soft">
            <RefreshCw
              className={`h-5 w-5 text-[#23dce1] ${isSyncing ? "animate-spin" : ""}`}
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-pharmako-text-primary">
              Información por Sincronizar
            </h3>
            <p className="text-xs text-pharmako-text-secondary">
              Monitoreo y estado de los cambios guardados localmente en modo sin
              conexión.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5" /> Online
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" /> Offline
              </>
            )}
          </span>

          <Button
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            className="bg-[#23dce1] hover:bg-[#23dce1]/90 text-white font-semibold rounded-xl text-xs h-9 px-4 shrink-0 transition-colors"
          >
            {isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}
          </Button>
        </div>
      </div>

      {/* Listado de colas */}
      {queue.length === 0 && errors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Todos tus datos están sincronizados
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            No tienes cambios pendientes por subir al servidor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cola de Pendientes */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Cambios Pendientes ({queue.length})
            </h4>

            {queue.length === 0 ? (
              <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                Sin cambios pendientes en la cola local.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-[#23dce1]/20 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {getActionLabel(item.action)}{" "}
                        {getEntityLabel(item.entity)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Guardado:{" "}
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 shrink-0">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cola de Errores */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Historial de Errores ({errors.length})
              </h4>
              {errors.length > 0 && (
                <button
                  onClick={handleClearErrors}
                  className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="size-3.5" /> Limpiar
                </button>
              )}
            </div>

            {errors.length === 0 ? (
              <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                Sin errores registrados.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {errors.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="flex flex-col gap-1 p-3 rounded-xl border border-red-100 bg-red-50/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                        {getEntityLabel(item.entity)}
                      </span>
                      <span className="text-[9px] text-red-500/80">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-red-900 font-medium">
                      {item.message || "Error al sincronizar"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProfileView Principal ───────────────────────────────────

export function ProfileView() {
  const { userType } = useAuthStore();
  const isPatient = userType === "patient";

  const [profileData, setProfileData] = useState<
    PatientAccount | UserProfile | null
  >(null);
  const [loading, setLoading] = useState(() => {
    // Si no estamos en el navegador, iniciamos en true
    if (typeof window === "undefined") return true;
    return true;
  });
  const hasFetched = useRef(false);
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "schedule">(
    "profile",
  );

  useEffect(() => {
    if (!userType || hasFetched.current) return;
    hasFetched.current = true;

    const endpoint = isPatient ? "/auth/patients/me" : "/auth/users/me";
    const profileId = isPatient ? "patient" : "user";

    const loadProfile = async () => {
      try {
        // 1. Buscamos primero si hay un perfil editado offline en IndexedDB
        const pending = await db.pendingProfileUpdates.get(profileId);

        if (pending) {
          const parsed = JSON.parse(pending.payload);
          if (isPatient) {
            setProfileData({
              id: "",
              uuid: "",
              full_name: parsed.full_name,
              fullName: parsed.full_name,
              email: parsed.email,
              phone: parsed.phone,
              username: parsed.username,
              nationalId: parsed.national_id,
              cityId: parsed.city_id,
              avatarUrl: parsed.avatar_url,
              address: parsed.address,
              birthDate: parsed.birth_date,
              gender: parsed.gender,
              bloodType: parsed.blood_type,
              allergies: parsed.allergies,
              chronicConditions: parsed.chronic_conditions,
              emergencyContactName: parsed.emergency_contact_name,
              emergencyContactPhone: parsed.emergency_contact_phone,
              is_active: true,
              status: "ACTIVE",
              created_at: "",
              updated_at: "",
            } as PatientAccount);
          } else {
            setProfileData({
              id: "",
              uuid: "",
              fullName: parsed.full_name,
              email: parsed.email,
              phone: parsed.phone,
              city_id: parsed.city_id,
              logo_url: parsed.logo_url,
              signature_url: parsed.signature_url,
              is_active: true,
              status: "ACTIVE",
              role: "DOCTOR",
              is_verified: true,
              created_at: "",
              updated_at: "",
            } as UserProfile);
          }

          // Si estamos offline, no llamamos a la API y quitamos el loading overlay
          if (!navigator.onLine) {
            setLoading(false);
            return;
          }
        }

        // 2. Si estamos online, consultamos los datos frescos del servidor
        const { data } = await apiClient.get<{
          user: PatientAccount | UserProfile;
        }>(endpoint);

        // Mezclamos la respuesta del backend con el cambio local pendiente si existe
        if (pending) {
          const parsed = JSON.parse(pending.payload);
          if (isPatient) {
            setProfileData({
              ...data.user,
              ...parsed,
              fullName: parsed.full_name,
              nationalId: parsed.national_id,
              cityId: parsed.city_id,
              avatarUrl: parsed.avatar_url,
              birthDate: parsed.birth_date,
              bloodType: parsed.blood_type,
              chronicConditions: parsed.chronic_conditions,
              emergencyContactName: parsed.emergency_contact_name,
              emergencyContactPhone: parsed.emergency_contact_phone,
            } as PatientAccount);
          } else {
            setProfileData({
              ...data.user,
              ...parsed,
            } as UserProfile);
          }
        } else {
          setProfileData(data.user);
        }
      } catch (err) {
        // Si falló pero al menos tenemos datos locales renderizados, no molestamos con alertas
        const hasLocal = await db.pendingProfileUpdates.get(profileId);
        if (!hasLocal) {
          toast.error("No se pudo cargar el perfil del usuario.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userType, isPatient]);

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
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
      className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6"
    >
      {/* Título de la Página */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mi Perfil
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Gestiona tu información personal, médica y configuración de la
          plataforma LUCA.
        </p>
      </div>

      {/* Selector de pestañas (solo para médicos) */}
      {!isPatient && user?.role === "DOCTOR" && (
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "profile"
                ? "bg-white text-pharmako-care border-b border-pharmako-care"
                : "text-pharmako-text-secondary hover:text-pharmako-text-primary"
            }`}
          >
            <User className="w-4 h-4" />
            Perfil Profesional
          </button>
          <button
            onClick={() => setActiveSubTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeSubTab === "schedule"
                ? "bg-white text-pharmako-care border-b border-pharmako-care"
                : "text-pharmako-text-secondary hover:text-pharmako-text-primary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Horarios de Atención
          </button>
        </div>
      )}

      {/* Contenido de la pestaña activa con animaciones */}
      <AnimatePresence mode="wait">
        {activeSubTab === "profile" ? (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
            <div className="bg-pharmako-surface rounded-xl ">
              {isPatient ? (
                <PatientFormInner initial={patient} />
              ) : (
                <UserProfileFormInner initial={user} />
              )}
            </div>
            <SyncStatusPanel />
          </motion.div>
        ) : (
          <motion.div
            key="schedule-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <DoctorScheduleView />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
