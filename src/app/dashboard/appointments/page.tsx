"use client";

import { useState, useTransition } from "react";
import { usePatientAppointmentsQuery } from "@/features/appointments/hooks/usePatientAppointmentsQuery";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "all" | "upcoming" | "past" | "cancelled";

export default function PatientAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [, startTransition] = useTransition();

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = usePatientAppointmentsQuery(page);

  const appointments = paginatedData?.data || [];
  const totalPages = paginatedData?.last_page || 1;

  // Filtrado local de las citas según la pestaña activa
  const getFilteredAppointments = () => {
    const todayStr = new Date().toISOString().split("T")[0];

    return appointments.filter((apt) => {
      const isCancelled = apt.status === "CANCELLED";
      const isCompleted = apt.status === "COMPLETED";
      const isPastDate = apt.date < todayStr;

      switch (activeTab) {
        case "upcoming":
          return !isCancelled && !isCompleted && !isPastDate;
        case "past":
          return isCompleted || (isPastDate && !isCancelled);
        case "cancelled":
          return isCancelled;
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredApts = getFilteredAppointments();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: "Pendiente",
        className:
          "bg-pharmako-warning-light text-pharmako-warning border-pharmako-warning/10",
      },
      CONFIRMED: {
        label: "Confirmada",
        className:
          "bg-pharmako-success-light text-pharmako-success border-pharmako-success/10",
      },
      COMPLETED: {
        label: "Completada",
        className: "bg-slate-50 text-slate-600 border-slate-200",
      },
      CANCELLED: {
        label: "Cancelada",
        className:
          "bg-pharmako-danger-light text-pharmako-danger border-pharmako-danger/10",
      },
      NO_SHOW: {
        label: "No Asistió",
        className:
          "bg-pharmako-danger-light text-pharmako-danger border-pharmako-danger/10",
      },
    };

    const config = statusMap[status] || {
      label: status,
      className: "bg-slate-50 text-slate-600 border-slate-200",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
          config.className,
        )}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
            Mis Citas Médicas
          </h1>
          <p className="text-sm text-pharmako-text-secondary">
            Visualiza tu historial completo de citas programadas, pasadas y
            canceladas.
          </p>
        </div>
        <Link href="/dashboard/booking">
          <Button className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white font-semibold rounded-lg text-sm h-10 px-5 flex items-center gap-2 transition-all shadow-sm">
            <Plus className="size-4" />
            Nueva Cita
          </Button>
        </Link>
      </div>

      {/* Selector de Pestañas (Filtros) */}
      <div className="flex items-center gap-1 border-b border-pharmako-border-soft overflow-x-auto pb-px">
        {(["all", "upcoming", "past", "cancelled"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200",
              activeTab === tab
                ? "border-pharmako-primary text-pharmako-primary"
                : "border-transparent text-pharmako-text-muted hover:text-pharmako-text-primary hover:border-pharmako-border",
            )}
          >
            {tab === "all" && "Todas las Citas"}
            {tab === "upcoming" && "Próximas"}
            {tab === "past" && "Historial / Pasadas"}
            {tab === "cancelled" && "Canceladas"}
          </button>
        ))}
      </div>

      {/* Contenedor Principal / Lista */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-pharmako-surface rounded-xl border border-pharmako-border-soft shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl border border-pharmako-border-soft shadow-sm p-6">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar las citas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : filteredApts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl border border-pharmako-border-soft shadow-sm p-8">
          <Calendar className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No se encontraron citas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            {activeTab === "upcoming" &&
              "No tienes citas programadas próximamente."}
            {activeTab === "past" &&
              "No tienes registros de citas pasadas finalizadas."}
            {activeTab === "cancelled" &&
              "No tienes citas canceladas en este período."}
            {activeTab === "all" &&
              "Aún no has registrado ninguna cita en la plataforma."}
          </p>
          {activeTab === "upcoming" && (
            <Link href="/dashboard/booking" className="mt-4">
              <Button
                size="sm"
                className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white font-semibold rounded-lg px-4"
              >
                Agendar primera cita
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApts.map((apt) => {
              const doctorName =
                apt.doctor?.full_name ||
                apt.doctor?.fullName ||
                "Médico Especialista";
              const specialties = apt.doctor?.specialties || [];
              const specialtyLabel = specialties[0]?.name || "Medicina General";
              const clinicName = apt.clinic_branch?.name || "Sede Principal";
              const formattedDate = new Date(apt.date).toLocaleDateString(
                "es-ES",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              );

              return (
                <div
                  key={apt.uuid}
                  className={cn(
                    "bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 shadow-sm",
                    "hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-pharmako-primary-light rounded-xl border border-pharmako-primary-muted/20 shrink-0">
                        <User className="h-5 w-5 text-pharmako-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-pharmako-text-primary truncate">
                          {doctorName}
                        </h3>
                        <p className="text-xs text-pharmako-text-secondary font-medium">
                          {specialtyLabel}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs text-pharmako-text-secondary border-t border-pharmako-border-soft pt-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                      <span className="capitalize">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                      <span>{apt.time.slice(0, 5)} HS</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                      <span className="truncate">{clinicName}</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-pharmako-text-primary">
                      {apt.type === "ONLINE" ? (
                        <>
                          <Video className="h-4 w-4 text-pharmako-primary shrink-0" />
                          <span>Telemedicina (Enlace en tu correo)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-pharmako-success shrink-0" />
                          <span>Consulta Presencial</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-pharmako-border-soft pt-4 mt-2">
              <p className="text-xs text-pharmako-text-secondary font-medium">
                Total de páginas: {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border-pharmako-border hover:bg-pharmako-background text-xs h-8 px-3 flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" />
                  Anterior
                </Button>
                <span className="text-xs font-semibold text-pharmako-primary bg-pharmako-primary-light px-3 py-1.5 rounded-lg border border-pharmako-primary-muted/20">
                  Pág. {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border-pharmako-border hover:bg-pharmako-background text-xs h-8 px-3 flex items-center gap-1"
                >
                  Siguiente
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
