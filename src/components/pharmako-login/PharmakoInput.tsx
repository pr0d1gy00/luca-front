"use client";
import { useState } from "react";
import { motion } from "motion/react";

interface PharmakoInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function PharmakoInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: PharmakoInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderClass = error
    ? "border-red-500"
    : focused
      ? "border-2 border-pharmako-primary"
      : "border-pharmako-border hover:border-pharmako-primary/30";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-pharmako-text-secondary">
        {label}
      </label>
      <div className="relative">
        <motion.input
          type={type === "password" && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border text-base text-pharmako-text-primary placeholder:text-pharmako-text-muted transition-all duration-200 mt-2 ${borderClass}`}
        />
        {type === "password" && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-pharmako-text-muted"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </motion.button>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
