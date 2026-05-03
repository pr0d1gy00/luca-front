import { useState } from "react";
import TypeProfile from "./TypeProfile";
import { User, Stethoscope, Hospital } from "lucide-react";
import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { windowTransitionVariant } from "@/app/lib/animations";
import FormRegisterMedical from "./FormRegisterMedical";
import FormRegisterInstitution from "./FormRegisterInstitution";
import FormRegisterPatient from "./FormRegisterPatient";

export default function FormRegister() {
  const [typeProfile, setTypeProfile] = useState("Paciente");

  return (
    <motion.div
      className="flex flex-col w-full items-center"
      variants={windowTransitionVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="w-[70%]  mt-8">
        <motion.p
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="text-black font-semibold text-start w-full"
        >
          Seleccionar Perfil
        </motion.p>
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between w-full "
        >
          <TypeProfile
            Icon={User}
            onClick={() => setTypeProfile("Paciente")}
            isActive={typeProfile === "Paciente"}
          />
          <TypeProfile
            Icon={Stethoscope}
            onClick={() => setTypeProfile("Medico")}
            isActive={typeProfile === "Medico"}
          />
          <TypeProfile
            Icon={Hospital}
            onClick={() => setTypeProfile("Institución")}
            isActive={typeProfile === "Institución"}
          />
        </motion.div>
      </div>
      {typeProfile === "Paciente" && (
        <FormRegisterPatient typeProfile={typeProfile} />
      )}
      {typeProfile === "Medico" && (
        <FormRegisterMedical typeProfile={typeProfile} />
      )}
      {typeProfile === "Institución" && (
        <FormRegisterInstitution typeProfile={typeProfile} />
      )}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-[70%] py-8 gap-4 "
      ></motion.div>
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
    </motion.div>
  );
}
