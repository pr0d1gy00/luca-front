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
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import { useAuthStore, type Role } from "@/store/auth";
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

// ── Mock notifications ────────────────────────────────────
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

const ICON_COLOR: Record<string, string> = {
  alert: "text-amber-500",
  info: "text-pharmako-care",
  success: "text-emerald-500",
};

// ── Notification Modal (Dialog + Accordion) ──────────────
const NOTIF_DETAILS: Record<string, { detail: string; action: string }> = {
  "1": {
    detail:
      "Paciente: Roberto Suárez. Hemoglobina: 6.2 g/dL. El valor crítico requiere evaluación inmediata. Se recomienda repetir la muestra y contactar al paciente.",
    action: "Revisar ficha del paciente",
  },
  "2": {
    detail:
      "Paciente: Carmen Vega. Cita programada para el 02/05/2026 a las 10:00. No se presentó ni notificó. Intentar contacto telefónico.",
    action: "Llamar al paciente",
  },
  "3": {
    detail:
      "Receta electrónica #4532 del paciente Pedro Rodríguez lista para firma digital. Vence en 48 horas.",
    action: "Firmar receta",
  },
};

function InlineNotification({
  effectiveExpanded,
}: {
  effectiveExpanded: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const count = MOCK_NOTIFICATIONS.length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 w-full",
              "text-pharmako-text-muted hover:text-pharmako-text-primary hover:bg-slate-100",
              effectiveExpanded
                ? "gap-3 px-3 py-2.5"
                : "justify-center px-0 py-2.5",
            )}
            title={`Notificaciones (${count})`}
          >
            <div className="relative flex items-center justify-center rounded-lg size-9 shrink-0">
              <Bell className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-pharmako-care text-white text-[9px] font-bold leading-none select-none">
                  {count}
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

        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>

          <div className="divide-y divide-slate-100 -mx-6 -mb-6">
            {MOCK_NOTIFICATIONS.map((notification) => {
              const NotifIcon =
                notification.icon === "AlertTriangle"
                  ? AlertTriangleIcon
                  : notification.icon === "CheckCircle"
                    ? CheckCircleIcon
                    : BellIcon;
              const details = NOTIF_DETAILS[notification.id];
              const isExpanded = expandedId === notification.id;

              return (
                <div key={notification.id} className="px-6">
                  <button
                    onClick={() => toggleExpand(notification.id)}
                    className="flex items-start gap-3 w-full py-4 text-left transition-colors hover:opacity-80"
                  >
                    <div
                      className={cn(
                        "mt-0.5 shrink-0",
                        ICON_COLOR[notification.type],
                      )}
                    >
                      <NotifIcon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">
                          {notification.title}
                        </p>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {notification.timestamp}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && details && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-7">
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">
                            {details.detail}
                          </p>
                          <button className="text-xs font-semibold text-pharmako-care hover:text-pharmako-care-hover transition-colors">
                            {details.action} →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
  const { role, name, email, avatar, clearAuth } = useAuthStore();

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

  // ── Derived data ───────────────────────────────────────────
  const allowedLinks = navigationConfig.filter((i) => i.roles.includes(role));
  const initials = name ? name[0].toUpperCase() : "U";
  const roleLabel = ROLE_LABELS[role] ?? "Médico";

  // ── Mobile / inDrawer render ───────────────────────────────
  if (inDrawer) {
    return (
      <nav className="flex flex-col w-full p-4 gap-1">
        <div className="flex items-center gap-3 mb-6 px-2">
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

        {allowedLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "font-medium text-sm",
                isActive
                  ? "bg-pharmako-primary-light text-pharmako-primary"
                  : "text-pharmako-text-secondary hover:bg-slate-100 hover:text-pharmako-text-primary",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
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
            onClick={() => {}}
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
                      <AvatarImage src={avatar} alt={name || "Usuario"} />
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
                  clearAuth();
                  router.push("/");
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
                  Minimizar
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
