import InputLogin from "./InputLogin";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { baseAuthSchema } from "@/app/lib/validations";

type IFormInput = z.infer<typeof baseAuthSchema>;

export default function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(baseAuthSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);

  return (
    <form
      className="flex flex-col items-center w-[70%] py-8 gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <motion.h2
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="text-4xl font-bold text-luca-primary-hover"
      >
        Bienvenido a <span className="text-luca-accent">LucaMed</span>
      </motion.h2>
      <motion.p
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="text-xl text-gray-600 mb-8"
      >
        Tu sistema para sentirte mejor
      </motion.p>
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-full gap-4 "
      >
        <InputLogin
          placeholder="Correo Electronico"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
        <div className="relative w-full">
          <InputLogin
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            {...register("password")}
          />
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-6 right-6 cursor-pointer"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </motion.button>
        </div>
      </motion.div>
      <motion.button
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="w-full font-bold bg-luca-primary text-white rounded-[3rem] p-6 cursor-pointer hover:scale-105 transition-all duration-300 mt-12"
      >
        Iniciar Sesion
      </motion.button>
      <motion.button
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="text-luca-accent font-bold hover:underline cursor-pointer"
      >
        ¿Olvidaste tu contraseña?
      </motion.button>
      <motion.div variants={fadeUpVariant} initial="hidden" animate="visible">
        <p>
          Al continuar, aceptas los{" "}
          <span className="underline text-luca-accent">Términos</span> y{" "}
          <span className="underline text-luca-accent">
            Política de Privacidad
          </span>{" "}
          de LucaMed
        </p>
      </motion.div>
    </form>
  );
}
