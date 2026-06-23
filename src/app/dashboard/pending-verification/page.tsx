"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import PharmakoReviewDocumentsWebP from "../../../../public/PharmakoReviewDocumentsExtraLarge-WEBP.webp";

export default function PendingVerificationPage() {
  const router = useRouter();
  const { userType, token, setAuth, clearAuth, user } = useAuthStore();

  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleRefresh = async () => {
    if (!token || !userType) {
      toast.error("Sesión inválida. Por favor, iniciá sesión de nuevo.");
      router.push("/login");
      return;
    }

    setLoadingRefresh(true);
    try {
      const endpoint =
        userType === "patient" ? "/auth/patients/me" : "/auth/users/me";
      const { data } = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const isVerified =
        userType === "patient"
          ? true
          : ((data as { is_verified?: boolean }).is_verified ?? false);

      setAuth(token, userType, data, isVerified);
      toast.success("¡Tu cuenta ha sido aprobada! Redirigiendo…");
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        toast.info(
          "Tu documentación sigue en revisión. Te avisaremos por correo apenas se complete.",
        );
      } else {
        toast.error("Ocurrió un error al verificar el estado de tu cuenta.");
      }
    } finally {
      setLoadingRefresh(false);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const endpoint =
        userType === "patient" ? "/auth/patients/logout" : "/auth/users/logout";
      await apiClient.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch {
      // ignorar error del servidor, limpiamos local de todos modos
    } finally {
      clearAuth();
      toast.success("Sesión cerrada.");
      router.push("/login");
      setLoadingLogout(false);
    }
  };

  const userName = user?.full_name ?? "Usuario";

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-white">
      {/* ── Columna izquierda: imagen ── */}
      <div className="relative w-full lg:w-3/5 lg:min-h-dvh overflow-hidden bg-white flex items-center justify-center">
        {/* Orbs ambientales sutiles */}
        <motion.div
          className="absolute top-16 left-12 w-64 h-64 rounded-full bg-[#23dce1]/10 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-16 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl"
          animate={{ y: [0, -16, 0], opacity: [0.08, 0.14, 0.08] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-[700px] px-8 sm:px-12 lg:px-16"
        >
          <Image
            src={PharmakoReviewDocumentsWebP}
            alt="Revisión de documentos Pharmako"
            width={1200}
            height={900}
            className="w-full h-auto object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* ── Columna derecha: texto libre ── */}
      <div className="w-full lg:w-2/5 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-sm lg:max-w-md"
        >
          {/* Icono animado */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="size-14 rounded-2xl bg-[#23dce1]/8 border border-[#23dce1]/15
                       flex items-center justify-center text-[#23dce1] mb-8"
          >
            <Clock className="size-7" strokeWidth={1.5} />
          </motion.div>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Documentación
            <br />
            en revisión
          </h1>

          {/* Saludo */}
          <p className="text-base text-slate-500 mb-3 leading-relaxed">
            Hola,{" "}
            <span className="font-semibold text-slate-700">{userName}</span>.
          </p>

          {/* Descripción */}
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Tu cuenta se encuentra en revisión manual por el equipo de Pharmako
            para validar tu licencia médica o registro comercial. Este proceso
            suele demorar{" "}
            <span className="font-medium text-slate-600">
              menos de 24 horas hábiles
            </span>
            .
          </p>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              disabled={loadingRefresh}
              className="w-full bg-[#23dce1] hover:bg-[#1fc8cd] active:bg-[#1ab4b9]
                         text-white py-3.5 rounded-xl font-semibold text-sm
                         transition-all duration-200
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm hover:shadow-md active:shadow-sm"
            >
              <RefreshCw
                className={`size-4 shrink-0 ${loadingRefresh ? "animate-spin" : ""}`}
              />
              {loadingRefresh ? "Verificando…" : "Recargar Estado"}
            </button>

            <button
              onClick={handleLogout}
              disabled={loadingLogout}
              className="w-full text-slate-500 hover:text-slate-700 py-2.5 font-medium text-sm
                         transition-colors duration-200
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut
                className={`size-4 shrink-0 ${loadingLogout ? "animate-spin" : ""}`}
              />
              {loadingLogout ? "Cerrando sesión…" : "Cerrar Sesión"}
            </button>
          </div>

          {/* Soporte */}
          <p className="mt-8 text-xs text-slate-300 leading-relaxed">
            ¿Necesitás ayuda?&nbsp;
            <a
              href="mailto:soporte@pharmako.health"
              className="text-[#23dce1] hover:underline"
            >
              Escribinos a soporte@pharmako.health
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
