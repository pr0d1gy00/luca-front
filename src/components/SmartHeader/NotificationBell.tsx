"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BellIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { scaleInVariant } from "@/app/lib/animations";
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

type Notification = (typeof MOCK_NOTIFICATIONS)[number];

const ICON_MAP = {
  AlertTriangle: AlertTriangleIcon,
  Bell: BellIcon,
  CheckCircle: CheckCircleIcon,
} as const;

const ICON_COLOR: Record<Notification["type"], string> = {
  alert: "text-amber-500",
  info: "text-blue-500",
  success: "text-emerald-500",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const count = MOCK_NOTIFICATIONS.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notificaciones (${count})`}
          className={cn(
            "relative inline-flex items-center justify-center size-10 rounded-full",
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
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Notificaciones
          </h3>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          <AnimatePresence>
            {open &&
              MOCK_NOTIFICATIONS.map((notification, index) => {
                const Icon = ICON_MAP[notification.icon];
                return (
                  <motion.div
                    key={notification.id}
                    variants={scaleInVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      "hover:bg-slate-50 transition-colors cursor-pointer",
                      index < MOCK_NOTIFICATIONS.length - 1 &&
                        "border-b border-slate-50",
                    )}
                    role="listitem"
                  >
                    <div
                      className={cn(
                        "mt-0.5 shrink-0",
                        ICON_COLOR[notification.type],
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-luca-muted mt-0.5">
                        {notification.timestamp}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}
