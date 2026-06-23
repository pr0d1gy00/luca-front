"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PharmakoInput } from "./PharmakoInput";
import { LoginButton } from "./LoginButton";
import { RememberSession } from "./RememberSession";
import {
  useLoginUserMutation,
  useLoginPatientMutation,
} from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type {
  UserProfile,
  PatientProfile,
  PatientAccount,
} from "@/features/auth/types";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const loginUser = useLoginUserMutation();
  const loginPatient = useLoginPatientMutation();

  const handleSubmit = async () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "El correo electrónico es requerido";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Ingresa un correo válido";
    if (!password) newErrors.password = "La contraseña es requerida";
    else if (password.length < 6) newErrors.password = "Mínimo 6 caracteres";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1. Intentamos iniciar sesión como Usuario (Médico, Proveedor, Admin)
      const resUser = await loginUser.mutateAsync({ email, password });
      const user = resUser.user as UserProfile;

      // Si la cuenta no está verificada (KYC pending), ir a pending page
      const isVerified = user.is_verified ?? false;
      setAuth(resUser.access_token, "user", user, isVerified);

      if (!isVerified) {
        toast.info(
          "Tu cuenta está en revisión. Te avisaremos por correo cuando esté aprobada.",
        );
        router.push("/dashboard/pending-verification");
        setLoading(false);
        return;
      }

      toast.success(`¡Bienvenido, ${user.full_name}!`);
      router.push("/dashboard");
    } catch (errUser: unknown) {
      const e = errUser as {
        response?: {
          status?: number;
          data?: { error?: string; message?: string };
        };
      };
      // Si falla como usuario por credenciales incorrectas (401), intentamos como Paciente
      if (e.response?.status === 401) {
        try {
          const resPatient = await loginPatient.mutateAsync({
            email,
            password,
          });
          const patientProfile = resPatient.user as PatientProfile;

          // Obtener el perfil completo (PatientAccount) con campos adicionales
          const { data: patientFull } = await apiClient.get<PatientAccount>(
            "/auth/patients/me",
            { headers: { Authorization: `Bearer ${resPatient.access_token}` } },
          );

          setAuth(resPatient.access_token, "patient", patientFull, true);
          toast.success(`¡Bienvenido, ${patientFull.full_name}!`);
          router.push("/dashboard");
        } catch {
          toast.error("Correo electrónico o contraseña incorrectos.");
        }
      } else {
        toast.error(
          e.response?.data?.message ?? "Error de conexión con el servidor.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-pharmako-text-primary">
            Bienvenido nuevamente
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-pharmako-text-secondary"
        >
          Es un buen día para estar saludable.
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        className="space-y-4 sm:space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <PharmakoInput
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />

        <PharmakoInput
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <RememberSession />
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="text-xs sm:text-sm font-medium text-pharmako-care transition-colors duration-150"
            whileTap={{ scale: 0.98 }}
          >
            ¿Olvidaste tu contraseña?
          </motion.button>
        </div>

        <LoginButton onClick={handleSubmit} loading={loading} />
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-pharmako-text-muted"
      >
        Al continuar, aceptas los{" "}
        <button className="underline hover:no-underline text-pharmako-primary">
          Términos
        </button>{" "}
        y{" "}
        <button className="underline hover:no-underline text-pharmako-primary">
          Política de Privacidad
        </button>
      </motion.p>
    </div>
  );
}
