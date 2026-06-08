"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { NotificationAlert } from "./NotificationAlert";
import type { PharmacyNotification } from "../types";

interface CriticalNotificationsProps {
  notifications: PharmacyNotification[];
}

export function CriticalNotifications({
  notifications,
}: CriticalNotificationsProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900">
          Notificaciones Críticas
        </h3>
        <span className="bg-blue-700 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
          {notifications.length}
        </span>
      </div>

      <motion.div
        variants={staggerChildrenVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {notifications.map((not) => (
          <NotificationAlert key={not.id} notification={not} />
        ))}
      </motion.div>
    </motion.div>
  );
}
