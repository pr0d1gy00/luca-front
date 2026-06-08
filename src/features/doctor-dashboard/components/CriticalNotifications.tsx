"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Bell } from "lucide-react";
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
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-pharmako-care" />
          <h3 className="text-sm font-semibold text-slate-800">Alertas</h3>
          {notifications.length > 0 && (
            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              {notifications.length} activa
              {notifications.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <motion.div
          variants={staggerChildrenVariant}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-1.5"
        >
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No hay alertas activas
            </p>
          ) : (
            notifications.map((not) => (
              <NotificationAlert key={not.id} notification={not} />
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
