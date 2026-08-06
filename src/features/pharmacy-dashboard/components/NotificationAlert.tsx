"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PharmacyNotification, NotificationType } from "../types";
import Link from "next/link";

interface NotificationAlertProps {
  notification: PharmacyNotification;
}

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof AlertTriangle;
    iconBg: string;
    iconColor: string;
  }
> = {
  "stock-alert": {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  "prescription-error": {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
};

export function NotificationAlert({ notification }: NotificationAlertProps) {
  const { type, title, message, actionText, actionHref } = notification;
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={fadeUpVariant}
      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
    >
      <div className={cn("flex-shrink-0 p-1.5 rounded-lg", config.iconBg)}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        <Link
          href={actionHref}
          className="inline-block text-xs font-medium text-pharmako-care hover:text-pharmako-care-hover transition-colors mt-0.5"
        >
          {actionText} &rarr;
        </Link>
      </div>
    </motion.div>
  );
}
