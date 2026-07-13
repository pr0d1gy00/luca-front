"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  X,
  User,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Droplet,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { z } from "zod";
import type { Patient } from "../types";

const patientFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  nationalId: z.string().min(1, "El documento es requerido"),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida" }),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  address: z.string().min(1, "La dirección es requerida"),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: Patient) => void;
  onCancel: () => void;
}

const BLOOD_TYPES = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

const inputClassName =
  "h-11 pl-10 w-full rounded-xl border border-slate-200 bg-white pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-11 pl-10 pr-10 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 transition-all outline-none focus-visible:border-pharmako-care focus-visible:ring-2 focus-visible:ring-pharmako-care/20";

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [allergies, setAllergies] = useState<string[]>(
    initialData?.allergies
      ? (typeof initialData.allergies === "string"
        ? initialData.allergies.split(",").map((s) => s.trim()).filter(Boolean)
        : initialData.allergies)
      : [],
  );
  const [chronicConditions, setChronicConditions] = useState<string[]>(
    initialData?.chronicConditions
      ? (typeof initialData.chronicConditions === "string"
        ? initialData.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean)
        : initialData.chronicConditions)
      : [],
  );
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      nationalId: initialData?.nationalId ?? "",
      birthDate: initialData?.birthDate
        ? new Date(initialData.birthDate)
        : undefined,
      gender: (initialData?.gender as any) === "MALE" ? "male" : ((initialData?.gender as any) === "FEMALE" ? "female" : (initialData?.gender ?? "male")),
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",
      bloodType: initialData?.bloodType ?? "O_POSITIVE",
      allergies: initialData?.allergies
        ? (typeof initialData.allergies === "string"
          ? initialData.allergies.split(",").map((s) => s.trim()).filter(Boolean)
          : initialData.allergies)
        : [],
      chronicConditions: initialData?.chronicConditions
        ? (typeof initialData.chronicConditions === "string"
          ? initialData.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean)
          : initialData.chronicConditions)
        : [],
      emergencyContactName: initialData?.emergencyContactName ?? "",
      emergencyContactPhone: initialData?.emergencyContactPhone ?? "",
    },
  });

  const addAllergy = () => {
    if (newAllergy.trim()) {
      const updated = [...allergies, newAllergy.trim()];
      setAllergies(updated);
      setValue("allergies", updated);
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    const updated = allergies.filter((_, i) => i !== index);
    setAllergies(updated);
    setValue("allergies", updated);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      const updated = [...chronicConditions, newCondition.trim()];
      setChronicConditions(updated);
      setValue("chronicConditions", updated);
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    const updated = chronicConditions.filter((_, i) => i !== index);
    setChronicConditions(updated);
    setValue("chronicConditions", updated);
  };

  const onSubmitWrapper = (values: PatientFormValues) => {
    const formatted: Patient = {
      ...values,
      uuid: initialData?.uuid ?? "",
      birthDate: values.birthDate instanceof Date
        ? values.birthDate.toISOString().split("T")[0]
        : String(values.birthDate),
      allergies: (values.allergies ?? []).join(", "),
      chronicConditions: (values.chronicConditions ?? []).join(", "),
      privateNotes: initialData?.privateNotes ?? "",
      cityId: initialData?.cityId ?? null,
    } as unknown as Patient;
    onSubmit(formatted);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitWrapper)} className="flex flex-col gap-10">
      {/* ── Identidad ─────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
          DATOS DE IDENTIDAD
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="firstName"
              className="text-sm font-semibold text-slate-800"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="firstName"
                type="text"
                placeholder="Juan"
                className={inputClassName}
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="lastName"
              className="text-sm font-semibold text-slate-800"
            >
              Apellido <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="lastName"
                type="text"
                placeholder="Pérez"
                className={inputClassName}
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nationalId"
              className="text-sm font-semibold text-slate-800"
            >
              Cédula / DNI <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <FileText className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="nationalId"
                type="text"
                placeholder="12.345.678"
                className={inputClassName}
                aria-invalid={!!errors.nationalId}
                {...register("nationalId")}
              />
            </div>
            {errors.nationalId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.nationalId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="birthDate"
              className="text-sm font-semibold text-slate-800"
            >
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="birthDate"
                type="date"
                className={inputClassName}
                aria-invalid={!!errors.birthDate}
                {...register("birthDate", { valueAsDate: true })}
              />
            </div>
            {errors.birthDate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.birthDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="gender"
              className="text-sm font-semibold text-slate-800"
            >
              Sexo biológico <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <UserCheck className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <select
                id="gender"
                className={selectClassName}
                {...register("gender")}
              >
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="bloodType"
              className="text-sm font-semibold text-slate-800"
            >
              Grupo Sanguíneo <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Droplet className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <select
                id="bloodType"
                className={selectClassName}
                {...register("bloodType")}
              >
                {BLOOD_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.bloodType && (
              <p className="text-xs text-red-500 mt-1">
                {errors.bloodType.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
          DATOS DE CONTACTO
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-slate-800"
            >
              Teléfono de contacto <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="phone"
                type="text"
                placeholder="+54 11 1234-5678"
                className={inputClassName}
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-800"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="juan.perez@mail.com"
                className={inputClassName}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="address"
            className="text-sm font-semibold text-slate-800"
          >
            Dirección residencial <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
            <input
              id="address"
              type="text"
              placeholder="Av. Rivadavia 1234, Buenos Aires"
              className={inputClassName}
              aria-invalid={!!errors.address}
              {...register("address")}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">
              {errors.address.message}
            </p>
          )}
        </div>
      </section>

      {/* ── Perfil Médico Base ────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
          CONDICIONES MÉDICAS Y ALERGIAS
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Alergias */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">
              Alergias
            </label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <AlertTriangle className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej: Penicilina, mariscos, etc."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAllergy())
                  }
                  className={inputClassName}
                />
              </div>
              <Button
                type="button"
                onClick={addAllergy}
                className="h-11 shrink-0 bg-pharmako-care-light text-pharmako-care hover:bg-pharmako-care-light/80 rounded-xl px-4 font-semibold active:scale-[0.98]"
              >
                <Plus className="size-5" />
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => removeAllergy(i)}
                      className="hover:text-red-500 ml-1 inline-flex p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enfermedades Crónicas */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">
              Enfermedades Crónicas
            </label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <FileText className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej: Diabetes Tipo II, Hipertensión arterial, etc."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCondition())
                  }
                  className={inputClassName}
                />
              </div>
              <Button
                type="button"
                onClick={addCondition}
                className="h-11 shrink-0 bg-pharmako-care-light text-pharmako-care hover:bg-pharmako-care-light/80 rounded-xl px-4 font-semibold active:scale-[0.98]"
              >
                <Plus className="size-5" />
              </Button>
            </div>
            {chronicConditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {chronicConditions.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeCondition(i)}
                      className="hover:text-slate-500 ml-1 inline-flex p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Contacto de Emergencia ────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
          CONTACTO DE EMERGENCIA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="emergencyContactName"
              className="text-sm font-semibold text-slate-800"
            >
              Nombre completo
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="emergencyContactName"
                type="text"
                placeholder="Ej: María Pérez (Cónyuge)"
                className={inputClassName}
                {...register("emergencyContactName")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="emergencyContactPhone"
              className="text-sm font-semibold text-slate-800"
            >
              Teléfono de emergencia
            </label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-pharmako-care transition-colors duration-200 pointer-events-none" />
              <input
                id="emergencyContactPhone"
                type="text"
                placeholder="Ej: +54 11 9876-5432"
                className={inputClassName}
                {...register("emergencyContactPhone")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl h-11 px-6 font-semibold transition-all duration-250 hover:bg-slate-50 active:scale-[0.98]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="rounded-xl bg-pharmako-primary text-white hover:bg-pharmako-primary-hover h-11 px-8 font-semibold transition-all duration-250 active:scale-[0.98]"
        >
          Guardar Paciente
        </Button>
      </div>
    </form>
  );
}
