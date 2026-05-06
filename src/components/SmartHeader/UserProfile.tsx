"use client";

import { useAuthStore, type Role } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SettingsIcon, LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<Role, string> = {
  patient: "Paciente",
  doctor: "Médico",
  clinic: "Clínica",
  pharmacy: "Farmacia",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserProfile() {
  const { name, email, avatar, role } = useAuthStore();
  const roleLabel = ROLE_LABELS[role] ?? "Médico";
  const initials = name ? name[0].toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Perfil de usuario"
          className={cn(
            "rounded-full focus-visible:ring-2 focus-visible:ring-luca-primary/20",
            "focus-visible:outline-none transition-transform hover:scale-105",
          )}
        >
          <Avatar size="default">
            {avatar ? (
              <AvatarImage src={avatar} alt={name || "Usuario"} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {/* Name */}
        <DropdownMenuLabel className="font-semibold text-slate-900 text-sm">
          {name || "Usuario"}
        </DropdownMenuLabel>

        {/* Email (hidden when empty) */}
        {email && (
          <DropdownMenuLabel className="text-xs text-luca-muted font-normal pt-0">
            {email}
          </DropdownMenuLabel>
        )}

        {/* Role badge */}
        <div className="px-1.5 pb-1">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {roleLabel}
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem role="menuitem">
          <SettingsIcon className="size-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout (destructive) */}
        <DropdownMenuItem role="menuitem" variant="destructive">
          <LogOutIcon className="size-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
