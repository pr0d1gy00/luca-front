"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, RefreshCw, LogOut, Settings, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import apiClient from "@/lib/api/client";
import PharmakoReviewDocumentsWebP from "../../../../public/PharmakoReviewDocumentsExtraLarge-WEBP.webp";

export default function PendingVerificationPage() {
  const router = useRouter();
  const { userType, setAuth, user } = useAuthStore();
  const { logout: handleLogout, loading: loadingLogout } = useLogout();

  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const handleRefresh = async () => {
    if (!userType) {
      toast.error("Sesión inválida. Por favor, iniciá sesión de nuevo.");
      router.push("/login");
      return;
    }

    setLoadingRefresh(true);
    try {
      const endpoint =
        userType === "patient" ? "/auth/patients/me" : "/auth/users/me";
      const { data } = await apiClient.get(endpoint);

      const actualUser =
        data && typeof data === "object" && "user" in data
          ? (data as { user: unknown }).user
          : data;

      const isVerified =
        userType === "patient"
          ? true
          : ((actualUser as { isVerified?: boolean; is_verified?: boolean })
              ?.isVerified ??
            (actualUser as { isVerified?: boolean; is_verified?: boolean })
              ?.is_verified ??
            false);

      setAuth(userType, actualUser, isVerified);

      if (isVerified) {
        toast.success("¡Tu cuenta ha sido aprobada! Redirigiendo…");
        router.push("/dashboard");
      } else {
        const verificationDocs =
          (actualUser as { verificationDocuments?: { status?: string }[] })
            ?.verificationDocuments ?? [];
        const hasRejected = verificationDocs.some(
          (d) => d.status === "REJECTED",
        );
        if (hasRejected) {
          toast.warning(
            "Algunos documentos fueron rechazados. Por favor, revisalos.",
          );
        } else {
          toast.info("Tu documentación sigue en revisión.");
        }
      }
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

  const userName = user?.fullName ?? user?.full_name ?? "Usuario";
  const verificationDocs =
    user && "verificationDocuments" in user
      ? (user.verificationDocuments as { status?: string; comments?: string }[])
      : [];
  const rejectedDocs =
    verificationDocs?.filter((doc) => doc.status === "REJECTED") ?? [];
  const hasRejectedDocs = rejectedDocs.length > 0;

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

          {/* Alerta de Documentos Rechazados */}
          {hasRejectedDocs && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-rose-50/70 border border-rose-100 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                  <ShieldAlert className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-rose-950">
                    Documentación rechazada
                  </h3>
                  <p className="text-xs text-rose-800/80 mt-0.5 leading-relaxed">
                    Alguno de los documentos cargados no cumple con los
                    requisitos. Por favor, revisá los detalles y volvé a
                    subirlos.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-rose-100/60 mt-1">
                {rejectedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-2.5 first:pt-0 last:pb-0 text-xs"
                  >
                    <span className="font-semibold text-rose-950 block">
                      {doc.type === "MEDICAL_LICENSE"
                        ? "Licencia Médica"
                        : doc.type}
                    </span>
                    {doc.comments && (
                      <p className="text-rose-800/90 mt-1 italic bg-white/60 p-2.5 rounded-lg border border-rose-100/40 leading-relaxed">
                        Motivo: &quot;{doc.comments}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {hasRejectedDocs ? (
              <>
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="w-full bg-[#23dce1] hover:bg-[#1fc8cd] active:bg-[#1ab4b9]
                             text-white py-3.5 rounded-xl font-semibold text-sm
                             transition-all duration-200
                             flex items-center justify-center gap-2
                             shadow-sm hover:shadow-md active:shadow-sm"
                >
                  <Settings className="size-4 shrink-0" />
                  Corregir y Subir Documentos
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loadingRefresh}
                  className="w-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200
                             text-slate-700 py-3.5 rounded-xl font-semibold text-sm
                             transition-all duration-200
                             flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-xs hover:shadow-sm"
                >
                  <RefreshCw
                    className={`size-4 shrink-0 ${loadingRefresh ? "animate-spin" : ""}`}
                  />
                  {loadingRefresh ? "Verificando…" : "Recargar Estado"}
                </button>
              </>
            ) : (
              <>
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
                  onClick={() => router.push("/dashboard/profile")}
                  className="w-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200
                             text-slate-700 py-3.5 rounded-xl font-semibold text-sm
                             transition-all duration-200
                             flex items-center justify-center gap-2
                             shadow-xs hover:shadow-sm"
                >
                  <Settings className="size-4 shrink-0" />
                  Cargar Otros Documentos
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              disabled={loadingLogout}
              className="w-full text-slate-500 hover:text-slate-700 py-2.5 font-medium text-sm
                         transition-colors duration-200
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut
                className={`size-4 shrink-0 ${loadingLogout ? "disabled" : ""}`}
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
