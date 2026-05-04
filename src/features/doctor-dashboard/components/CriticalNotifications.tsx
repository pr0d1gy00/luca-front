"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { NotificationAlert } from "./NotificationAlert";
import type { Notification } from "../types";

interface CriticalNotificationsProps {
  notifications: Notification[];
}

export function CriticalNotifications({
  notifications,
}: CriticalNotificationsProps) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900">
        Notificaciones Críticas
      </h3>

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
