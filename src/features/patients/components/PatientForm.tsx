"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patientSchema, type Patient } from "../schemas";

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
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
];

const inputClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-luca-muted-dark placeholder:text-luca-muted/50 transition-colors outline-none focus-visible:border-luca-primary focus-visible:ring-2 focus-visible:ring-luca-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-luca-muted-dark transition-colors outline-none focus-visible:border-luca-primary focus-visible:ring-2 focus-visible:ring-luca-primary/20";

export function PatientForm({ initialData, onSubmit, onCancel }: PatientFormProps) {
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies ?? []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(initialData?.chronicConditions ?? []);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Patient>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      documentId: initialData?.documentId ?? "",
      birthDate: initialData?.birthDate ?? new Date(),
      biologicalSex: initialData?.biologicalSex ?? "MALE",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",
      bloodType: initialData?.bloodType ?? "O_POSITIVE",
      allergies: initialData?.allergies ?? [],
      chronicConditions: initialData?.chronicConditions ?? [],
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

      {/* ── Identidad ─────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Identidad
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-luca-muted-dark">
              Nombre
            </label>
            <input id="firstName" type="text" placeholder="Juan" className={inputClassName} aria-invalid={!!errors.firstName} {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.firstName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-luca-muted-dark">
              Apellido
            </label>
            <input id="lastName" type="text" placeholder="Pérez" className={inputClassName} aria-invalid={!!errors.lastName} {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.lastName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="documentId" className="text-sm font-medium text-luca-muted-dark">
              Cédula / DNI
            </label>
            <input id="documentId" type="text" placeholder="12.345.678" className={inputClassName} aria-invalid={!!errors.documentId} {...register("documentId")} />
            {errors.documentId && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.documentId.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthDate" className="text-sm font-medium text-luca-muted-dark">
              Fecha de Nacimiento
            </label>
            <input id="birthDate" type="date" className={inputClassName} aria-invalid={!!errors.birthDate} {...register("birthDate", { valueAsDate: true })} />
            {errors.birthDate && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="biologicalSex" className="text-sm font-medium text-luca-muted-dark">
              Sexo
            </label>
            <select id="biologicalSex" className={selectClassName} {...register("biologicalSex")}>
              {SEX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.biologicalSex && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.biologicalSex.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bloodType" className="text-sm font-medium text-luca-muted-dark">
              Tipo de Sangre
            </label>
            <select id="bloodType" className={selectClassName} {...register("bloodType")}>
              {BLOOD_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.bloodType && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.bloodType.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Contacto ──────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Contacto
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-luca-muted-dark">
              Teléfono
            </label>
            <input id="phone" type="text" placeholder="+54 11 1234-5678" className={inputClassName} aria-invalid={!!errors.phone} {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-luca-muted-dark">
              Email
            </label>
            <input id="email" type="email" placeholder="juan.perez@mail.com" className={inputClassName} aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.email.message}</p>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="address" className="text-sm font-medium text-luca-muted-dark">
              Dirección
            </label>
            <input id="address" type="text" placeholder="Av. Rivadavia 1234, Buenos Aires" className={inputClassName} aria-invalid={!!errors.address} {...register("address")} />
            {errors.address && (
              <p className="text-xs text-luca-accent mt-0.5">{errors.address.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Médico Base ───────────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Médico Base
        </h2>
        <div className="grid grid-cols-2 gap-5">

          {/* Alergias */}
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-luca-muted-dark">Alergias</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar alergia..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                className={inputClassName}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addAllergy}
                className="h-9 shrink-0 bg-luca-surface-light text-luca-primary hover:bg-luca-surface-dark rounded-xl px-3"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {allergies.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-luca-accent/10 px-3 py-1 text-xs font-medium text-luca-accent"
                  >
                    {a}
                    <button type="button" onClick={() => removeAllergy(i)} className="hover:text-luca-accent/70 ml-0.5">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enfermedades Crónicas */}
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-luca-muted-dark">Enfermedades Crónicas</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar condición..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                className={inputClassName}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCondition}
                className="h-9 shrink-0 bg-luca-surface-light text-luca-primary hover:bg-luca-surface-dark rounded-xl px-3"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {chronicConditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {chronicConditions.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-luca-surface-dark px-3 py-1 text-xs font-medium text-luca-muted-dark"
                  >
                    {c}
                    <button type="button" onClick={() => removeCondition(i)} className="hover:text-luca-muted-dark/70 ml-0.5">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Emergencia ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-luca-muted mb-4 pb-2 border-b border-slate-100">
          Contacto de Emergencia
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="emergencyContactName" className="text-sm font-medium text-luca-muted-dark">
              Nombre
            </label>
            <input
              id="emergencyContactName"
              type="text"
              placeholder="María Pérez"
              className={inputClassName}
              {...register("emergencyContactName")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="emergencyContactPhone" className="text-sm font-medium text-luca-muted-dark">
              Teléfono
            </label>
            <input
              id="emergencyContactPhone"
              type="text"
              placeholder="+54 11 9876-5432"
              className={inputClassName}
              {...register("emergencyContactPhone")}
            />
          </div>
        </div>
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" className="rounded-xl bg-luca-primary text-luca-fg-on-primary hover:bg-luca-primary-hover">
          Guardar Paciente
        </Button>
      </div>
    </form>
  );
}