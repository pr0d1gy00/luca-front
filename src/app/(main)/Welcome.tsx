"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import PharmakoPersonMiddleBody from "../../../public/PharmakoPersonBodyExtraLarge-PNG.png";

// ─────────────────────────────────────────────────────────────
// Animation Variants — física natural con easing bezier
// ─────────────────────────────────────────────────────────────
const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const TEXT_CONTENT_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const IMAGE_VARIANTS: Variants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.1,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Welcome — estructura original: imagen izquierda, texto derecha
// Responsive: ajustar tamaños sin cambiar la estructura
// ─────────────────────────────────────────────────────────────
export default function Welcome() {
  return (
    <motion.div
      className="w-full min-h-screen 
                 flex flex-col lg:flex-row
                 items-center justify-center
                 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
                 py-8 sm:py-12 md:py-16
                 gap-6 sm:gap-8 md:gap-10 lg:gap-0"
      initial="hidden"
      animate="visible"
      variants={CONTAINER_VARIANTS}
    >
      {/* Imagen — izquierda, responsive sizes */}
      <motion.div
        variants={IMAGE_VARIANTS}
        className="w-full lg:w-1/2 
                   flex items-center justify-center
                   lg:pr-8 xl:pr-12"
      >
        <Image
          src={PharmakoPersonMiddleBody}
          alt="Bienvenido a Pharmako"
          priority
          className="w-54 h-54 sm:w-72 sm:h-72 md:w-78 md:h-78 lg:w-84 lg:h-84 xl:w-110 xl:h-110 2xl:w-130 2xl:h-130
                     object-contain"
        />
      </motion.div>

      {/* Texto — derecha, responsive */}
      <motion.div
        variants={TEXT_CONTENT_VARIANTS}
        className="w-full lg:w-1/2 
                   flex flex-col items-center lg:items-start text-center lg:text-left
                   gap-4 sm:gap-5 md:gap-6
                   lg:pl-8 xl:pl-12"
      >
        <motion.h2
          variants={TEXT_CONTENT_VARIANTS}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-9xl
                     font-bold text-[#23dce1] leading-none"
        >
          <span>¡</span>Hola<span>!</span>
        </motion.h2>

        <motion.p
          variants={TEXT_CONTENT_VARIANTS}
          className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl
                     text-slate-600 md:text-slate-700
                     leading-relaxed sm:leading-relaxed md:leading-loose
                     max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-md xl:max-w-xl"
        >
          Bienvenido a{" "}
          <span className="font-semibold text-slate-800">Pharmako</span>, un
          sistema de salud friendly healthcare, para ti. Donde nos preocupamos
          por tu bienestar. Registrate y accede a tu perfil para gestionar tus
          medicamentos, citas médicas y mucho más. Estamos aquí para ayudarte a
          cuidar de tu salud de manera fácil y conveniente.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
