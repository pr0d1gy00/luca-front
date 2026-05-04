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
  { icon: typeof AlertTriangle; borderColor: string }
> = {
  "critical-lab": {
    icon: AlertTriangle,
    borderColor: "border-luca-accent",
  },
  "missed-appointment": {
    icon: Phone,
    borderColor: "border-amber-500",
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
        "flex items-start gap-3 p-4 rounded-xl border-l-4 bg-red-50/50",
        config.borderColor,
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-luca-accent" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-slate-900">{patientName}</p>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <Link
          href={actionHref}
          className="inline-block text-xs font-semibold text-luca-primary hover:underline mt-0.5"
        >
          {actionText} →
        </Link>
      </div>
    </motion.div>
  );
}
