import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import { doctorRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterDoctorMutation } from "../hooks/useAuth";
import { useGetCities } from "../hooks/useGetCities";
import { useGetSpecialties } from "../hooks/useGetSpecialties";
import { useAuthStore } from "@/store/auth";
import type { UserProfile } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof doctorRegisterSchema>;

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

export default function FormRegisterMedical({
  typeProfile,
}: {
  typeProfile: string;
}) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { data: cities, isLoading: loadingCities } = useGetCities();
  const { data: specialties, isLoading: loadingSpecs } = useGetSpecialties();
  const registerDoctor = useRegisterDoctorMutation();

  const { control, handleSubmit, setError } = useForm<IFormInput>({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cityId: "",
      specialtyIds: [],
      medicalLicense: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const { field: cityField } = useController({ control, name: "cityId" });
  const { field: specField, fieldState: specFieldState } = useController({
    control,
    name: "specialtyIds",
  });
  const { field: licenseField, fieldState: licenseFieldState } = useController({
    control,
    name: "medicalLicense",
  });

  const handleToggleSpecialty = (id: string) => {
    const current = (specField.value as string[]) || [];
    if (current.includes(id)) {
      specField.onChange(current.filter((x) => x !== id));
    } else {
      specField.onChange([...current, id]);
    }
  };

  const onSubmit = async (data: IFormInput) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (data.phone) formData.append("phone", data.phone);
      if (data.cityId) formData.append("cityId", data.cityId);

      // Formato array indexado de Laravel para campos múltiples
      const selectedSpecs = (data.specialtyIds as string[]) || [];
      selectedSpecs.forEach((id, index) => {
        formData.append(`specialtyIds[${index}]`, id);
      });

      // Archivo binario de la licencia médica
      formData.append("medicalLicense", data.medicalLicense);

      const res = await registerDoctor.mutateAsync(formData);
      const user = res.user as UserProfile;

      setAuth(res.access_token, "user", user);

      toast.success("¡Médico registrado exitosamente!");
      router.push("/dashboard/pending-verification");
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
          if (key === "medicalLicense") formKey = "medicalLicense";
          if (key.startsWith("specialtyIds")) formKey = "specialtyIds";

          setError(formKey, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
        toast.error("Por favor corrija los campos inválidos.");
      } else {
        toast.error(
          e.response?.data?.message ??
            "Error al registrar la cuenta del médico.",
        );
      }
    }
  };

  const selectedSpecialties = (specField.value as string[]) || [];

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
      <div className="space-y-1">
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
              {city.name} ({city.state.name})
            </option>
          ))}
        </select>
      </div>

      {/* Especialidades */}
      <div className="space-y-2 mt-1">
        <label className="text-sm font-medium text-pharmako-text-secondary">
          Especialidades Médicas (Mínimo una)
        </label>
        {loadingSpecs ? (
          <p className="text-xs text-pharmako-text-muted">
            Cargando especialidades...
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {specialties?.map((spec) => {
              const active = selectedSpecialties.includes(spec.id);
              return (
                <button
                  type="button"
                  key={spec.id}
                  onClick={() => handleToggleSpecialty(spec.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-500/50"
                  }`}
                >
                  {spec.name}
                </button>
              );
            })}
          </div>
        )}
        {specFieldState.error && (
          <p className="text-sm text-red-500">{specFieldState.error.message}</p>
        )}
      </div>

      {/* Carga del Título/Licencia Médica */}
      <div className="space-y-2 mt-1">
        <label className="text-sm font-medium text-pharmako-text-secondary">
          Licencia Médica o Título (PDF, JPG, PNG - Max: 10MB)
        </label>
        <div className="relative">
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              licenseField.value
                ? "bg-teal-50/50 border-teal-500/50"
                : "bg-white border-slate-200 hover:border-pharmako-primary/50"
            }`}
          >
            <FileUp
              className={`size-6 mb-1 ${
                licenseField.value ? "text-teal-600" : "text-slate-400"
              }`}
            />
            <span className="text-xs text-slate-500 text-center">
              {licenseField.value
                ? (licenseField.value as File).name
                : "Subir archivo o arrastrar aquí"}
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  licenseField.onChange(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
        {licenseFieldState.error && (
          <p className="text-sm text-red-500">
            {licenseFieldState.error.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <LoginButton
          onClick={() => handleSubmit(onSubmit)()}
          loading={registerDoctor.isPending}
        >
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
