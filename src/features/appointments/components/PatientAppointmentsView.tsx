"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { usePatientAppointmentsQuery } from "@/features/appointments/hooks/usePatientAppointmentsQuery";
import { appointmentApi } from "@/features/appointments/api/appointmentApi";
import { useAuthStore } from "@/store/auth";
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
  Mail,
  Phone,
  Building,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type TabType = "all" | "upcoming" | "past" | "cancelled";

interface DetailedAppointment {
  uuid: string;
  patientUuid: string;
  doctorUuid: string;
  clinicBranchUuid: string;
  date: string;
  time: string;
  type: "IN_PERSON" | "ONLINE";
  status: string;
  notes?: string;
  reason?: string;
  doctor?: {
    full_name?: string;
    fullName?: string;
    specialties?: { name: string }[];
    email?: string;
    phone?: string;
  };
  clinic_branch?: {
    name?: string;
    address?: string;
    phone?: string;
  };
}

export function PatientAppointmentsView() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [, startTransition] = useTransition();

  const {
    data: paginatedData,
    isLoading,
    isError,
    isFetching,
  } = usePatientAppointmentsQuery(page, activeTab);

  const appointments = paginatedData?.data || [];
  const totalPages: number = paginatedData?.last_page || 1;

  const [selectedApt, setSelectedApt] = useState<DetailedAppointment | null>(
    null,
  );
  const [detailedApt, setDetailedApt] = useState<DetailedAppointment | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedApt) {
      const t = setTimeout(() => setDetailedApt(null), 0);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => {
      setDetailedApt(selectedApt);

      const isOnline = typeof window !== "undefined" && navigator.onLine;
      if (!isOnline) return;

      setIsLoadingDetail(true);
      appointmentApi
        .getPatientAppointmentDetail(selectedApt.uuid)
        .then((res: unknown) => {
          const typedRes = res as { data?: DetailedAppointment };
          if (typedRes?.data) {
            setDetailedApt(typedRes.data);
          }
        })
        .catch((err) => {
          console.warn(
            "[PatientAppointmentsPage] Error fetching details:",
            err,
          );
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    }, 0);

    return () => {
      clearTimeout(t1);
    };
  }, [selectedApt]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  // luca-design §2 — paleta unificada en `pharmako-care` (teal) para esta vista de paciente.
  // Decisión del proyecto: las vistas de paciente usan Care como acento de acción,
  // no Primary. Mantener Primary para Doctor (ver DoctorAppointmentsView).
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendiente",
        className:
          "bg-pharmako-warning-light text-pharmako-warning border-pharmako-warning/20",
      },
      confirmed: {
        label: "Confirmada",
        className:
          "bg-pharmako-success-light text-pharmako-success border-pharmako-success/20",
      },
      completed: {
        label: "Completada",
        className:
          "bg-pharmako-canvas text-pharmako-text-secondary border-pharmako-border",
      },
      cancelled: {
        label: "Cancelada",
        className:
          "bg-pharmako-danger-light text-pharmako-danger border-pharmako-danger/20",
      },
      no_show: {
        label: "No Asistió",
        className:
          "bg-pharmako-danger-light text-pharmako-danger border-pharmako-danger/20",
      },
    };

    const config = statusMap[status] || {
      label: status,
      className:
        "bg-pharmako-canvas text-pharmako-text-secondary border-pharmako-border",
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
          <Button className="bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold rounded-lg text-sm h-10 px-5 flex items-center gap-2 transition-all">
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
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200",
              activeTab === tab
                ? "border-pharmako-care text-pharmako-care"
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
      {isLoading || (isFetching && appointments.length === 0) || !user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-pharmako-background rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl p-6">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar las citas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8">
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
                className="bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold rounded-lg px-4"
              >
                Agendar primera cita
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => {
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
                  onClick={() => setSelectedApt(apt)}
                  className={cn(
                    "bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 cursor-pointer",
                    "hover:bg-pharmako-canvas transition-all duration-200 flex flex-col justify-between gap-4",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl shrink-0">
                        <User className="h-6 w-6 text-pharmako-care" />
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
                          <Video className="h-4 w-4 text-pharmako-care shrink-0" />
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
                <span className="text-xs font-semibold text-pharmako-care bg-pharmako-care-light px-3 py-1.5 rounded-lg border border-pharmako-care/20">
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

      {/* Modal de Detalles de Cita (luca-design) */}
      <Dialog
        open={!!selectedApt}
        onOpenChange={(open) => !open && setSelectedApt(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-2xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailedApt && (
            <>
              <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-pharmako-border-soft">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary flex items-center gap-2">
                    Detalles de la Cita Médica
                    {getStatusBadge(detailedApt.status)}
                    {isLoadingDetail && (
                      <span className="text-[10px] font-normal text-pharmako-text-muted animate-pulse">
                        (Cargando...)
                      </span>
                    )}
                  </DialogTitle>
                </div>
              </DialogHeader>

              {/* Grid Layout de 2 Columnas */}
              <div className="gap-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Columna Izquierda: Información de la Consulta */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Información de la Consulta
                    </h4>
                    <div className="p-4 border-b border-pharmako-border-soft space-y-3">
                      <div className="flex items-center gap-2.5 text-sm text-pharmako-text-secondary">
                        <Calendar className="h-4 w-4 text-pharmako-care shrink-0" />
                        <span className="capitalize">
                          {new Date(detailedApt.date).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-pharmako-text-secondary">
                        <Clock className="h-4 w-4 text-pharmako-care shrink-0" />
                        <span>{detailedApt.time.slice(0, 5)} HS</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-medium text-pharmako-text-primary border-t border-pharmako-border-soft/60 pt-2.5">
                        {detailedApt.type === "ONLINE" ? (
                          <>
                            <Video className="h-4 w-4 text-pharmako-care shrink-0" />
                            <span>Consulta Virtual / Telemedicina</span>
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

                  {detailedApt.reason && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Motivo de Consulta
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedApt.reason}
                      </div>
                    </div>
                  )}

                  {detailedApt.notes && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Notas del Paciente
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedApt.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Médico y Clínica */}
                <div className="space-y-4">
                  {/* Sección Médico */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Médico Especialista
                    </h4>
                    <div className="p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl shrink-0">
                        <User className="h-5 w-5 text-pharmako-care" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-pharmako-text-primary">
                          {detailedApt.doctor?.full_name ||
                            detailedApt.doctor?.fullName ||
                            "Médico Especialista"}
                        </p>
                        <p className="text-xs text-pharmako-text-secondary font-medium mt-0.5">
                          {detailedApt.doctor?.specialties?.[0]?.name ||
                            "Medicina General"}
                        </p>

                        <div className="mt-3 space-y-1.5 border-t border-pharmako-border-soft/60 pt-2.5 text-xs text-pharmako-text-secondary">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span className="truncate">
                              {detailedApt.doctor?.email ||
                                "contacto@lucahealth.com"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span>
                              {detailedApt.doctor?.phone ||
                                "+54 9 11 5555-5555"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección Clínica */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Sede de Atención
                    </h4>
                    <div className="p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl shrink-0">
                        <Building className="h-5 w-5 text-pharmako-care" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-pharmako-text-primary">
                          {detailedApt.clinic_branch?.name ||
                            "Sede Principal LUCA"}
                        </p>
                        <div className="mt-2.5 space-y-2 text-xs text-pharmako-text-secondary">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-pharmako-text-muted mt-0.5 shrink-0" />
                            <span className="leading-relaxed">
                              {detailedApt.clinic_branch?.address ||
                                "Av. Principal 1230, CABA"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span>
                              {detailedApt.clinic_branch?.phone ||
                                "+54 11 4444-4444"}
                            </span>
                          </div>

                          {/* Ayuda de Navegación Google Maps */}
                          {detailedApt.type !== "ONLINE" &&
                            detailedApt.clinic_branch?.address && (
                              <div className="pt-1.5 border-t border-pharmako-border-soft/60">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    (detailedApt.clinic_branch?.name ||
                                      "Sede Clínica") +
                                      " " +
                                      detailedApt.clinic_branch.address,
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-pharmako-care hover:text-pharmako-care-hover font-semibold transition-colors"
                                >
                                  <MapPin className="h-3.5 w-3.5 text-pharmako-care shrink-0" />
                                  Cómo llegar (Google Maps)
                                </a>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-pharmako-surface border-t border-pharmako-border-soft pt-4 flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApt(null)}
                  className="bg-pharmako-danger-light border-pharmako-danger/20 text-pharmako-danger hover:bg-pharmako-danger-light hover:text-pharmako-danger rounded-lg font-medium"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
