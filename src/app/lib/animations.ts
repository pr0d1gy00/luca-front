// src/lib/animations.ts

import { Transition, Variants } from "motion/react";

// 1. EL MOTOR PRINCIPAL (El ADN del movimiento)
// Curva suave: arranca con intención, pero frena con mucha delicadeza.
export const lucaTransition: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

// Transición ultra rápida para interacciones directas
export const lucaFastTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

// ---------------------------------------------------------
// 2. EL CATÁLOGO DE VARIANTES
// ---------------------------------------------------------

// A. Fade Up (Aparición Elevada)
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: lucaTransition },
  exit: { opacity: 0, y: -10, transition: lucaFastTransition },
};

// B. Scale In (Expansión Sutil)
// Nota: Nunca empieza en 0, empieza en 0.95 para que no parezca un rebote de caricatura.
export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: lucaTransition },
  exit: { opacity: 0, scale: 0.96, transition: lucaFastTransition },
};

// C. Slide Lateral (Deslizamiento de Vistas)
export const slideInRightVariant: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: lucaTransition },
  exit: { opacity: 0, x: -20, transition: lucaFastTransition },
};
export const slideInLeftVariant: Variants = {
  animate: {
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: lucaTransition },
  exit: { opacity: 0, x: 20, transition: lucaFastTransition },
};

// D. Accordion / Height Expand (Despliegue Vertical)
export const expandHeightVariant: Variants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: { opacity: 1, height: "auto", transition: lucaTransition },
  exit: { opacity: 0, height: 0, transition: lucaFastTransition },
};

export const staggerChildrenVariant: Variants = {
  animate: {
    transition: {
      when: "beforeChildren", // Ejecuta el padre primero
      staggerChildren: 0.1, // 100ms de pausa entre cada hijo
    },
  },
};
// E. Pulse Status (Indicador de Vida)
// Esta es diferente, es para estados de espera continua.
export const pulseStatusVariant: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// En src/lib/animations.ts

// Variante específica para transiciones de Vistas/Ventanas completas
export const windowTransitionVariant: Variants = {
  // Estado inicial (antes de montar)
  hidden: { opacity: 0, y: 15, scale: 0.98 },

  // Estado visible (cuando el usuario la está usando)
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },

  // LA SALIDA: Lo que pasa cuando haces clic para ir a otra ventana
  exit: {
    opacity: 0,
    y: -10, // Se desplaza ligeramente hacia arriba al salir
    scale: 0.98, // Se encoge sutilmente (efecto de profundidad)
    transition: { duration: 0.2, ease: "easeOut" }, // Mitad de tiempo
  },
};
// 1. El Contenedor Padre
export const sidebarContainerVariant: Variants = {
  hidden: {
    x: "-100%", // Empieza totalmente oculto a la izquierda
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      ...lucaTransition, // Heredamos la física principal
      staggerChildren: 0.08, // LA MAGIA: 80ms de retraso entre cada hijo
      when: "beforeChildren", // El sidebar entra primero, luego los ítems
    },
  },
}; // 2. Los Ítems Hijos (La escalera)
export const sidebarItemVariant: Variants = {
  hidden: { opacity: 0, x: -20 }, // Empiezan un poco a la izquierda
  visible: {
    opacity: 1,
    x: 0,
    transition: lucaFastTransition,
  },
};

// ─────────────────────────────────────────────────────────────
// 3. macOS-Style Floating Sidebar Variants
// ─────────────────────────────────────────────────────────────

// Contenedor flotante — entrada desde la izquierda con fade
// Sin staggerChildren porque controlamos expansión manualmente

export const sidebarFloatContainer: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Ítems con stagger sutil para la entrada inicial
export const sidebarFloatItem: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Para el logo/brand text que aparece/desaparece al expandir/colapsar
export const sidebarLabelReveal: Variants = {
  hidden: { opacity: 0, width: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    width: "auto",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    width: 0,
    overflow: "hidden",
    transition: { duration: 0.15, ease: "easeOut" },
  },
};
