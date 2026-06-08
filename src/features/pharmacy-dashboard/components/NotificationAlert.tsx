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
    borderColor: string;
    bgColor: string;
    iconColor: string;
  }
> = {
  "stock-alert": {
    icon: AlertTriangle,
    borderColor: "border-amber-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  "prescription-error": {
    icon: XCircle,
    borderColor: "border-blue-700",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-700",
  },
};

export function NotificationAlert({ notification }: NotificationAlertProps) {
  const { type, title, message, actionText, actionHref } = notification;
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={fadeUpVariant}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border-l-4",
        config.borderColor,
        config.bgColor,
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn("w-5 h-5", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        <Link
          href={actionHref}
          className="inline-block text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors mt-0.5"
        >
          {actionText} →
        </Link>
      </div>
    </motion.div>
  );
}
