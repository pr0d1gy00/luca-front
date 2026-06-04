"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { User, Stethoscope, Hospital } from "lucide-react";
import TypeProfile from "@/components/TypeProfile";
import FormRegisterPatient from "@/components/FormRegisterPatient";
import FormRegisterMedical from "@/components/FormRegisterMedical";
import FormRegisterInstitution from "@/components/FormRegisterInstitution";

type ProfileType = "Paciente" | "Medico" | "Institución";

const PROFILES = [
  { type: "Paciente" as ProfileType, Icon: User },
  { type: "Medico" as ProfileType, Icon: Stethoscope },
  { type: "Institución" as ProfileType, Icon: Hospital },
];

export function AuthRegisterContent() {
  const [typeProfile, setTypeProfile] = useState<ProfileType>("Paciente");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-pharmako-text-primary">
            Crear tu cuenta
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-pharmako-text-secondary"
        >
          Elegí tu perfil para empezar
        </motion.p>
      </div>

      {/* Profile Type Selector */}
      <motion.div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {PROFILES.map(({ type, Icon }) => (
          <TypeProfile
            key={type}
            Icon={Icon}
            title={type}
            onClick={() => setTypeProfile(type)}
            isActive={typeProfile === type}
          />
        ))}
      </motion.div>

      {/* Sub-form */}
      <motion.div
        key={typeProfile}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {typeProfile === "Paciente" && (
          <FormRegisterPatient typeProfile={typeProfile} />
        )}
        {typeProfile === "Medico" && (
          <FormRegisterMedical typeProfile={typeProfile} />
        )}
        {typeProfile === "Institución" && (
          <FormRegisterInstitution typeProfile={typeProfile} />
        )}
      </motion.div>

      {/* Terms footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-pharmako-text-muted"
      >
        Al continuar, aceptas los{" "}
        <span className="underline text-pharmako-primary">Términos</span> y{" "}
        <span className="underline text-pharmako-primary">
          Política de Privacidad
        </span>{" "}
        de LucaMed
      </motion.p>
    </div>
  );
}
