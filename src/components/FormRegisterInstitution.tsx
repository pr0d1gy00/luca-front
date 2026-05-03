import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { z } from "zod";
import { institutionRegisterSchema } from "@/app/lib/validations";
import InputLogin from "./InputLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type IFormInput = z.infer<typeof institutionRegisterSchema>;

const inputs = [
  {
    name: "legalName",
    placeholder: "Nombre Legal (Razón Social)",
    type: "text",
  },
  {
    name: "commercialName",
    placeholder: "Nombre Comercial",
    type: "text",
  },
  {
    name: "taxId",
    placeholder: "Identificador Fiscal (RUC/NIT/CIF)",
    type: "text",
  },
  {
    name: "phoneNumber",
    placeholder: "Número de Teléfono",
    type: "text",
  },
  {
    name: "email",
    placeholder: "Correo Electronico",
    type: "email",
  },
  {
    name: "password",
    placeholder: "Contraseña",
    type: "password",
  },
  {
    name: "confirmPassword",
    placeholder: "Repetir Contraseña",
    type: "password",
  },
];
export default function FormRegisterInstitution({
  typeProfile,
}: {
  typeProfile: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(institutionRegisterSchema),
  });
  const onSubmit = (data: IFormInput) => {
    console.log(data);
  };
  return (
    <motion.form
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center w-[70%] py-8 gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      {inputs.map((i) => {
        return (
          <div className="w-full" key={i.name}>
            <InputLogin
              placeholder={i.placeholder}
              type={i.type}
              {...register(i.name as keyof IFormInput)}
            />
            {errors[i.name as keyof IFormInput] && (
              <p className="text-red-500">
                {errors[i.name as keyof IFormInput]?.message}
              </p>
            )}
          </div>
        );
      })}
      <motion.button
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="w-full font-bold bg-luca-primary text-white rounded-[3rem] p-6 cursor-pointer hover:scale-105 transition-all duration-300 mt-12"
      >
        Crear cuenta de {typeProfile}
      </motion.button>{" "}
    </motion.form>
  );
}
