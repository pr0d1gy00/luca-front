import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import { doctorRegisterSchema } from "@/app/lib/validations";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
import { useRegisterDoctorMutation } from "../hooks/useAuth";
import { useGetCountries, useGetCountryCities } from "../hooks/useGetCities";
import { useGetSpecialties } from "../hooks/useGetSpecialties";
import { useAuthStore } from "@/store/auth";
import type { UserProfile } from "../types";
import type { Control } from "react-hook-form";

type IFormInput = z.infer<typeof doctorRegisterSchema>;

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

  const [nationalIdPrefix, setNationalIdPrefix] = useState("V-");
  const [phonePrefix, setPhonePrefix] = useState("+58");
  const [selectedCountryUuid, setSelectedCountryUuid] = useState("");

  const { data: countries, isLoading: loadingCountries } = useGetCountries();
  const { data: cities, isLoading: loadingCities } =
    useGetCountryCities(selectedCountryUuid);
  const { data: specialties, isLoading: loadingSpecs } = useGetSpecialties();
  const registerDoctor = useRegisterDoctorMutation();

  const [specialtiesLimit, setSpecialtiesLimit] = useState(8);

  const { control, handleSubmit, setError } = useForm<IFormInput>({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nationalId: "",
      cityId: "",
      specialtyIds: [],
      medicalLicense: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const { field: cityField, fieldState: cityFieldState } = useController({
    control,
    name: "cityId",
  });
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

      if (data.phone) {
        formData.append("phone", `${phonePrefix}${data.phone}`);
      }
      if (data.nationalId) {
        formData.append("nationalId", `${nationalIdPrefix}${data.nationalId}`);
      }

      if (data.cityId) {
        formData.append("cityId", data.cityId);
      }

      const selectedSpecs = (data.specialtyIds as string[]) || [];
      selectedSpecs.forEach((id, index) => {
        formData.append(`specialtyIds[${index}]`, id);
      });

      formData.append("medicalLicense", data.medicalLicense);

      const res = await registerDoctor.mutateAsync(formData);
      const user = res.user as UserProfile;
      setAuth("user", user);

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
          if (key === "nationalId") formKey = "nationalId";

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

  const selectedSpecialties =
    typeof specField.value === "string"
      ? [specField.value]
      : (specField.value as string[]) || [];

  const visibleSpecialties = specialties?.slice(0, specialtiesLimit) || [];

  return (
    <motion.form
      encType="multipart/form-data"
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

      {/* Especialidades con scroll y paginación */}
      <div className="space-y-2 mt-1">
        <label className="text-sm font-medium text-pharmako-text-secondary block">
          Especialidades Médicas (Mínimo una)
        </label>
        {loadingSpecs ? (
          <p className="text-xs text-pharmako-text-muted">
            Cargando especialidades...
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-pharmako-border-soft rounded-xl p-3 bg-slate-50/50">
              {visibleSpecialties.map((spec) => {
                const active = selectedSpecialties.includes(String(spec.id));
                return (
                  <button
                    type="button"
                    key={spec.id}
                    onClick={() => handleToggleSpecialty(String(spec.id))}
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
            {specialties && specialties.length > specialtiesLimit && (
              <button
                type="button"
                onClick={() => setSpecialtiesLimit((prev) => prev + 12)}
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                Cargar más especialidades (+12)
              </button>
            )}
          </div>
        )}
        {specFieldState.error && (
          <p className="text-sm text-red-500">{specFieldState.error.message}</p>
        )}
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
        <LoginButton type="submit" loading={registerDoctor.isPending}>
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
