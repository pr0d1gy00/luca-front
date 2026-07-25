"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  FileCheck,
  LayoutGrid,
  PenTool,
  SlidersHorizontal,
  Calculator,
  FileText,
  Paperclip,
  CheckCircle2,
  Stethoscope,
  Building2,
  ShieldCheck,
  HeartPulse,
  Layers,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_CATEGORY_LABELS } from "../types";

export function BuilderGuide() {
  const [activeRole, setActiveRole] = useState<"doctor" | "admin">("doctor");
  const [selectedBlockCategory, setSelectedBlockCategory] = useState<
    "all" | "clinical" | "interactive" | "structural"
  >("all");

  // 3 Pasos didácticos
  const steps = [
    {
      number: "01",
      title: "Elige la categoría del documento",
      description:
        "Selecciona entre 12 formatos predefinidos como Historias Clínicas, Consentimientos Informados, Certificados o Triaje.",
      icon: Layers,
      color: "bg-pharmako-care-light text-pharmako-care",
    },
    {
      number: "02",
      title: "Arrastra y personaliza tus bloques",
      description:
        "Construye la estructura exacta que necesitas arrastrando campos simples, signos vitales, firmas digitales o escalas médicas.",
      icon: LayoutGrid,
      color: "bg-slate-100 text-slate-700",
    },
    {
      number: "03",
      title: "Guarda, comparte y aplica",
      description:
        "Publica la plantilla para usarla en tus consultas diarias o enviársela a tus pacientes antes de su cita.",
      icon: FileCheck,
      color: "bg-pharmako-accent-light text-pharmako-accent",
    },
  ];

  // Bloques destacados para la demostración interactiva
  interface BlockShowcase {
    type: string;
    label: string;
    description: string;
    icon: LucideIcon;
    category: "clinical" | "interactive" | "structural";
    badge: string;
    preview: React.ReactNode;
  }

  const blocks: BlockShowcase[] = [
    {
      type: "signature",
      label: "Firma Digital / Médica",
      description:
        "Obligatorio para consentimientos informados, recetas y altas médicas.",
      icon: PenTool,
      category: "interactive",
      badge: "Legal & Pacientes",
      preview: (
        <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg space-y-2 text-xs">
          <div className="h-8 border-b border-slate-300 flex items-end pb-1 font-mono text-slate-400 italic">
            Firma del Médico / Paciente
          </div>
          <div className="flex gap-3 text-[10px] text-slate-400">
            <span>✓ Fecha</span>
            <span>✓ Nombre</span>
            <span>✓ Matrícula / DNI</span>
          </div>
        </div>
      ),
    },
    {
      type: "computed-field",
      label: "Campo Calculado (IMC, Edad)",
      description:
        "Calcula automáticamente valores como IMC, semanas de gestación o edad.",
      icon: Calculator,
      category: "clinical",
      badge: "Automatización",
      preview: (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="font-bold">ƒ(x)</span>
            <span>IMC (Peso / Altura²)</span>
          </div>
          <span className="font-mono text-amber-800 font-semibold">
            24.2 kg/m²
          </span>
        </div>
      ),
    },
    {
      type: "scale",
      label: "Escala Médica (Likert / NRS)",
      description:
        "Ideal para medir dolor (NRS 0-10), escalas Glasgow o satisfacción.",
      icon: SlidersHorizontal,
      category: "clinical",
      badge: "Evaluación",
      preview: (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[0, 2, 4, 6, 8, 10].map((val) => (
              <div
                key={val}
                className="flex-1 h-6 bg-slate-100 border border-slate-200 rounded text-[10px] flex items-center justify-center font-medium text-slate-600"
              >
                {val}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>Sin dolor</span>
            <span>Dolor insoportable</span>
          </div>
        </div>
      ),
    },
    {
      type: "vital-signs",
      label: "Signos Vitales",
      description:
        "Presión arterial, frecuencia cardíaca, saturación O₂ y temperatura.",
      icon: HeartPulse,
      category: "clinical",
      badge: "Ficha Médica",
      preview: (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded">
            <span className="text-[10px] text-emerald-600 block font-medium">
              P. Arterial
            </span>
            <span className="font-semibold text-emerald-800">120/80 mmHg</span>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-100 rounded">
            <span className="text-[10px] text-blue-600 block font-medium">
              Sat. O₂
            </span>
            <span className="font-semibold text-blue-800">98%</span>
          </div>
        </div>
      ),
    },
    {
      type: "rich-text",
      label: "Texto Informativo & Legal",
      description:
        "Agrega párrafos normativos, advertencias clínicas o instructivos para el paciente.",
      icon: FileText,
      category: "structural",
      badge: "Normativa",
      preview: (
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-[11px] text-slate-600 leading-relaxed">
          <span className="font-semibold text-blue-800 block mb-0.5">
            Nota Legal:
          </span>
          El paciente declara haber comprendido los riesgos y beneficios
          descritos...
        </div>
      ),
    },
    {
      type: "file-upload",
      label: "Subida de Archivos / Adjuntos",
      description:
        "Permite adjuntar exámenes de laboratorio, ecografías o recetas previas.",
      icon: Paperclip,
      category: "interactive",
      badge: "Archivos",
      preview: (
        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center gap-2 text-xs text-slate-400">
          <Paperclip className="w-4 h-4 text-pharmako-care" />
          <span>Adjuntar PDF, imágenes o laboratorios</span>
        </div>
      ),
    },
  ];

  const filteredBlocks = blocks.filter(
    (b) =>
      selectedBlockCategory === "all" || b.category === selectedBlockCategory,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ─── Hero Section (Notion Flat Style) ───────────────── */}
      <section className="relative overflow-hidden rounded-2xl text-slate-900 p-8 lg:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Construye cualquier documento médico sin complicaciones
          </h1>

          <p className="text-slate-900 text-sm lg:text-base leading-relaxed font-normal max-w-2xl">
            Diseñado para médicos y personal administrativo. Crea historias
            clínicas, consentimientos informados, recetas y certificados
            adaptados exactamente a tu flujo de trabajo.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link href="/clinical-history/builder">
              <Button className="bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold px-6 py-2.5 rounded-xl text-sm border-none shadow-none transition-colors flex items-center gap-2 h-12">
                <span>Ir al Builder ahora</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/clinical-history">
              <Button
                variant="outline"
                className="border-slate-300 hover:bg-slate-300 hover:text-black px-5 py-2.5 rounded-xl text-sm font-medium shadow-none h-12"
              >
                Ver mis plantillas existentes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3 Pasos Simples ─────────────────────────────────── */}
      <section className="space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">
            ¿Cómo funciona en 3 pasos?
          </h2>
          <p className="text-xs text-slate-500">
            No necesitas conocimientos técnicos. El proceso es intuitivo y
            visual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl p-6 border border-slate-200 space-y-4 shadow-none"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-black text-slate-300">
                    {step.number}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Ejemplos por Rol (Tabs Médico / Admin) ──────────── */}
      <section className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 space-y-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ¿Qué puedes lograr según tu rol?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adaptado tanto a la atención clínica directa como a la gestión
              institucional.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto gap-1">
            <button
              onClick={() => setActiveRole("doctor")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "doctor"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-none"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-pharmako-care" />
              <span>Para Médicos</span>
            </button>
            <button
              onClick={() => setActiveRole("admin")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "admin"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-none"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-pharmako-care" />
              <span>Para Administrativos</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeRole === "doctor" ? (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-3.5 p-5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pharmako-care-light text-pharmako-care rounded-lg">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Consultas Especializadas & Fichas
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Diseña controles pediátricos con tablas de crecimiento o
                      controles ginecológicos con FUM y cálculo gestacional.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Integra selector oficial CIE-10 para diagnósticos rápidos
                      con autocompletado.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Campos dinámicos que se muestran u ocultan según las
                      respuestas previas.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3.5 p-5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pharmako-care-light text-pharmako-care rounded-lg">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Recetas y Notas de Evolución
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Formatos de indicación médica rápida con dosis, frecuencia
                      e indicaciones al paciente.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Notas tipo SOAP (Subjetivo, Objetivo, Apreciación, Plan)
                      listas en un solo clic.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Firmas digitales y membretes profesionales precargados de
                      la clínica.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-3.5 p-5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pharmako-care-light text-pharmako-care rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Consentimientos Informados & Legales
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Crea formatos estandarizados de procedimientos médicos o
                      quirúrgicos con texto normativo protegido.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Obliga la firma del paciente, apoderado o testigo antes de
                      proceder.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Genera envíos digitales para que el paciente los llene
                      desde su teléfono antes de la cita.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3.5 p-5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pharmako-care-light text-pharmako-care rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Admisión, Triaje y Certificados
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Formularios de ingreso rápido para recepción o enfermería.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Certificados médicos de reposo, aptitud física o
                      constancias de asistencia.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
                    <span>
                      Estandarización institucional para todas las sedes o
                      especialidades de la clínica.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── Catálogo de Bloques Disponibles ─────────────────── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bloques disponibles en el editor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisa los componentes listos para arrastrar.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { key: "all", label: "Todos" },
              { key: "clinical", label: "Clínicos" },
              { key: "interactive", label: "Interactivos / Firma" },
              { key: "structural", label: "Estructura" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setSelectedBlockCategory(
                    tab.key as typeof selectedBlockCategory,
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedBlockCategory === tab.key
                    ? "bg-white text-slate-900 border border-slate-200/80 shadow-none"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.type}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-pharmako-care-light text-pharmako-care rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-[10px] text-slate-500 font-medium rounded-md shadow-none"
                    >
                      {block.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">
                      {block.label}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {block.description}
                    </p>
                  </div>
                </div>

                {/* Live Block Preview */}
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Vista Previa:
                  </span>
                  {block.preview}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Categorías de Documentos Soportadas ──────────────── */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          12 Tipos de Documentos Médicos Clasificados
        </h2>
        <p className="text-xs text-slate-500">
          Cualquier plantilla que crees se categoriza automáticamente para
          encontrarla fácil en el sistema.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([key, label]) => (
            <div
              key={key}
              className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2 shadow-none"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-pharmako-care shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Call To Action Final ───────────────────────────── */}
      <section className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-none">
        <div className="w-10 h-10 rounded-full bg-pharmako-care-light text-pharmako-care flex items-center justify-center mx-auto">
          <HelpCircle className="w-5 h-5" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            ¿Listo para construir tu primer documento?
          </h3>
          <p className="text-xs text-slate-500">
            El editor es totalmente seguro. Puedes hacer pruebas en borrador
            antes de publicar.
          </p>
        </div>

        <div className="pt-1">
          <Link href="/clinical-history/builder">
            <Button className="bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold px-8 py-2.5 rounded-xl text-sm border-none h-12 transition-colors">
              Abrir el Constructor de Documentos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
