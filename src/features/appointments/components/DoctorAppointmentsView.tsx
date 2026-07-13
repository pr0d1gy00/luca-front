"use client";

import { useState, useTransition, useEffect } from "react";
import { useDoctorAppointmentsQuery } from "../hooks/useDoctorAppointmentsQuery";
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
  Search,
  Building,
  Mail,
  Phone,
  FileText,
  UserCheck,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { ScheduleFollowUpModal } from "@/features/consultations/components/ScheduleFollowUpModal";

type TimeframeType = "today" | "upcoming" | "past";

const resolveSmokingLabel = (status: string) => {
  const map: Record<string, string> = {
    NEVER: "No fuma",
    SMOKER: "Fumador activo",
    FORMER: "Exfumador",
  };
  return map[status] || status || "No fumador";
};

const resolveAlcoholLabel = (status: string) => {
  const map: Record<string, string> = {
    NEVER: "No bebe",
    SOCIAL: "Bebedor social",
    HEAVY: "Consumo frecuente",
  };
  return map[status] || status || "No bebe";
};

const formatDateCompact = (dateStr: string) => {
  if (!dateStr) return "—";
  try {
    // Tomar solo la parte de la fecha (AAAA-MM-DD) y separar por componentes
    const cleanDateStr = dateStr.split("T")[0];
    const parts = cleanDateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // mes en JS es 0-indexed
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

interface AppointmentRecord {
  id: string;
  uuid: string;
  patientUuid: string;
  doctorUuid: string;
  clinicBranchUuid: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
  reason?: string;
  patient?: {
    first_name: string;
    last_name: string;
    national_id: string;
    phone: string;
    email: string;
  };
  clinic_branch?: {
    name: string;
    address: string;
    phone: string;
  };
}

export function DoctorAppointmentsView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [timeframe, setTimeframe] = useState<TimeframeType>("today");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedApt, setSelectedApt] = useState<AppointmentRecord | null>(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Debouncing de 350ms para búsqueda multicampo
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: paginatedData,
    isLoading,
    isError,
    isFetching,
  } = useDoctorAppointmentsQuery(page, timeframe, statusFilter, debouncedSearch);

  const appointments: AppointmentRecord[] = (paginatedData?.data || []) as AppointmentRecord[];
  const totalPages: number = paginatedData?.last_page || 1;

  // Auto-seleccionar la primera cita de la lista al cambiar de pestaña si existe
  useEffect(() => {
    if (appointments.length > 0) {
      setSelectedApt(appointments[0]);
    } else {
      setSelectedApt(null);
    }
  }, [appointments]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  // luca-design §2 — tokens semánticos: success / warning / care / danger / canvas.
  // Decisión del proyecto: las vistas de Doctor y Patient usan `pharmako-care`
  // (teal) como acento de acción en este proyecto, no `pharmako-primary`.
  // `pharmako-primary` (azul) queda reservado para Pharmacy/Medications u otros
  // flujos que lo requieran explícitamente.
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: "En espera",
        className:
          "bg-pharmako-canvas text-pharmako-text-secondary border-pharmako-border",
      },
      confirmed: {
        label: "Confirmada",
        className:
          "bg-pharmako-warning-light text-pharmako-warning border-pharmako-warning",
      },
      "in-progress": {
        label: "En curso",
        className:
          "bg-pharmako-care-light text-pharmako-care border-pharmako-care",
      },
      in_room: {
        label: "En curso",
        className:
          "bg-pharmako-care-light text-pharmako-care border-pharmako-care",
      },
      completed: {
        label: "Atendido",
        className:
          "bg-pharmako-success-light text-pharmako-success border-pharmako-success",
      },
      cancelled: {
        label: "Cancelada",
        className:
          "bg-pharmako-danger-light text-pharmako-danger border-pharmako-danger",
      },
    };

    const config = statusMap[status.toLowerCase()] || {
      label: status,
      className:
        "bg-pharmako-canvas text-pharmako-text-secondary border-pharmako-border",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border",
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Agenda de Citas Médicas
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Gestioná tus pacientes citados, visualizá sus expedientes e iniciá las consultas clínicas.
        </p>
      </div>

      {/* Controles de Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pestañas Temporales */}
        <div className="flex items-center gap-1.5 p-1 self-start">
          {(["today", "upcoming", "past"] as TimeframeType[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setStatusFilter("");
                setPage(1);
              }}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                timeframe === tf
                  ? " text-pharmako-care border-b border-pharmako-care "
                  : "text-pharmako-text-muted hover:text-pharmako-text-secondary"
              )}
            >
              {tf === "today" && "Agenda de Hoy"}
              {tf === "upcoming" && "Próximas Citas"}
              {tf === "past" && "Historial / Pasadas"}
            </button>
          ))}
        </div>

        {/* Buscador y Estado */}
        <div className="flex flex-1 items-center gap-3 max-w-lg justify-end w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-pharmako-text-muted" />
            <input
              type="text"
              placeholder="Buscar por paciente, cédula, teléfono..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-pharmako-border focus:outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 focus:bg-pharmako-surface transition-all placeholder:text-pharmako-text-muted"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-pharmako-border focus:outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 text-pharmako-text-secondary font-medium"
          >
            <option value="">Todos los estados</option>
            {timeframe === "today" && (
              <>
                <option value="pending">En espera</option>
                <option value="in-progress">En curso</option>
                <option value="completed">Atendido</option>
                <option value="cancelled">Cancelada</option>
              </>
            )}
            {timeframe === "upcoming" && (
              <>
                <option value="pending">En espera</option>
                <option value="confirmed">Confirmada</option>
              </>
            )}
            {timeframe === "past" && (
              <>
                <option value="completed">Atendido</option>
                <option value="cancelled">Cancelada</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Listado */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {isLoading || (isFetching && appointments.length === 0) ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-pharmako-surface border border-pharmako-border-soft rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface border border-pharmako-border-soft rounded-xl p-6">
              <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
              <p className="text-sm font-bold text-pharmako-text-primary">Error al cargar la agenda</p>
              <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
                No pudimos conectar con el servidor. Revisá tu conexión de red o continuá trabajando sin conexión.
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface border border-pharmako-border-soft rounded-xl p-8">
              <Calendar className="h-12 w-12 text-pharmako-text-muted mb-4" />
              <p className="text-sm font-bold text-pharmako-text-primary">No se encontraron citas</p>
              <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
                No hay registros que coincidan con los filtros seleccionados para este período.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                {appointments.map((apt) => {
                  const patientName = apt.patient
                    ? `${apt.patient.first_name} ${apt.patient.last_name}`
                    : "Paciente";
                  const clinicName = apt.clinic_branch?.name || "Sede Principal";
                  const isSelected = selectedApt?.uuid === apt.uuid;

                  return (
                    <div
                      key={apt.uuid}
                      onClick={() => setSelectedApt(apt)}
                      className={cn(
                        "bg-pharmako-surface rounded-xl border p-5 cursor-pointer transition-all duration-200",
                        isSelected
                          ? "border-pharmako-care ring-1 ring-pharmako-care/20"
                          : "border-pharmako-border-soft hover:border-pharmako-border hover:bg-pharmako-canvas/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0",
                            isSelected
                              ? "text-pharmako-care"
                              : "bg-pharmako-canvas text-pharmako-text-muted"
                          )}>
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-pharmako-text-primary truncate max-w-[200px] sm:max-w-xs">
                              {patientName}
                            </h3>
                            <p className="text-[11px] text-pharmako-text-muted font-medium mt-0.5">
                              ID: {apt.patient?.national_id || "—"}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-pharmako-text-secondary border-t border-pharmako-border-soft pt-3.5 mt-3.5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-pharmako-text-muted shrink-0" />
                          <span className="font-semibold text-pharmako-text-primary tabular-nums">
                            {apt.time.slice(0, 5)} HS
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-pharmako-text-muted shrink-0" />
                          <span>{formatDateCompact(apt.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-pharmako-text-muted shrink-0" />
                          <span className="truncate">{clinicName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-pharmako-border-soft pt-4 mt-2">
                  <p className="text-sm text-pharmako-text-muted font-medium">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="rounded-lg border-pharmako-border text-sm h-8 px-3 flex items-center gap-1"
                    >
                      <ChevronLeft className="size-3.5" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="rounded-lg border-pharmako-border text-sm h-8 px-3 flex items-center gap-1"
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

        {/* Columna Derecha: Detalle Lateral */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedApt ? (
              <motion.div
                key={selectedApt.uuid}
                variants={fadeUpVariant}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-pharmako-surface border border-pharmako-border-soft rounded-xl p-5 space-y-5 sticky top-6"
              >
                {/* Header del Paciente */}
                <div className="pb-4 border-b border-pharmako-border-soft">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6 text-pharmako-care" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-pharmako-text-primary leading-tight truncate">
                        {selectedApt.patient
                          ? `${selectedApt.patient.first_name} ${selectedApt.patient.last_name}`
                          : "Paciente"}
                      </h3>
                      <span className="text-[11px] font-semibold text-pharmako-text-muted uppercase tracking-wide">
                        Expediente Clínico
                      </span>
                    </div>
                  </div>
                </div>

                {/* Datos de Contacto e Identidad */}
                <div className="space-y-2.5 text-sm text-pharmako-text-secondary">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                    <span>Cédula/DNI: <strong>{selectedApt.patient?.national_id || "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                    <span>Teléfono: {selectedApt.patient?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                    <span className="truncate">Correo: {selectedApt.patient?.email || "—"}</span>
                  </div>
                  
                  {/* Alertas Clínicas Rápidas */}
                  {(selectedApt.patient as any)?.clinical_summary && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {((selectedApt.patient as any).clinical_summary.allergies) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Alergia: {(selectedApt.patient as any).clinical_summary.allergies}
                        </span>
                      )}
                      {((selectedApt.patient as any).clinical_summary.chronic_conditions) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          Crónica: {(selectedApt.patient as any).clinical_summary.chronic_conditions}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Resumen Clínico Pre-Consulta */}
                {(selectedApt.patient as any)?.clinical_summary && (
                  <div className="space-y-4 border-t border-pharmako-border-soft pt-4 text-xs">
                    {/* Antecedentes y Hábitos */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-pharmako-text-muted">
                        Antecedentes y Hábitos
                      </h4>
                      <div className="space-y-1.5 text-pharmako-text-secondary font-medium pl-1">
                        {(selectedApt.patient as any).clinical_summary.lifestyle && (
                          <p className="flex items-center gap-1.5">
                            <span className="inline-block size-1 bg-slate-400 rounded-full" />
                            <span>
                              {resolveSmokingLabel((selectedApt.patient as any).clinical_summary.lifestyle.smoking_status)}
                              {" • "}
                              {resolveAlcoholLabel((selectedApt.patient as any).clinical_summary.lifestyle.alcohol_consumption)}
                            </span>
                          </p>
                        )}
                        {(selectedApt.patient as any).clinical_summary.surgical_history?.length > 0 && (
                          <p className="flex items-start gap-1.5">
                            <span className="inline-block size-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                            <span>Quirúrgicos: {(selectedApt.patient as any).clinical_summary.surgical_history.join(", ")}</span>
                          </p>
                        )}
                        {(selectedApt.patient as any).clinical_summary.family_history?.length > 0 && (
                          <p className="flex items-start gap-1.5">
                            <span className="inline-block size-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                            <span>Familiares: {(selectedApt.patient as any).clinical_summary.family_history.join(", ")}</span>
                          </p>
                        )}
                        {!(selectedApt.patient as any).clinical_summary.lifestyle &&
                          (selectedApt.patient as any).clinical_summary.surgical_history?.length === 0 &&
                          (selectedApt.patient as any).clinical_summary.family_history?.length === 0 && (
                            <span className="text-pharmako-text-muted italic">Sin antecedentes registrados</span>
                        )}
                      </div>
                    </div>

                    {/* Medicamentos Activos */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-pharmako-text-muted">
                        Medicamentos Activos
                      </h4>
                      <div className="space-y-1.5 text-pharmako-text-secondary font-medium pl-1">
                        {(selectedApt.patient as any).clinical_summary.active_medications?.length > 0 ? (
                          (selectedApt.patient as any).clinical_summary.active_medications.map((med: string, idx: number) => (
                            <p key={idx} className="flex items-start gap-1.5">
                              <span className="inline-block size-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                              <span>{med}</span>
                            </p>
                          ))
                        ) : (
                          <span className="text-pharmako-text-muted italic">Sin medicamentos activos en receta</span>
                        )}
                      </div>
                    </div>

                    {/* Historial Clínico Reciente */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-pharmako-text-muted">
                        Últimas Consultas
                      </h4>
                      <div className="space-y-2">
                        {(selectedApt.patient as any).clinical_summary.recent_history?.length > 0 ? (
                          (selectedApt.patient as any).clinical_summary.recent_history.map((c: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-pharmako-canvas rounded-lg border border-pharmako-border-soft space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-pharmako-text-muted font-semibold">
                                <span>{formatDateCompact(c.date)}</span>
                                <span className="max-w-[120px] truncate">{c.doctor_name}</span>
                              </div>
                              <p className="text-[11px] font-bold text-pharmako-text-primary leading-tight">
                                {c.diagnosis}
                              </p>
                              {c.reason && (
                                <p className="text-[10px] text-pharmako-text-secondary italic truncate">
                                  Motivo: {c.reason}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-pharmako-text-muted italic">Sin consultas previas registradas</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivo de Consulta y Notas */}
                <div className="space-y-3.5 border-t border-pharmako-border-soft pt-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-pharmako-text-muted flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-pharmako-text-muted" />
                      Motivo de Consulta
                    </h4>
                    <div className="p-3 bg-pharmako-canvas rounded-lg border border-pharmako-border-soft text-sm text-pharmako-text-secondary leading-relaxed font-medium">
                      {selectedApt.reason || "Consulta de control rutinario."}
                    </div>
                  </div>

                  {selectedApt.notes && (
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-pharmako-text-muted">
                        Notas del Paciente
                      </h4>
                      <div className="p-3 bg-pharmako-canvas rounded-lg border border-pharmako-border-soft text-sm text-pharmako-text-secondary leading-relaxed">
                        {selectedApt.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tipo de Consulta */}
                <div className="space-y-3 border-t border-pharmako-border-soft pt-4 text-sm text-pharmako-text-secondary">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-pharmako-text-muted shrink-0" />
                    <span>Sede: <strong>{selectedApt.clinic_branch?.name || "Sede Principal"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApt.type === "ONLINE" ? (
                      <>
                        <Video className="h-4 w-4 text-pharmako-care shrink-0" />
                        <span className="font-semibold text-pharmako-care">Consulta Virtual (Telemedicina)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-pharmako-success shrink-0" />
                        <span className="font-semibold text-pharmako-success">Consulta Presencial</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Botón de Acción Principal */}
                <div className="pt-4 border-t border-pharmako-border-soft">
                  {selectedApt.status.toLowerCase() === "completed" ? (
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        onClick={() => router.push(`/dashboard/consultations/${selectedApt.uuid}`)}
                        className="w-full bg-pharmako-canvas hover:bg-pharmako-border-soft text-pharmako-text-primary font-semibold rounded-lg text-sm h-9 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver Consulta Atendida
                      </Button>
                      <Button
                        onClick={() => setIsFollowUpOpen(true)}
                        className="w-full bg-teal-650 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm h-9 transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Agendar Seguimiento
                      </Button>
                    </div>
                  ) : selectedApt.status.toLowerCase() === "cancelled" ? (
                    <Button
                      disabled
                      className="w-full bg-pharmako-danger-light border-pharmako-danger/30 text-pharmako-danger font-semibold rounded-lg text-sm h-9 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cita Cancelada
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(`/dashboard/consultations/${selectedApt.uuid}`)}
                      className="w-full bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold rounded-lg text-sm h-11 transition-colors flex items-center justify-center gap-2"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Iniciar Consulta Clínica
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-pharmako-surface border border-pharmako-border-soft rounded-xl p-8 text-center text-pharmako-text-muted space-y-2 sticky top-6 min-h-[250px] flex flex-col items-center justify-center">
                <User className="h-8 w-8 text-pharmako-text-muted" />
                <p className="text-sm font-semibold text-pharmako-text-muted uppercase tracking-wider">
                  Detalle del Paciente
                </p>
                <p className="text-[11px] text-pharmako-text-secondary max-w-[180px] mx-auto">
                  Seleccioná cualquier cita de la lista para visualizar su expediente clínico.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {selectedApt && (
        <ScheduleFollowUpModal
          isOpen={isFollowUpOpen}
          onClose={() => setIsFollowUpOpen(false)}
          patientUuid={selectedApt.patientUuid}
          consultationUuid={selectedApt.uuid}
        />
      )}
    </div>
  );
}
