"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/store/auth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDrawerToggle } from "@/app/dashboard/drawer-context";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { fadeUpVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";
import { Menu, Calendar, Plus, LayoutDashboard, Package } from "lucide-react";

import { SearchCommand } from "./SmartHeader/SearchCommand";
import { NotificationBell } from "./SmartHeader/NotificationBell";
import { UserProfile } from "./SmartHeader/UserProfile";
import { HeaderContext } from "./SmartHeader/HeaderContext";
import { MobileHeader } from "./SmartHeader/MobileHeader";

// ---------------------------------------------------------------------------
// Role CTA configuration
// ---------------------------------------------------------------------------

type Role = ReturnType<typeof useAuthStore.getState>["role"];

interface CTAConfig {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const ROLE_CTA: Record<string, CTAConfig> = {
  patient: { label: "Citas", Icon: Calendar },
  doctor: { label: "Nueva Cita", Icon: Plus },
  clinic: { label: "Dashboard", Icon: LayoutDashboard },
  pharmacy: { label: "Pedidos", Icon: Package },
};

const FALLBACK_CTA: CTAConfig = { label: "Nueva Cita", Icon: Plus };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SmartHeader() {
  const { role, name } = useAuthStore();
  const { isCompact } = useScrollDirection();
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const drawerToggle = useDrawerToggle();

  // Controlled states for sub-components (mobile wiring)
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const cta = ROLE_CTA[role] ?? FALLBACK_CTA;

  const handleSearchClick = useCallback(() => setSearchOpen(true), []);
  const handleBellClick = useCallback(() => setBellOpen(true), []);

  const displayName = name || "Usuario";

  return (
    <motion.header
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      layout
      className={cn(
        "sticky top-0 z-50",
        "bg-white/80 backdrop-blur-md",
        "transition-all duration-200",
        isCompact ? "shadow-md" : "shadow-sm",
      )}
    >
      {/* ================================================================= */}
      {/* Desktop / Tablet layout (md+) */}
      {/* ================================================================= */}
      {!isMobile && (
        <div className="flex items-center justify-between px-6 py-3 pt-[env(safe-area-inset-top,16px)]">
          {/* Left: hamburger + greeting + context */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — only visible below lg */}
            <button
              onClick={drawerToggle ?? undefined}
              aria-label="Abrir menú"
              className={cn(
                "lg:hidden size-11 flex items-center justify-center rounded-full shrink-0",
                "hover:bg-slate-100 transition-colors",
                "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
              )}
            >
              <Menu className="size-5 text-luca-muted-dark" />
            </button>

            {/* Greeting + context — fades on compact */}
            <AnimatePresence>
              {!isCompact && (
                <motion.div
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="min-w-0"
                >
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 truncate">
                    Hola, {displayName}
                  </h2>
                  <HeaderContext isCompact={isCompact} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: CTA + Search + Bell + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Role CTA button */}
            <button
              className={cn(
                "hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                "bg-luca-primary hover:bg-luca-primary-hover text-white",
                "text-sm font-semibold shadow-sm",
                "hover:scale-105 transition-all duration-300",
                "focus-visible:ring-2 focus-visible:ring-luca-primary/30 focus-visible:outline-none",
              )}
            >
              <cta.Icon className="size-4" />
              <span>{cta.label}</span>
            </button>

            <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
            <NotificationBell open={bellOpen} onOpenChange={setBellOpen} />
            <UserProfile />
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Mobile layout (<768px) */}
      {/* ================================================================= */}
      {isMobile && (
        <MobileHeader
          onSearchClick={handleSearchClick}
          onBellClick={handleBellClick}
        />
      )}

      {/* Render SearchCommand/NotificationBell outside the layout blocks so
          mobile callbacks can open them even when desktop block is unmounted. */}
      {isMobile && (
        <>
          <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
          <NotificationBell open={bellOpen} onOpenChange={setBellOpen} />
        </>
      )}
    </motion.header>
  );
}
