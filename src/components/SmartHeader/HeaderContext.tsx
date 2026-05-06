"use client";

import { useAuthStore, type Role } from "@/store/auth";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_SUBTITLES: Record<Role, string> = {
  patient: "Próxima cita: Hoy 15:30",
  doctor: "Siguiente paciente: María G.",
  clinic: "3 citas pendientes hoy",
  pharmacy: "5 recetas por dispensar",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderContextProps {
  isCompact?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeaderContext({ isCompact = false }: HeaderContextProps) {
  const { role } = useAuthStore();

  // When compact, render nothing
  if (isCompact) return null;

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today);

  const subtitle = ROLE_SUBTITLES[role] ?? ROLE_SUBTITLES.doctor;

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-luca-muted capitalize">{formattedDate}</p>
      <p className="text-xs text-luca-muted">{subtitle}</p>
    </div>
  );
}
