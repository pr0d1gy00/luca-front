"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { CiLinkedin, CiTwitter } from "react-icons/ci";
import PharmakoContactUs from "../../../public/PharmakoContacUsExtraLarge-PNG.png";

// ─────────────────────────────────────────────────────────────
// Animation Variants — física natural con easing bezier
// ─────────────────────────────────────────────────────────────
const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const SECTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const ICON_WRAPPER_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

// ─────────────────────────────────────────────────────────────
// Contact info data — todos los canales de contacto
// ─────────────────────────────────────────────────────────────
const CONTACT_CHANNELS = [
  {
    label: "Email",
    value: "hola@lucahealth.com",
    href: "mailto:hola@lucahealth.com",
    icon: Mail,
    accent: "teal",
  },
  {
    label: "WhatsApp",
    value: "+54 11 5555-1234",
    href: "https://wa.me/541155551234",
    icon: MessageCircle,
    accent: "emerald",
  },
  {
    label: "Teléfono",
    value: "+54 11 5555-1234",
    href: "tel:+541155551234",
    icon: Phone,
    accent: "teal",
  },
] as const;

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/lucahealth",
    icon: FaInstagram,
    followers: "12.5K",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/lucahealth",
    icon: CiLinkedin,
    followers: "8.2K",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/lucahealth",
    icon: CiTwitter,
    followers: "5.1K",
  },
] as const;

const LOCATION = {
  address: "Av. Libertador 5100, Piso 12",
  city: "Buenos Aires, Argentina",
  icon: MapPin,
} as const;

// ─────────────────────────────────────────────────────────────
// ContactUs — Contacto con Farmako, canales múltiples
// Layout: imagen grande izquierda, info derecha
// ─────────────────────────────────────────────────────────────
export default function ContactUs() {
  return (
    <motion.section
      id="contacto"
      className="w-full flex flex-col lg:flex-row-reverse
                items-center justify-center
                px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
                xl:py-16 sm:py-20 lg:py-12
                gap-8 md:gap-12 lg:gap-16 mb-12
                bg-white"
      initial="hidden"
      animate="visible"
      variants={CONTAINER_VARIANTS}
    >
      {/* ── Imagen izquierda — contacto visual ── */}
      <motion.div
        variants={SECTION_VARIANTS}
        className="relative w-full min-h-full lg:w-1/2 flex items-center justify-center self-stretch
                  px-0 sm:px-4 md:px-8 lg:px-0"
      >
        {/* Contenedor de imagen con efectos decorativos */}
        <div
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-full
                         flex items-center justify-center"
        >
          {/* Imagen principal */}
          <Image
            src={PharmakoContactUs}
            alt="Contacto LUCA Health"
            className="relative w-64 sm:w-64 md:w-72 lg:w-80 xl:w-96 2xl:w-125
                       object-contain
                       drop-shadow-2xl
                       animate-float"
            priority
          />

          {/* Badge flotante con tagline */}
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
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Respondemos en menos de <span className="text-teal-600 font-bold">24hs</span>
            </p>
          </motion.div> */}
        </div>
      </motion.div>

      {/* ── Info derecha — datos de contacto ── */}
      <motion.div
        variants={SECTION_VARIANTS}
        className="w-full lg:w-1/2 flex flex-col
                  items-start
                  justify-center
                  gap-8 sm:gap-10 lg:gap-12"
      >
        {/* Título y subtítulo */}
        <motion.div className="space-y-2">
          <motion.h1
            variants={SECTION_VARIANTS}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                      font-bold text-[#23dce1] tracking-tight
                      leading-tight"
          >
            Hablemos.
          </motion.h1>
          <motion.p
            variants={SECTION_VARIANTS}
            className="text-base sm:text-lg text-black font-bold max-w-md
                      leading-relaxed"
          >
            ¿Tenés dudas, sugerencias o queréschar? Nuestro equipo está listo
            para ayudarte.
          </motion.p>
        </motion.div>

        {/* Canales de contacto principales */}
        <motion.div
          variants={SECTION_VARIANTS}
          className="w-full grid grid-cols-1 gap-3 sm:gap-4"
        >
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <motion.a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  channel.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                variants={ICON_WRAPPER_VARIANTS}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4
                          bg-white/80
                          border border-slate-600/60
                          rounded-2xl px-5 py-4 sm:px-6 sm:py-5
                          shadow-sm hover:shadow-md
                          transition-all duration-200"
              >
                {/* Icono con color accent */}
                <div
                  className={`size-11 sm:size-12 rounded-xl flex items-center justify-center
                                transition-colors duration-200
                                text-black`}
                >
                  <Icon className="size-5 sm:size-6" />
                </div>

                {/* Info del canal */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide">
                    {channel.label}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-700 truncate">
                    {channel.value}
                  </p>
                </div>

                {/* Flecha indicadora */}
                <div
                  className="size-8 rounded-full bg-slate-100 flex items-center justify-center
                                
                                transition-all duration-200"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Ubicación */}
        <motion.div
          variants={SECTION_VARIANTS}
          className="flex items-start gap-4
                    border border-slate-600/50
                    rounded-2xl px-4 sm:px-5 md:px-6 py-4 sm:py-5"
        >
          <div
            className="size-10 rounded-xl bg-slate-100 flex items-center justify-center
                          text-slate-500"
          >
            <LOCATION.icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Ubicación
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {LOCATION.address}
            </p>
            <p className="text-sm text-slate-500">{LOCATION.city}</p>
          </div>
        </motion.div>

        {/* Redes sociales */}
        <motion.div variants={SECTION_VARIANTS} className="space-y-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Seguinos en redes
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={ICON_WRAPPER_VARIANTS}
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="size-12 sm:size-14
                             bg-white 
                             flex flex-col items-center justify-center gap-0.5
                             transition-all duration-200"
                  aria-label={`${social.label} - ${social.followers} seguidores`}
                >
                  <Icon className="size-7 text-slate-600 hover:text-teal-600 transition-colors" />
                  <span className="text-[10px] font-medium text-slate-400">
                    {social.followers}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
