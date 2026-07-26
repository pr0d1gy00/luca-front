"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Bell,
  BellIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, getFullImageUrl } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import { useAuthStore, type Role } from "@/store/auth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import {
  usePatientNotificationsQuery,
  usePatientUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/features/notifications/hooks/usePatientNotifications";
import { sidebarFloatContainer, sidebarFloatItem } from "@/app/lib/animations";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDrawer } from "@/app/dashboard/drawer-context";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "pharmako-sidebar-expanded";
const HOVER_LEAVE_DEBOUNCE_MS = 200;

const ROLE_LABELS: Record<Role, string> = {
  patient: "Paciente",
  doctor: "Médico",
  clinic: "Clínica",
  pharmacy: "Farmacia",
};

interface NotificationItem {
  uuid: string;
  type: "SYSTEM" | "NEW_QUOTE_REQUEST" | "QUOTE_RECEIVED" | "FOLLOW_UP_ALERT";
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

function InlineNotification({
  effectiveExpanded,
}: {
  effectiveExpanded: boolean;
}) {
  const { user, role } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Queries reales de paciente (sólo si es paciente)
  const isPatient = role === "patient";

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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 w-full relative",
              "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
              effectiveExpanded
                ? "gap-3 px-3 py-2.5"
                : "justify-center px-0 py-2.5",
            )}
            title={`Notificaciones (${unreadCount})`}
          >
            <div className="relative flex items-center justify-center rounded-lg size-9 shrink-0">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-pharmako-care text-white text-[9px] font-bold leading-none select-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <AnimatePresence initial={false}>
              {effectiveExpanded && (
                <motion.span
                  key="notif-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Notificaciones
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </DialogTrigger>

        <DialogContent
          className="
      w-full max-w-[92vw] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[680px] xl:max-w-[760px] 2xl:max-w-[840px]
      h-[80vh]
      max-h-[650px]
      bg-pharmako-surface
      rounded-xl
      shadow-lg
      border
      border-pharmako-border-soft
      p-0
      gap-0
      flex
      flex-col
      overflow-hidden
    "
        >
          <DialogHeader className="p-6 pb-4 border-b border-pharmako-border-soft flex flex-row items-center justify-between gap-4 shrink-0">
            <DialogTitle className="text-xl font-bold text-pharmako-text-primary">
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

          <div className="flex-1 min-h-0 flex flex-col">
            {isListFetching && notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 p-6">
                <div className="h-6 w-6 border-2 border-pharmako-care border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] text-pharmako-text-secondary">
                  Buscando notificaciones...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <Bell className="h-8 w-8 text-pharmako-text-muted mb-2 opacity-60" />
                <p className="text-md font-semibold text-pharmako-text-primary">
                  No tienes notificaciones
                </p>
                <p className="text-sm text-pharmako-text-secondary mt-1">
                  Te avisaremos cuando haya novedades en tu cuenta.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-pharmako-border-soft/60">
                {notifications.map((not: NotificationItem) => {
                  const isExpanded = expandedId === not.uuid;
                  const { icon: NotifIcon, color: iconStyle } = getNotifIcon(
                    not.type,
                  );
                  const formattedDate = new Date(
                    not.created_at,
                  ).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

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
                                    setOpen(false);
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
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface SidebarProps {
  inDrawer?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function Sidebar({ inDrawer = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, name, email, avatar } = useAuthStore();
  const { logout } = useLogout();
  const drawer = useDrawer();

  // ── Sidebar state ──────────────────────────────────────────
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);
  const getSnapshot = useCallback(
    () => localStorage.getItem(STORAGE_KEY) === "true",
    [],
  );
  const getServerSnapshot = useCallback(() => false, []);

  const isExpanded = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [isHovered, setIsHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Don't expand on hover until hydrated (prevents flash of expanded state)
  const effectiveExpanded = inDrawer ? true : isExpanded || isHovered;

  // ── Handlers ───────────────────────────────────────────────
  const toggleExpand = useCallback(() => {
    const next = !isExpanded;
    localStorage.setItem(STORAGE_KEY, String(next));
    // Dispatch storage event for same-tab sync via useSyncExternalStore
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: String(next),
      }),
    );
  }, [isExpanded]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, HOVER_LEAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const { isVerified } = useAuthStore();

  // ── Derived data ───────────────────────────────────────────
  const allowedLinks = navigationConfig.filter((i) => {
    const hasRole = i.roles.includes(role);
    if (role && role !== "patient" && !isVerified) {
      return false;
    }
    return hasRole;
  });

  if (role && role !== "patient" && !isVerified) {
    allowedLinks.push({
      title: "Configuración",
      name: "profile",
      href: "/dashboard/profile",
      icon: Settings,
      roles: [role],
    });
  }
  const initials = name ? name[0].toUpperCase() : "U";
  const roleLabel = ROLE_LABELS[role] ?? "Médico";

  // ── Mobile / inDrawer render ───────────────────────────────
  if (inDrawer) {
    return (
      <div className="flex-1 flex flex-col justify-between h-full p-4">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <Image
              src="/PharmakoLogoOnlyFace-PNG.png"
              alt="Pharmako"
              width={36}
              height={36}
              className="shrink-0"
            />
            <span className="font-semibold text-lg text-pharmako-text-primary tracking-tight">
              Pharmako
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 no-scrollbar pb-4 border-b">
            {allowedLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => drawer?.close()}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 gap-3 px-3 py-2.5",
                      "text-pharmako-text-secondary hover:text-pharmako-text-primary relative",
                    )}
                  >
                    {isActive && (
                      <div
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2",
                          "w-[3px] h-5 bg-pharmako-care rounded-r-full",
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "flex items-center justify-center rounded-lg transition-colors duration-200",
                        "size-9 shrink-0",
                        isActive
                          ? "bg-pharmako-care-light text-pharmako-care"
                          : "hover:bg-slate-100",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.title}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer: Search + Notifications + Profile */}
        <div className="space-y-1.5 mt-auto pt-4 border-t">
          {/* Search */}
          <button
            onClick={() => { }}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 w-full gap-3 px-3 py-2.5",
              "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
            )}
            title="Buscar"
          >
            <div className="flex items-center justify-center rounded-lg size-9 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              Buscar
            </span>
          </button>

          {/* Notifications */}
          <InlineNotification effectiveExpanded={true} />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 w-full gap-3 px-3 py-2.5",
                  "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
                )}
                title="Perfil de usuario"
              >
                <div className="flex items-center justify-center rounded-lg size-9 shrink-0">
                  <Avatar className="size-8">
                    {avatar ? (
                      <AvatarImage src={getFullImageUrl(avatar)} alt={name || "Usuario"} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col items-start whitespace-nowrap overflow-hidden min-w-0">
                  <span className="text-sm font-medium text-pharmako-text-primary truncate w-full text-left">
                    {name || "Usuario"}
                  </span>
                  <span className="text-[11px] text-pharmako-text-muted/70 truncate w-full text-left">
                    {roleLabel}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={12}
              className="w-56"
            >
              <DropdownMenuLabel className="font-semibold text-slate-900 text-sm">
                {name || "Usuario"}
              </DropdownMenuLabel>
              {email && (
                <DropdownMenuLabel className="text-xs text-pharmako-text-muted font-normal pt-0">
                  {email}
                </DropdownMenuLabel>
              )}
              <div className="px-1.5 pb-1">
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {roleLabel}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild onClick={() => drawer?.close()}>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 w-full"
                >
                  <Settings className="size-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  drawer?.close();
                  logout();
                }}
              >
                <LogOut className="size-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // ── Desktop floating render ────────────────────────────────
  return (
    <>
      {/* Search Command dialog — global, triggered from sidebar */}
      <motion.aside
        variants={sidebarFloatContainer}
        initial="hidden"
        animate="visible"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed left-3 top-3 bottom-3 z-40",
          "hidden lg:flex flex-col",
          "bg-white/70 backdrop-blur-xl",
          "border border-white/20",
          "shadow-lg shadow-black/5",
          "rounded-2xl",
          "transition-all duration-300 ease-out",
          effectiveExpanded ? "w-[220px] p-4" : "w-[72px] p-3",
        )}
      >
        {/* ── Logo ──────────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center mb-6",
            effectiveExpanded ? "gap-3" : "justify-center",
          )}
        >
          <Image
            src="/PharmakoLogoOnlyFace-PNG.png"
            alt="Pharmako"
            width={effectiveExpanded ? 36 : 28}
            height={effectiveExpanded ? 36 : 28}
            className="shrink-0"
            style={{
              width: effectiveExpanded ? 36 : 28,
              height: effectiveExpanded ? 36 : 28,
            }}
          />
          <AnimatePresence initial={false}>
            {effectiveExpanded && (
              <motion.span
                key="brand-label"
                variants={sidebarFloatItem}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="font-semibold text-lg text-pharmako-text-primary tracking-tight whitespace-nowrap"
              >
                Pharmako
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto space-y-1 no-scrollbar border-b">
          {allowedLinks.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                variants={sidebarFloatItem}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.04 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200",
                    "text-pharmako-text-secondary hover:text-pharmako-text-primary",
                    "relative",
                    effectiveExpanded
                      ? "gap-3 px-3 py-2.5"
                      : "justify-center px-0 py-2.5",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-bar"
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2",
                        "w-[3px] h-5 bg-pharmako-care rounded-r-full",
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <div
                    className={cn(
                      "flex items-center justify-center rounded-lg transition-colors duration-200",
                      "size-9 shrink-0",
                      isActive
                        ? "bg-pharmako-care-light text-pharmako-care"
                        : "hover:bg-slate-100",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <AnimatePresence initial={false}>
                    {effectiveExpanded && (
                      <motion.span
                        key={`label-${item.title}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                          "text-sm font-medium whitespace-nowrap overflow-hidden",
                          isActive && "text-pharmako-text-primary",
                        )}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* ── Spacer ────────────────────────────────────────── */}

        {/* ── Footer: Search + Notifications + Profile ──────── */}
        <div className="space-y-0.5">
          {/* Search */}
          <button
            onClick={() => { }}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 w-full",
              "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
              effectiveExpanded
                ? "gap-3 px-3 py-2.5"
                : "justify-center px-0 py-2.5",
            )}
            title="Buscar (Ctrl+K)"
          >
            <div className="flex items-center justify-center rounded-lg size-9 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <AnimatePresence initial={false}>
              {effectiveExpanded && (
                <motion.span
                  key="search-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Buscar
                </motion.span>
              )}
            </AnimatePresence>
            {effectiveExpanded && (
              <kbd className="ml-auto text-[10px] font-mono text-pharmako-text-muted/50 bg-slate-100 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            )}
          </button>

          {/* Notifications — inline popover with sidebar style */}
          <InlineNotification effectiveExpanded={effectiveExpanded} />
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 w-full",
                  "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
                  effectiveExpanded
                    ? "gap-3 px-3 py-2.5"
                    : "justify-center px-0 py-2.5",
                )}
                title="Perfil de usuario"
              >
                <div className="flex items-center justify-center rounded-lg size-9 shrink-0">
                  <Avatar className="size-8">
                    {avatar ? (
                      <AvatarImage src={getFullImageUrl(avatar)} alt={name || "Usuario"} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <AnimatePresence initial={false}>
                  {effectiveExpanded && (
                    <motion.div
                      key="profile-label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="flex flex-col items-start whitespace-nowrap overflow-hidden min-w-0"
                    >
                      <span className="text-sm font-medium text-pharmako-text-primary truncate w-full text-left">
                        {name || "Usuario"}
                      </span>
                      <span className="text-[11px] text-pharmako-text-muted/70 truncate w-full text-left">
                        {roleLabel}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="right"
              sideOffset={12}
              className="w-56"
            >
              <DropdownMenuLabel className="font-semibold text-slate-900 text-sm">
                {name || "Usuario"}
              </DropdownMenuLabel>
              {email && (
                <DropdownMenuLabel className="text-xs text-pharmako-text-muted font-normal pt-0">
                  {email}
                </DropdownMenuLabel>
              )}
              <div className="px-1.5 pb-1">
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {roleLabel}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 w-full"
                >
                  <Settings className="size-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  logout();
                }}
              >
                <LogOut className="size-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Divider ───────────────────────────────────── */}
          <div className="py-1">
            <div className="h-px bg-slate-200/60" />
          </div>

          {/* ── Toggle ──────────────────────────────────────── */}
          <button
            onClick={toggleExpand}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 w-full",
              "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
              effectiveExpanded
                ? "gap-3 px-3 py-2.5"
                : "justify-center px-0 py-2.5",
            )}
            title={effectiveExpanded ? "Minimizar" : "Expandir"}
          >
            <div className="flex items-center justify-center rounded-lg size-9 shrink-0">
              <ChevronLeft
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  !effectiveExpanded && "rotate-180",
                )}
              />
            </div>

            <AnimatePresence initial={false}>
              {effectiveExpanded && (
                <motion.span
                  key="toggle-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {effectiveExpanded ? "Minimizar" : "Maximizar"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
