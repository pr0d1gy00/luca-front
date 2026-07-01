import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { patientRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterPatientMutation } from "../hooks/useAuth";
import { useGetCities } from "../hooks/useGetCities";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type { PatientAccount } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof patientRegisterSchema>;

const INPUTS = [
  { name: "name" as const, placeholder: "Nombre Completo", type: "text" },
  { name: "email" as const, placeholder: "Correo Electrónico", type: "email" },
  { name: "phone" as const, placeholder: "Número de Teléfono", type: "tel" },
  { name: "password" as const, placeholder: "Contraseña", type: "password" },
  {
    name: "confirmPassword" as const,
    placeholder: "Repetir Contraseña",
    type: "password",
  },
];

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

  const { data: cities, isLoading: loadingCities } = useGetCities();
  const registerPatient = useRegisterPatientMutation();

  const { control, handleSubmit, setError } = useForm<IFormInput>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
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
      const res = await registerPatient.mutateAsync({
        fullName: data.name,
        email: data.email || undefined,
        phone: data.phone,
        password: data.password,
        cityId: data.cityId || undefined,
      });

      // Obtener el perfil completo (PatientAccount) con campos adicionales
      const { data: patientFull } = await apiClient.get<PatientAccount>(
        "/auth/patients/me",
        { headers: { Authorization: `Bearer ${res.access_token}` } },
      );

      setAuth(res.access_token, "patient", patientFull, true);

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
          const formKey: keyof IFormInput =
            key === "fullName" ? "name" : (key as keyof IFormInput);
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
      {INPUTS.map(({ name, placeholder, type }) => (
        <div key={name}>
          <ControlledInput
            control={control}
            name={name}
            placeholder={placeholder}
            type={type}
          />
        </div>
      ))}

      {/* Selector de Ciudad */}
      <div className="space-y-1 mt-1">
        <select
          value={cityField.value || ""}
          onChange={(e) => cityField.onChange(e.target.value)}
          disabled={loadingCities}
          className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-pharmako-border 
                     text-base text-pharmako-text-primary placeholder:text-pharmako-text-muted 
                     focus:border-2 focus:border-pharmako-primary transition-all duration-200 outline-none"
        >
          <option value="">Selecciona tu Ciudad (Opcional)</option>
          {cities?.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name} ({city.state.name}, {city.country.code})
            </option>
          ))}
        </select>
        {cityFieldState.error && (
          <p className="mt-1 text-sm text-red-500">
            {cityFieldState.error.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <LoginButton
          onClick={() => handleSubmit(onSubmit)()}
          loading={registerPatient.isPending}
        >
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
