"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import PharmakoPersonTwoPCAndComputerPNG from "../../../public/PharmakoPersonTwoPcAndPhone-PNG.png";
export function PharmiWorkspace() {
  const [floatPhase, setFloatPhase] = useState(0);

  // Gentle floating animation
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setFloatPhase((prev) => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(floatInterval);
  }, []);

  const floatY = Math.sin((floatPhase * Math.PI) / 180) * 6;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" />

      {/* Floating orbs - ambient */}
      <motion.div
        className="absolute w-75 h-75 rounded-full opacity-20"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-50 h-50 rounded-full opacity-15"
        animate={{
          y: [0, 10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Pharmi character - centered with breathing/floating */}
      <motion.div
        className="flex flex-col justify-center h-full"
        animate={{
          y: [0, floatY, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          {/* Laptop base */}

          <Image
            src={PharmakoPersonTwoPCAndComputerPNG}
            alt="Pharmi - Tu asistente de farmacia"
            width={500}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent" />

      {/* Brand watermark */}
      <motion.div
        className="absolute bottom-8 left-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-pharmako-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"
                fill="white"
              />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-pharmako-text-primary">
            Pharmako
          </span>
        </div>
      </motion.div>
    </div>
  );
}
