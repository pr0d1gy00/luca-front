import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import { institutionRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterProviderMutation } from "../hooks/useAuth";
import { useGetCountries, useGetCountryCities } from "../hooks/useGetCities";
import { useAuthStore } from "@/store/auth";
import type { UserProfile } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof institutionRegisterSchema>;

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

  const [taxIdPrefix, setTaxIdPrefix] = useState("J-");
  const [phonePrefix, setPhonePrefix] = useState("+58");
  const [selectedCountryUuid, setSelectedCountryUuid] = useState("");

  const { data: countries, isLoading: loadingCountries } = useGetCountries();
  const { data: cities, isLoading: loadingCities } =
    useGetCountryCities(selectedCountryUuid);
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

  const { field: cityField, fieldState: cityFieldState } = useController({
    control,
    name: "cityId",
  });
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

      // Concatenar los prefijos de RIF y Teléfono
      formData.append("rif", `${taxIdPrefix}${data.taxId}`);
      formData.append("phone", `${phonePrefix}${data.phoneNumber}`);

      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.cityId) {
        formData.append("cityId", data.cityId);
      }

      // Convertimos a mayúsculas: pharmacy -> PHARMACY, laboratory -> LABORATORY
      const mappedType =
        data.type === "clinic" ? "PHARMACY" : data.type.toUpperCase();
      formData.append("providerType", mappedType);

      // Archivo binario
      formData.append("businessDocument", data.businessDocument);

      const res = await registerProvider.mutateAsync(formData);
      const user = res.user as UserProfile;
      setAuth("user", user);

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
      encType="multipart/form-data"
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

      <ControlledInput
        control={control}
        name="legalName"
        placeholder="Nombre Legal (Representante)"
        type="text"
      />
      <ControlledInput
        control={control}
        name="commercialName"
        placeholder="Nombre Comercial"
        type="text"
      />

      {/* RIF y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-pharmako-text-secondary">
            RIF (Identificación Fiscal)
          </label>
          <div className="flex gap-1.5">
            <select
              value={taxIdPrefix}
              onChange={(e) => setTaxIdPrefix(e.target.value)}
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
                name="taxId"
                placeholder="Número de RIF"
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
                name="phoneNumber"
                placeholder="Número de Teléfono"
                type="tel"
              />
            </div>
          </div>
        </div>
      </div>

      <ControlledInput
        control={control}
        name="email"
        placeholder="Correo Electrónico"
        type="email"
      />

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
        <LoginButton type="submit" loading={registerProvider.isPending}>
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
