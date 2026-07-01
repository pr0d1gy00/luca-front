import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import { institutionRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterProviderMutation } from "../hooks/useAuth";
import { useGetCities } from "../hooks/useGetCities";
import { useAuthStore } from "@/store/auth";
import type { UserProfile } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof institutionRegisterSchema>;

const INPUTS = [
  {
    name: "legalName" as const,
    placeholder: "Nombre Legal (Representante)",
    type: "text",
  },
  {
    name: "commercialName" as const,
    placeholder: "Nombre Comercial",
    type: "text",
  },
  {
    name: "taxId" as const,
    placeholder: "Identificador Fiscal (RIF)",
    type: "text",
  },
  {
    name: "phoneNumber" as const,
    placeholder: "Número de Teléfono",
    type: "tel",
  },
  { name: "email" as const, placeholder: "Correo Electrónico", type: "email" },
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

export default function FormRegisterInstitution({
  typeProfile,
}: {
  typeProfile: string;
}) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { data: cities, isLoading: loadingCities } = useGetCities();
  const registerProvider = useRegisterProviderMutation();

  const { control, handleSubmit, setError } = useForm<IFormInput>({
    resolver: zodResolver(institutionRegisterSchema),
    defaultValues: {
      legalName: "",
      commercialName: "",
      taxId: "",
      phoneNumber: "",
      email: "",
      cityId: "",
      type: "pharmacy",
      businessDocument: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const { field: cityField } = useController({ control, name: "cityId" });
  const { field: typeField, fieldState: typeFieldState } = useController({
    control,
    name: "type",
  });
  const { field: docField, fieldState: docFieldState } = useController({
    control,
    name: "businessDocument",
  });

  const onSubmit = async (data: IFormInput) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.legalName);
      formData.append("commercialName", data.commercialName);
      formData.append("rif", data.taxId);
      formData.append("phone", data.phoneNumber);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.cityId) {
        formData.append("cityId", data.cityId);
      }

      // Convertimos a mayúsculas: pharmacy -> PHARMACY, laboratory -> LABORATORY
      // El backend no soporta "clinic" para registro público, por ende solo mostramos farmacias y laboratorios
      const mappedType =
        data.type === "clinic" ? "PHARMACY" : data.type.toUpperCase();
      formData.append("providerType", mappedType);

      // Archivo binario
      formData.append("businessDocument", data.businessDocument);

      const res = await registerProvider.mutateAsync(formData);
      const user = res.user as UserProfile;

      setAuth(res.access_token, "user", user);

      toast.success("¡Institución registrada exitosamente!");
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
          if (key === "fullName") formKey = "legalName";
          if (key === "commercialName") formKey = "commercialName";
          if (key === "rif") formKey = "taxId";
          if (key === "phone") formKey = "phoneNumber";
          if (key === "businessDocument") formKey = "businessDocument";
          if (key === "providerType") formKey = "type";

          setError(formKey, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
        toast.error("Por favor corrija los campos inválidos.");
      } else {
        toast.error(
          e.response?.data?.message ??
            "Error al registrar la cuenta de la institución.",
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
      {/* Selector de Tipo de Institución */}
      <div className="space-y-1">
        <select
          value={typeField.value}
          onChange={(e) => typeField.onChange(e.target.value)}
          className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-pharmako-border 
                     text-base text-pharmako-text-primary focus:border-2 focus:border-pharmako-primary 
                     transition-all duration-200 outline-none"
        >
          <option value="pharmako">Selecciona Tipo de Institución</option>
          <option value="pharmacy">Farmacia</option>
          <option value="laboratory">Laboratorio</option>
        </select>
        {typeFieldState.error && (
          <p className="text-sm text-red-500">{typeFieldState.error.message}</p>
        )}
      </div>

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

      {/* Carga de Documento de Registro */}
      <div className="space-y-2 mt-1">
        <label className="text-sm font-medium text-pharmako-text-secondary">
          Registro Mercantil o RIF Digital (PDF, JPG, PNG - Max: 10MB)
        </label>
        <div className="relative">
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              docField.value
                ? "bg-teal-50/50 border-teal-500/50"
                : "bg-white border-slate-200 hover:border-pharmako-primary/50"
            }`}
          >
            <FileUp
              className={`size-6 mb-1 ${
                docField.value ? "text-teal-600" : "text-slate-400"
              }`}
            />
            <span className="text-xs text-slate-500 text-center">
              {docField.value
                ? (docField.value as File).name
                : "Subir archivo o arrastrar aquí"}
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  docField.onChange(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
        {docFieldState.error && (
          <p className="text-sm text-red-500">{docFieldState.error.message}</p>
        )}
      </div>

      <div className="pt-2">
        <LoginButton
          onClick={() => handleSubmit(onSubmit)()}
          loading={registerProvider.isPending}
        >
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
