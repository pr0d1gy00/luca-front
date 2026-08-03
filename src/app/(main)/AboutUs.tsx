"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { Target, Heart, Users, Shield } from "lucide-react";
import PharmakoAbout from "../../../public/PharmakoPersonMiddleBodyExtraLarge-PNG.png";

// ─────────────────────────────────────────────────────────────
// Animation Variants — física natural con easing bezier
// ─────────────────────────────────────────────────────────────
const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const FADE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const FADE_SCALE_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

// ─────────────────────────────────────────────────────────────
// About data — valores y equipo
// ─────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: Heart,
    title: "Empatía",
    description:
      "Entendemos que cada paciente es único. Escuchamos, comprendemos y acompañamos.",
  },
  {
    icon: Shield,
    title: "Confianza",
    description:
      "Tu información y tu salud están protegidas. Operamos con transparencia total.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "No estás solo. LucaMed conecta pacientes, doctores y clínicas en un solo lugar.",
  },
  {
    icon: Target,
    title: "Impacto",
    description:
      "Creemos que la tecnología debe simplificar, no complicar. Diseñamos para vos.",
  },
] as const;

const MILESTONES = [
  { year: "2026", text: "Lanzamiento de la plataforma beta" },
] as const;

// ─────────────────────────────────────────────────────────────
// AboutUs — Nuestra historia con Pharmako
// Layout: imagen izq, contenido der
// ─────────────────────────────────────────────────────────────
export default function AboutUs() {
  return (
    <motion.section
      id="nosotros"
      className="w-full flex flex-col lg:flex-row
                 items-center
                 xl:py-16 sm:py-20 lg:py-0
                 gap-8 md:gap-12 lg:gap-16 mb-24
                "
      initial="hidden"
      animate="visible"
      variants={CONTAINER_VARIANTS}
    >
      {/* ── Imagen izquierda ── */}
      <motion.div
        variants={FADE_SCALE_VARIANTS}
        className="w-full lg:w-1/2 flex items-center
                  self-stretch"
      >
        <div
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-full
                       flex items-center"
        >
          {/* Imagen principal */}
          <Image
            src={PharmakoAbout}
            alt="Equipo LUCA Health"
            className="w-48 sm:w-64 md:w-72 lg:w-80 xl:w-96
                       h-auto object-contain
                       drop-shadow-2xl
                       animate-float"
            priority
          />

          {/* Badge con rating */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8
                       bg-white/90 backdrop-blur-md
                       border border-slate-200/50
                       rounded-2xl px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-3
                       shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Star className="size-4 sm:size-5 text-amber-400 fill-amber-400" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-700">4.9/5</p>
                <p className="text-[10px] sm:text-xs text-slate-400">+12,000 usuarios</p>
              </div>
            </div>
          </motion.div> */}
        </div>
      </motion.div>

      {/* ── Contenido derecho ── */}
      <motion.div
        variants={FADE_UP_VARIANTS}
        className="w-full lg:w-1/2 flex flex-col
                   items-start
                   justify-center
                   gap-8 sm:gap-10 lg:gap-12 px-4"
      >
        {/* Título y subtítulo */}
        <div className="space-y-2">
          <motion.p
            variants={FADE_UP_VARIANTS}
            className="text-xs sm:text-sm text-black font-bold uppercase tracking-widest"
          >
            Sobre nosotros
          </motion.p>
          <motion.h2
            variants={FADE_UP_VARIANTS}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                       font-bold text-slate-900 tracking-tight
                       leading-tight"
          >
            Nacimos para <span className="text-[#23dce1]">cuidar</span>.
          </motion.h2>
          <motion.p
            variants={FADE_UP_VARIANTS}
            className="text-base sm:text-lg text-slate-500 max-w-md
                       leading-relaxed"
          >
            En <strong>LucaMed</strong> creemos que la salud no debería ser
            complicated. Somos un equipo de médicos, ingenieros y diseñadores
            unidos por una misma misión: hacer que gestionar tu salud sea
            simple, accesible y humana.
          </motion.p>
        </div>

        {/* Historia — timeline visual */}
        <motion.div variants={FADE_UP_VARIANTS} className="w-full space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Nuestra trayectoria
          </p>
          <div className="relative pl-6 sm:pl-8 space-y-4 border-l-2 border-teal-100">
            {MILESTONES.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                variants={FADE_UP_VARIANTS}
                custom={index}
                className="relative"
              >
                {/* Dot */}
                <div
                  className="absolute -left-[25px] sm:-left-[29px] md:-left-[31px]
                                top-1 size-3 sm:size-3.5 md:size-4
                                  bg-[#23dce1]
                                rounded-full  border-2 border-white shadow-sm"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                  <span className="text-xs sm:text-sm font-bold  min-w-10">
                    {milestone.year}
                  </span>
                  <span className="text-sm sm:text-base text-slate-600">
                    {milestone.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Valores */}
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                variants={FADE_SCALE_VARIANTS}
                className="group flex items-start gap-3 sm:gap-4
                           bg-white/80 backdrop-blur-sm
                           border border-slate-200/60
                           rounded-2xl px-4 py-3 sm:px-5 sm:py-4
                           shadow-sm hover:shadow-md
                           transition-all duration-200"
              >
                <div
                  className="size-10 sm:size-11 rounded-xl flex items-center justify-center
                                transition-colors duration-200 shrink-0"
                >
                  <Icon className="size-5 sm:size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-slate-700 mb-0.5">
                    {value.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA sutil */}
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="flex items-center gap-2 text-slate-400"
        >
          <div className="size-1.5 rounded-full bg-[#23dce1]" />
          <p className="text-xs sm:text-sm">
            Más de <strong className="text-slate-600">12,000</strong> familias
            confían en nosotros
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
