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
        className: "bg-teal-50 text-teal-700 border-teal-100",
      },
      CONFIRMED: {
        label: "Confirmada",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      COMPLETED: {
        label: "Completada",
        className: "bg-slate-50 text-slate-700 border-slate-200",
      },
      CANCELLED: {
        label: "Cancelada",
        className: "bg-red-50 text-red-700 border-red-100",
      },
      NO_SHOW: {
        label: "No Asistió",
        className: "bg-amber-50 text-amber-700 border-amber-100",
      },
    };

    const config = statusMap[status] || {
      label: status,
      className: "bg-slate-50 text-slate-700 border-slate-200",
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mis Citas Médicas
          </h1>
          <p className="text-sm text-slate-500">
            Visualiza tu historial completo de citas programadas, pasadas y
            canceladas.
          </p>
        </div>
        <Link href="/dashboard/booking">
          <Button className="bg-[#23dce1] hover:bg-[#23dce1]/95 text-white font-semibold rounded-xl text-sm h-10 px-5 flex items-center gap-2 transition-all shadow-sm">
            <Plus className="size-4" />
            Nueva Cita
          </Button>
        </Link>
      </div>

      {/* Selector de Pestañas (Filtros) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {(["all", "upcoming", "past", "cancelled"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200",
              activeTab === tab
                ? "border-[#23dce1] text-[#23dce1]"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300",
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
              className="h-40 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-base font-bold text-slate-900">
            Error al cargar las citas
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : filteredApts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-100 shadow-sm p-8">
          <Calendar className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-800">
            No se encontraron citas
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
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
                className="bg-[#23dce1] hover:bg-[#23dce1]/90 text-white font-semibold rounded-xl px-4"
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
                    "bg-white rounded-xl border border-slate-100 p-5 shadow-sm",
                    "hover:shadow-md transition-shadow duration-200 flex flex-col justify-between gap-4",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-100 shrink-0">
                        <User className="h-5 w-5 text-[#23dce1]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {doctorName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {specialtyLabel}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="capitalize">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{apt.time.slice(0, 5)} HS</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{clinicName}</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-slate-800">
                      {apt.type === "ONLINE" ? (
                        <>
                          <Video className="h-4 w-4 text-[#23dce1] shrink-0" />
                          <span>Telemedicina (Enlace en tu correo)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
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
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <p className="text-xs text-slate-500 font-medium">
                Total de páginas: {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-xl border-slate-200 hover:bg-slate-50 text-xs h-8 px-3 flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" />
                  Anterior
                </Button>
                <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                  Pág. {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-xl border-slate-200 hover:bg-slate-50 text-xs h-8 px-3 flex items-center gap-1"
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
