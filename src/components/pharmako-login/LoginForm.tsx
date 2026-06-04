"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PharmakoInput } from "./PharmakoInput";
import { LoginButton } from "./LoginButton";
import { RememberSession } from "./RememberSession";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = () => {
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
    setTimeout(() => setLoading(false), 2000);
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
          Es buen dia para estar saludable.
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
          placeholder="tu@farmacia.com"
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
            className="text-xs sm:text-sm font-medium text-pharmako-primary transition-colors duration-150"
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
