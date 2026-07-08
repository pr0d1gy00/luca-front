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

export function MobileHeader() {
  const drawerToggle = useDrawerToggle();

  return (
    <motion.header
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className={cn(
        "lg:hidden flex items-center justify-between",
        "px-4 py-2",
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
    </motion.header>
  );
}
