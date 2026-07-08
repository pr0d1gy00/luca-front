"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import {
  usePatientNotificationsQuery,
  usePatientUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/features/notifications/hooks/usePatientNotifications";
import {
  BellIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronDown,
  Bell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NotificationItem {
  uuid: string;
  type: "SYSTEM" | "NEW_QUOTE_REQUEST" | "QUOTE_RECEIVED" | "FOLLOW_UP_ALERT";
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

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
  const { user } = useAuthStore();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  // Solo consumimos si el rol es paciente
  const isPatient = user?.role === "patient";

  const { data: notificationsData, isFetching: isListFetching } =
    usePatientNotificationsQuery();
  const { data: unreadCountData } = usePatientUnreadCountQuery();

  const markAsReadMutation = useMarkNotificationReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = isPatient
    ? notificationsData?.data?.data || notificationsData?.data || []
    : [];
  const unreadCount = isPatient
    ? Number(unreadCountData?.data?.count || unreadCountData?.count || 0)
    : 0;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    if (!next) setExpandedId(null); // reset accordion on close
    onOpenChangeProp?.(next);
  };

  const toggleExpand = (uuid: string, isRead: boolean) => {
    setExpandedId((prev) => (prev === uuid ? null : uuid));
    if (!isRead && isPatient) {
      markAsReadMutation.mutate(uuid);
    }
  };

  const handleMarkAllRead = () => {
    if (isPatient) {
      markAllAsReadMutation.mutate();
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "NEW_QUOTE_REQUEST":
        return {
          icon: AlertTriangleIcon,
          color: "text-amber-500 bg-amber-50 border-amber-100",
        };
      case "QUOTE_RECEIVED":
        return {
          icon: CheckCircleIcon,
          color: "text-emerald-500 bg-emerald-50 border-emerald-100",
        };
      case "FOLLOW_UP_ALERT":
        return {
          icon: AlertTriangleIcon,
          color: "text-rose-500 bg-rose-50 border-rose-100",
        };
      case "SYSTEM":
      default:
        return {
          icon: BellIcon,
          color: "text-pharmako-care bg-blue-50 border-blue-100",
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          aria-label={`Notificaciones (${unreadCount})`}
          className={cn(
            "relative hidden md:inline-flex items-center justify-center size-11 rounded-full",
            "hover:bg-slate-100 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-luca-primary/20 focus-visible:outline-none",
          )}
        >
          <Bell className="size-5 text-luca-muted-dark" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1 rounded-full",
                "bg-luca-accent text-white text-[10px] font-bold leading-none",
                "select-none",
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-pharmako-surface rounded-xl shadow-lg border border-pharmako-border-soft p-6">
        <DialogHeader className="pb-3 border-b border-pharmako-border-soft flex flex-row items-center justify-between gap-4">
          <DialogTitle className="text-base font-bold text-pharmako-text-primary">
            Notificaciones
          </DialogTitle>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs text-pharmako-primary hover:text-pharmako-primary-hover font-bold transition-colors disabled:opacity-50 shrink-0"
            >
              Marcar todas como leídas
            </button>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-pharmako-border-soft/60 -mx-6 -mb-6">
          {isListFetching && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="h-6 w-6 border-2 border-pharmako-care border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] text-pharmako-text-secondary">
                Buscando notificaciones...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center p-6 text-pharmako-text-muted">
              <Bell className="h-8 w-8 text-pharmako-text-muted mb-2 opacity-60" />
              <p className="text-xs font-semibold text-pharmako-text-primary">
                No tienes notificaciones
              </p>
              <p className="text-[10px] text-pharmako-text-secondary mt-0.5">
                Te avisaremos cuando haya novedades en tu cuenta.
              </p>
            </div>
          ) : (
            notifications.map((not: NotificationItem) => {
              const isExpanded = expandedId === not.uuid;
              const { icon: NotifIcon, color: iconStyle } = getNotifIcon(
                not.type,
              );
              const formattedDate = new Date(not.created_at).toLocaleDateString(
                "es-ES",
                {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={not.uuid}
                  className={cn(
                    "px-6 transition-colors duration-150",
                    !not.is_read && "bg-slate-50/50",
                  )}
                >
                  <button
                    onClick={() => toggleExpand(not.uuid, not.is_read)}
                    className="flex items-start gap-3 w-full py-4 text-left hover:opacity-90 relative"
                  >
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                        iconStyle,
                      )}
                    >
                      <NotifIcon className="size-4 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs text-slate-800 truncate",
                            !not.is_read
                              ? "font-bold text-slate-950"
                              : "font-medium",
                          )}
                        >
                          {not.title}
                        </p>
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formattedDate}
                      </p>
                    </div>
                    {!not.is_read && (
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 size-2 rounded-full bg-pharmako-care" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-11">
                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {not.message}
                          </p>
                          {not.link && (
                            <button
                              onClick={() => {
                                handleOpenChange(false);
                                router.push(not.link);
                              }}
                              className="text-xs font-bold text-pharmako-primary hover:text-pharmako-primary-hover transition-colors flex items-center gap-0.5"
                            >
                              Ir a la sección →
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
