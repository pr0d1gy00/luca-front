"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function RememberSession() {
  const [checked, setChecked] = useState(true);

  return (
    <motion.label
      className="flex items-center gap-2 cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
          checked
            ? "bg-pharmako-care border-pharmako-care"
            : "bg-transparent border-pharmako-border"
        }`}
        onClick={() => setChecked(!checked)}
      >
        {checked && (
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <path
              d="M5 12l5 5L20 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>
      <span className="text-sm text-pharmako-text-secondary">
        Mantener sesión iniciada
      </span>
    </motion.label>
  );
}
