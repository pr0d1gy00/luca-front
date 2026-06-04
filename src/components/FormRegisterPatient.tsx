import { patientRegisterSchema } from "@/app/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";
import { motion } from "motion/react";
import { PharmakoInput, LoginButton } from "@/components/pharmako-login";
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
  const { control, handleSubmit } = useForm<IFormInput>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: IFormInput) => {
    console.log(data);
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

      <div className="pt-2">
        <LoginButton onClick={() => handleSubmit(onSubmit)()} loading={false}>
          Crear cuenta de {typeProfile}
        </LoginButton>
      </div>
    </motion.form>
  );
}
