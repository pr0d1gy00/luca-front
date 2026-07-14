"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phone, Mail, ArrowLeft } from "lucide-react";
import { PharmakoInput } from "./PharmakoInput";
import { LoginButton } from "./LoginButton";
import { RememberSession } from "./RememberSession";
import {
  useLoginUserMutation,
  useLoginPatientMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type { UserProfile, PatientAccount } from "@/features/auth/types";

type LoginMode = "password" | "otp";
type OtpStep = "request" | "verify";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Modos y navegación
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);

  // Credenciales Contraseña
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Credenciales OTP
  const [channel, setChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [identifier, setIdentifier] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("request");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);

  // Mutations
  const loginUser = useLoginUserMutation();
  const loginPatient = useLoginPatientMutation();
  const sendOtp = useSendOtpMutation();
  const verifyOtp = useVerifyOtpMutation();

  // Reloj de expiración de OTP robusto (basado en reloj del sistema para pestañas inactivas)
  useEffect(() => {
    if (otpStep !== "verify" || !expiryTimestamp) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    const handleFocus = () => updateTimer();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [otpStep, expiryTimestamp]);

  // Manejo de Login con Contraseña
  const handleSubmitPassword = async () => {
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
      const isVerified = user.is_verified ?? user.isVerified ?? false;
      const requiresKyc = user.role === "DOCTOR" || user.role === "PROVIDER";
      setAuth("user", user, isVerified);

      if (!isVerified && requiresKyc) {
        toast.info(
          "Tu cuenta está en revisión. Te avisaremos por correo cuando esté aprobada.",
        );
        router.push("/dashboard/pending-verification");
        setLoading(false);
        return;
      }

      toast.success(
        `¡Bienvenido, ${user.fullName || user.full_name || "Usuario"}!`,
      );
      router.push("/dashboard");
    } catch (errUser: unknown) {
      const e = errUser as {
        response?: {
          status?: number;
          data?: { error?: string; message?: string; detail?: string };
        };
      };
      // Si falla como usuario por credenciales incorrectas (401), intentamos como Paciente
      if (e.response?.status === 401) {
        try {
          console.log("[LoginForm] Attempting patient login for:", email);
          const resPatient = await loginPatient.mutateAsync({
            email,
            password,
          });
          console.log("[LoginForm] Patient login response:", resPatient);

          // Obtener el perfil completo (PatientAccount) con campos adicionales
          const { data: patientFull } = await apiClient.get<PatientAccount>(
            "/auth/patients/me"
          );
          console.log("[LoginForm] /me response:", patientFull);

          setAuth("patient", patientFull, true);
          console.log(
            "[LoginForm] Store state BEFORE redirect:",
            JSON.stringify(useAuthStore.getState()),
          );
          toast.success(
            `¡Bienvenido, ${
              patientFull.fullName || patientFull.full_name || "Usuario"
            }!`,
          );
          // Use router.push for client-side navigation (preserves React state)
          router.push("/dashboard");
        } catch (err) {
          console.error("[LoginForm] Patient login failed:", err);
          toast.error("Correo electrónico o contraseña incorrectos.");
        }
      } else {
        console.error("[LoginForm] User login non-401 error:", e.response);
        toast.error(
          e.response?.data?.detail ??
            e.response?.data?.message ??
            "Error de conexión con el servidor.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Enviar código OTP
  const handleSendOtp = async () => {
    if (!identifier) {
      toast.error(
        `Por favor ingresa tu ${channel === "WHATSAPP" ? "teléfono" : "correo"}.`,
      );
      return;
    }
    setLoading(true);
    try {
      const payload: {
        phone?: string;
        email?: string;
        channel: "WHATSAPP" | "EMAIL";
      } = {
        channel,
      };
      if (channel === "WHATSAPP") {
        payload.phone = identifier;
      } else {
        payload.email = identifier;
      }

      const res = await sendOtp.mutateAsync(payload);
      toast.success(res.message || "Código enviado con éxito.");
      setOtpStep("verify");
      const seconds = res.otpExpirySeconds || 300;
      setTimeLeft(seconds);
      setExpiryTimestamp(Date.now() + seconds * 1000);
      setCode("");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
            message?: string;
            invalidParams?: Array<{ name?: string; reason?: string }>;
            errors?: Record<string, string[]>;
          };
        };
      };
      const data = error?.response?.data;
      // Prioridad: invalidParams[0].reason > errors[field][0] > detail > message
      const msg =
        data?.invalidParams?.[0]?.reason ||
        (() => {
          const firstErrorKey = Object.keys(data?.errors ?? {})[0];
          return data?.errors?.[firstErrorKey]?.[0];
        })() ||
        data?.detail ||
        data?.message ||
        "Error al enviar el código de verificación.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Verificar OTP e Ingresar
  const handleVerifyOtp = async () => {
    if (code.length !== 8) {
      toast.error("El código debe tener 8 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const payload: {
        phone?: string;
        email?: string;
        code: string;
      } = {
        code,
      };
      if (channel === "WHATSAPP") {
        payload.phone = identifier;
      } else {
        payload.email = identifier;
      }

      const res = await verifyOtp.mutateAsync(payload);
      const profile = res.user;
      // El backend devuelve userType: 'patient' | 'user' según la cuenta real
      const detectedUserType = res.userType ?? "user";

      if (detectedUserType === "patient") {
        // Obtener el perfil completo (PatientAccount)
        const { data: patientFull } = await apiClient.get<PatientAccount>(
          "/auth/patients/me"
        );
        setAuth("patient", patientFull, true);
        toast.success(
          `¡Bienvenido, ${
            patientFull.fullName || patientFull.full_name || "Usuario"
          }!`,
        );
      } else {
        const user = profile as UserProfile;
        const isVerified = user.is_verified ?? user.isVerified ?? false;
        const requiresKyc = user.role === "DOCTOR" || user.role === "PROVIDER";
        setAuth("user", user, isVerified);

        if (!isVerified && requiresKyc) {
          toast.info(
            "Tu cuenta está en revisión. Te avisaremos cuando esté aprobada.",
          );
          router.push("/dashboard/pending-verification");
          setLoading(false);
          return;
        }
        toast.success(
          `¡Bienvenido, ${user.fullName || user.full_name || "Usuario"}!`,
        );
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
            message?: string;
            invalidParams?: Array<{ name?: string; reason?: string }>;
            errors?: Record<string, string[]>;
          };
        };
      };
      const data = error?.response?.data;
      const msg =
        data?.invalidParams?.[0]?.reason ||
        (() => {
          const firstErrorKey = Object.keys(data?.errors ?? {})[0];
          return data?.errors?.[firstErrorKey]?.[0];
        })() ||
        data?.detail ||
        data?.message ||
        "Código inválido o expirado.";
      toast.error(msg);
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
            {loginMode === "password"
              ? "Bienvenido nuevamente"
              : "Ingreso sin contraseña"}
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-pharmako-text-secondary"
        >
          {loginMode === "password"
            ? "Es un buen día para estar saludable."
            : "Recibí un código de un solo uso por WhatsApp o Email."}
        </motion.p>
      </div>

      {/* Selector de Modo */}
      <div className="flex p-1 rounded-xl border border-slate-200/50">
        <button
          type="button"
          onClick={() => {
            setLoginMode("password");
            setErrors({});
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            loginMode === "password"
              ? " text-pharmako-care"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Contraseña
        </button>
        <div className="w-10 h-10 border-l border-slate-200/50"></div>
        <button
          type="button"
          onClick={() => {
            setLoginMode("otp");
            setOtpStep("request");
            setIdentifier("");
            setCode("");
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            loginMode === "otp"
              ? " text-pharmako-care"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Código OTP
        </button>
      </div>

      {/* Contenido Dinámico */}
      <AnimatePresence mode="wait">
        {loginMode === "password" ? (
          <motion.div
            key="password"
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
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
                className="text-xs sm:text-sm font-medium text-pharmako-care transition-colors duration-150 cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                ¿Olvidaste tu contraseña?
              </motion.button>
            </div>

            <LoginButton onClick={handleSubmitPassword} loading={loading} />
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {otpStep === "request" ? (
              <div className="space-y-4">
                {/* Selector de Canal */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-pharmako-text-secondary">
                    Recibir código por
                  </label>
                  <div className="flex  p-1 rounded-xl border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setChannel("WHATSAPP");
                        setIdentifier("");
                      }}
                      className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        channel === "WHATSAPP"
                          ? " text-emerald-600"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Phone
                        className={`${channel === "WHATSAPP" ? "text-emerald-500" : "text-slate-500"} w-3.5 h-3.5`}
                      />
                      WhatsApp
                    </button>
                    <div className="w-10 h-10 border-l border-slate-200/50"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setChannel("EMAIL");
                        setIdentifier("");
                      }}
                      className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        channel === "EMAIL"
                          ? " text-sky-600"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Mail
                        className={`${channel === "EMAIL" ? "text-sky-500" : "text-slate-500"} w-3.5 h-3.5`}
                      />
                      Email
                    </button>
                  </div>
                </div>

                {/* Identificador (Teléfono o Email) */}
                {channel === "WHATSAPP" ? (
                  <PharmakoInput
                    label="Número de Teléfono (WhatsApp)"
                    type="tel"
                    placeholder="+584121234567"
                    value={identifier}
                    onChange={setIdentifier}
                  />
                ) : (
                  <PharmakoInput
                    label="Correo electrónico"
                    type="email"
                    placeholder="tu@correo.com"
                    value={identifier}
                    onChange={setIdentifier}
                  />
                )}

                <LoginButton onClick={handleSendOtp} loading={loading} />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Botón de regreso */}
                <button
                  type="button"
                  onClick={() => setOtpStep("request")}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a ingresar datos
                </button>

                {/* Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 space-y-1">
                  <p>Enviamos un código de 8 dígitos a:</p>
                  <p className="font-semibold text-slate-800">{identifier}</p>
                </div>

                {/* Input de Código */}
                <PharmakoInput
                  label="Código de Verificación"
                  type="text"
                  maxLength={8}
                  placeholder="12345678"
                  value={code}
                  onChange={(val) => setCode(val.replace(/\D/g, ""))}
                />

                {/* Reloj y Reenvío */}
                <div className="text-center text-xs text-slate-500">
                  {timeLeft > 0 ? (
                    <span>
                      El código expira en{" "}
                      <strong className="text-pharmako-care font-semibold">
                        {timeLeft}s
                      </strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-pharmako-care font-semibold hover:underline cursor-pointer"
                    >
                      Reenviar código de verificación
                    </button>
                  )}
                </div>

                <LoginButton onClick={handleVerifyOtp} loading={loading} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-pharmako-text-muted"
      >
        Al continuar, aceptas los{" "}
        <button className="underline hover:no-underline text-pharmako-primary cursor-pointer">
          Términos
        </button>{" "}
        y{" "}
        <button className="underline hover:no-underline text-pharmako-primary cursor-pointer">
          Política de Privacidad
        </button>
      </motion.p>
    </div>
  );
}
