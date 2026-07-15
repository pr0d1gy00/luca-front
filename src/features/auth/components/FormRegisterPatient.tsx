import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { patientRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterPatientMutation } from "../hooks/useAuth";
import { useGetCountries, useGetCountryCities } from "../hooks/useGetCities";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type { PatientAccount } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof patientRegisterSchema>;

function ControlledInput({
  control,
  name,
  placeholder,
  type,
}: {
  control: Control<IFormInput>;
  name: keyof IFormInput;
  placeholder: string;
  type: string;
}) {
  const { field, fieldState } = useController({ control, name });
  return (
    <PharmakoInput
      label=""
      placeholder={placeholder}
      type={type}
      value={typeof field.value === "string" ? field.value : ""}
      onChange={(v) => field.onChange(v)}
      error={fieldState.error?.message}
    />
  );
}

export default function FormRegisterPatient({
  typeProfile,
}: {
  typeProfile: string;
}) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [nationalIdPrefix, setNationalIdPrefix] = useState("V-");
  const [phonePrefix, setPhonePrefix] = useState("+58");
  const [selectedCountryUuid, setSelectedCountryUuid] = useState("");

  const { data: countries, isLoading: loadingCountries } = useGetCountries();
  const { data: cities, isLoading: loadingCities } =
    useGetCountryCities(selectedCountryUuid);
  const registerPatient = useRegisterPatientMutation();

  const { control, handleSubmit, setError } = useForm<IFormInput>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nationalId: "",
      cityId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { field: cityField, fieldState: cityFieldState } = useController({
    control,
    name: "cityId",
  });

  const onSubmit = async (data: IFormInput) => {
    try {
      const fullPhone = `${phonePrefix}${data.phone}`;
      const fullNationalId = data.nationalId
        ? `${nationalIdPrefix}${data.nationalId}`
        : undefined;

      await registerPatient.mutateAsync({
        fullName: data.name,
        email: data.email || undefined,
        phone: fullPhone,
        nationalId: fullNationalId,
        password: data.password,
        cityId: data.cityId || undefined,
      });

      const { data: patientFull } =
        await apiClient.get<PatientAccount>("/auth/patients/me");

      setAuth("patient", patientFull, true);

      toast.success("¡Cuenta creada exitosamente!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as {
        response?: {
          status?: number;
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const backendErrors = e.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          let formKey: keyof IFormInput = key as keyof IFormInput;
          if (key === "fullName") formKey = "name";
          if (key === "nationalId") formKey = "nationalId";

          setError(formKey, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
        toast.error("Por favor corrija los campos inválidos.");
      } else {
        toast.error(
          e.response?.data?.message ?? "Error al intentar registrar la cuenta.",
        );
      }
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ControlledInput
        control={control}
        name="name"
        placeholder="Nombre Completo"
        type="text"
      />
      <ControlledInput
        control={control}
        name="email"
        placeholder="Correo Electrónico"
        type="email"
      />

      {/* DNI y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-pharmako-text-secondary">
            Cédula / DNI
          </label>
          <div className="flex gap-1.5">
            <select
              value={nationalIdPrefix}
              onChange={(e) => setNationalIdPrefix(e.target.value)}
              className="px-3 py-3 rounded-xl bg-white border border-pharmako-border text-base text-pharmako-text-primary outline-none focus:border-pharmako-primary"
            >
              <option value="V-">V-</option>
              <option value="E-">E-</option>
              <option value="J-">J-</option>
              <option value="G-">G-</option>
            </select>
            <div className="flex-1">
              <ControlledInput
                control={control}
                name="nationalId"
                placeholder="Número de Cédula"
                type="text"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-pharmako-text-secondary">
            Teléfono Celular
          </label>
          <div className="flex gap-1.5">
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="px-3 py-3 rounded-xl bg-white border border-pharmako-border text-base text-pharmako-text-primary outline-none focus:border-pharmako-primary"
            >
              <option value="+58">+58 (VE)</option>
              <option value="+57">+57 (CO)</option>
              <option value="+56">+56 (CL)</option>
              <option value="+1">+1 (US/DO)</option>
            </select>
            <div className="flex-1">
              <ControlledInput
                control={control}
                name="phone"
                placeholder="Número de Teléfono"
                type="tel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de País -> Ciudad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-pharmako-text-secondary">
            País
          </label>
          <select
            value={selectedCountryUuid}
            onChange={(e) => {
              setSelectedCountryUuid(e.target.value);
              cityField.onChange("");
            }}
            disabled={loadingCountries}
            className="w-full px-4 py-3 rounded-xl bg-white border border-pharmako-border 
                       text-base text-pharmako-text-primary placeholder:text-pharmako-text-muted 
                       focus:border-2 focus:border-pharmako-primary transition-all duration-200 outline-none"
          >
            <option value="">Selecciona tu País</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-pharmako-text-secondary">
            Ciudad
          </label>
          <select
            value={cityField.value || ""}
            onChange={(e) => cityField.onChange(e.target.value)}
            disabled={loadingCities || !selectedCountryUuid}
            className="w-full px-4 py-3 rounded-xl bg-white border border-pharmako-border 
                       text-base text-pharmako-text-primary placeholder:text-pharmako-text-muted 
                       focus:border-2 focus:border-pharmako-primary transition-all duration-200 outline-none
                       disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {!selectedCountryUuid
                ? "Selecciona un país primero"
                : "Selecciona tu Ciudad (Opcional)"}
            </option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {cityFieldState.error && (
            <p className="text-sm text-red-500">
              {cityFieldState.error.message}
            </p>
          )}
        </div>
      </div>

      <ControlledInput
        control={control}
        name="password"
        placeholder="Contraseña"
        type="password"
      />
      <ControlledInput
        control={control}
        name="confirmPassword"
        placeholder="Repetir Contraseña"
        type="password"
      />

      <div className="pt-2">
        <LoginButton type="submit" loading={registerPatient.isPending}>
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
