"use client";

import { motion } from "motion/react";
import { MenuIcon, SearchIcon, BellIcon } from "lucide-react";
import { useDrawerToggle } from "@/app/dashboard/drawer-context";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fadeUpVariant } from "@/app/lib/animations";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MobileHeaderProps {
  /** Called when the search icon is pressed. Wired to SearchCommand in PR 3. */
  onSearchClick?: () => void;
  /** Called when the bell icon is pressed. Wired to NotificationBell in PR 3. */
  onBellClick?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MobileHeader({
  onSearchClick,
  onBellClick,
}: MobileHeaderProps) {
  const drawerToggle = useDrawerToggle();
  const { name, avatar } = useAuthStore();
  const initials = name ? name[0].toUpperCase() : "U";

  return (
    <motion.header
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className={cn(
        "lg:hidden flex items-center justify-between",
        "px-4 py-3",
        "pt-[env(safe-area-inset-top,16px)]",
        "bg-white/80 backdrop-blur-md shadow-sm",
      )}
    >
      {/* Hamburger */}
      <button
        onClick={drawerToggle ?? undefined}
        aria-label="Abrir menú"
        className={cn(
          "size-11 flex items-center justify-center rounded-full",
          "hover:bg-slate-100 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
        )}
      >
        <MenuIcon className="size-5 text-luca-muted-dark" />
      </button>

      {/* Right-side action group */}
      <div className="flex items-center gap-1">
        {/* Search icon */}
        <button
          onClick={onSearchClick}
          aria-label="Buscar"
          className={cn(
            "size-11 flex items-center justify-center rounded-full",
            "hover:bg-slate-100 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          )}
        >
          <SearchIcon className="size-5 text-luca-muted-dark" />
        </button>

        {/* Bell icon */}
        <button
          onClick={onBellClick}
          aria-label="Notificaciones"
          className={cn(
            "size-11 flex items-center justify-center rounded-full",
            "hover:bg-slate-100 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          )}
        >
          <BellIcon className="size-5 text-luca-muted-dark" />
        </button>

        {/* Avatar (32px = default size) */}
        <button
          aria-label="Perfil de usuario"
          className={cn(
            "ml-1 rounded-full",
            "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          )}
        >
          <Avatar size="default">
            {avatar ? (
              <AvatarImage src={avatar} alt={name || "Usuario"} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </motion.header>
  );
}
