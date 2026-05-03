import { patientRegisterSchema } from "@/app/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputLogin from "./InputLogin";
import { fadeUpVariant } from "@/app/lib/animations";
import { motion } from "motion/react";
type IFormInput = z.infer<typeof patientRegisterSchema>;
const inputs = [
  {
    name: "name",
    placeholder: "Nombre Completo",
    type: "text",
  },
  {
    name: "email",
    placeholder: "Correo Electronico",
    type: "email",
  },
  {
    name: "phone",
    placeholder: "Número de Teléfono",
    type: "text",
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
export default function FormRegisterPatient({
  typeProfile,
}: {
  typeProfile: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(patientRegisterSchema),
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
        type="submit"
      >
        Crear cuenta de {typeProfile}
      </motion.button>
    </motion.form>
  );
}
