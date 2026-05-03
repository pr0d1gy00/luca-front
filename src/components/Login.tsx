"use client";
import { useState } from "react";
import AuthTabs from "./AuthTabs";
import FormRegister from "./FormRegister";
import FormLogin from "./FormLogin";
import { motion } from "motion/react";
import { windowTransitionVariant } from "@/app/lib/animations";
import LucaBgGreenLogo from "../../public/luca-bggreen.png";
import Image from "next/image";
const Login = () => {
  const [tab, setTab] = useState("Login");
  return (
    <motion.div
      className="flex items-center justify-center h-screen w-full"
      variants={windowTransitionVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="w-1/2 h-screen bg-luca-primary ">
        <div className="flex flex-col items-center justify-center h-screen">
          <Image
            src={LucaBgGreenLogo.src}
            alt="LucaBgGreenLogo"
            width={200}
            height={200}
          />
          <h2 className="text-2xl font-semibold text-luca-surface-dark">
            Bienvenido a tu clínica virtual
          </h2>
        </div>
      </div>
      <div className="w-1/2 h-screen bg-luca-surface flex flex-col items-center justify-center">
        <div className="bg-luca-surface-light rounded-[5rem] w-[60%] h-auto flex flex-col items-center pb-12 shadow-md">
          <div className="flex justify-center w-[70%] p-8 gap-8 ">
            <AuthTabs
              title="Iniciar Sesion"
              onClick={() => setTab("Login")}
              isActive={tab === "Login"}
            />
            <AuthTabs
              title="Crear cuenta"
              onClick={() => setTab("Signup")}
              isActive={tab === "Signup"}
            />
          </div>
          {tab === "Login" ? <FormLogin /> : <FormRegister />}
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
