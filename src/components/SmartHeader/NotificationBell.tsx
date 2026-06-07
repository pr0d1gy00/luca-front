"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "alert" as const,
    icon: "AlertTriangle" as const,
    title: "Resultado de laboratorio crítico",
    timestamp: "Hace 5 min",
  },
  {
    id: "2",
    type: "info" as const,
    icon: "Bell" as const,
    title: "Cita confirmada para mañana",
    timestamp: "Hace 30 min",
  },
  {
    id: "3",
    type: "success" as const,
    icon: "CheckCircle" as const,
    title: "Receta lista para retirar",
    timestamp: "Hace 1 hora",
  },
];

const NOTIF_DETAILS: Record<string, { detail: string; action: string }> = {
  "1": {
    detail:
      "Paciente: Roberto Suárez. Hemoglobina: 6.2 g/dL. El valor crítico requiere evaluación inmediata. Se recomienda repetir la muestra y contactar al paciente.",
    action: "Revisar ficha del paciente",
  },
  "2": {
    detail:
      "Paciente: Carmen Vega. Cita programada para el 02/05/2026 a las 10:00. No se presentó ni notificó. Intentar contacto telefónico.",
    action: "Llamar al paciente",
  },
  "3": {
    detail:
      "Receta electrónica #4532 del paciente Pedro Rodríguez lista para firma digital. Vence en 48 horas.",
    action: "Firmar receta",
  },
};

type Notification = (typeof MOCK_NOTIFICATIONS)[number];

const ICON_MAP = {
  AlertTriangle: AlertTriangleIcon,
  Bell: BellIcon,
  CheckCircle: CheckCircleIcon,
} as const;

const ICON_COLOR: Record<Notification["type"], string> = {
  alert: "text-amber-500",
  info: "text-pharmako-care",
  success: "text-emerald-500",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface NotificationBellProps {
  /** Controlled mode: external open state (for SmartHeader → MobileHeader wiring) */
  open?: boolean;
  /** Controlled mode: external open-change handler */
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBell({
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: NotificationBellProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    if (!next) setExpandedId(null); // reset accordion on close
    onOpenChangeProp?.(next);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const count = MOCK_NOTIFICATIONS.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          aria-label={`Notificaciones (${count})`}
          className={cn(
            "relative hidden md:inline-flex items-center justify-center size-11 rounded-full",
            "hover:bg-slate-100 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          )}
        >
          <BellIcon className="size-5 text-luca-muted-dark" />
          {count > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1 rounded-full",
                "bg-luca-accent text-white text-[10px] font-bold leading-none",
                "select-none",
              )}
            >
              {count}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Notificaciones</DialogTitle>
        </DialogHeader>

        <div className="divide-y divide-slate-100 -mx-6 -mb-6">
          {MOCK_NOTIFICATIONS.map((notification) => {
            const NotifIcon = ICON_MAP[notification.icon];
            const details = NOTIF_DETAILS[notification.id];
            const isExpanded = expandedId === notification.id;

            return (
              <div key={notification.id} className="px-6">
                <button
                  onClick={() => toggleExpand(notification.id)}
                  className="flex items-start gap-3 w-full py-4 text-left transition-colors hover:opacity-80"
                >
                  <div
                    className={cn(
                      "mt-0.5 shrink-0",
                      ICON_COLOR[notification.type],
                    )}
                  >
                    <NotifIcon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {notification.title}
                      </p>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {notification.timestamp}
                    </p>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && details && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 pl-7">
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {details.detail}
                        </p>
                        <button className="text-xs font-semibold text-pharmako-care hover:text-pharmako-care-hover transition-colors">
                          {details.action} →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
