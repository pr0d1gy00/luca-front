"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { AlertTriangle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "../types";
import Link from "next/link";

interface NotificationAlertProps {
  notification: Notification;
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof AlertTriangle; color: string }
> = {
  "critical-lab": {
    icon: AlertTriangle,
    color: "text-rose-500",
  },
  "missed-appointment": {
    icon: Phone,
    color: "text-amber-500",
  },
};

export function NotificationAlert({ notification }: NotificationAlertProps) {
  const { patientName, type, message, actionText, actionHref } = notification;
  const config = typeConfig[type] ?? typeConfig["critical-lab"];
  const Icon = config.icon;

  return (
    <motion.div
      variants={fadeUpVariant}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        "hover:bg-slate-50 transition-colors",
      )}
    >
      <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800">{patientName}</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        <Link
          href={actionHref}
          className="inline-block text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mt-0.5"
        >
          {actionText} →
        </Link>
      </div>
    </motion.div>
  );
}
