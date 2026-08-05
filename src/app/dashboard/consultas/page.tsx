"use client";

import { useState, useTransition, useEffect } from "react";
import { usePatientConsultationsQuery } from "@/features/consultations/hooks/usePatientConsultationsQuery";
import { useAuthStore } from "@/store/auth";
import {
  Calendar,
  User,
  Activity,
  Heart,
  Thermometer,
  Waves,
  Mail,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pill,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ConsultationVitalSign {
  uuid: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  oxygen_sat?: number;
  date: string;
}

interface DetailedConsultation {
  id: string;
  uuid: string;
  date: string;
  status: string;
  reason: string;
  physical_exam?: string;
  diagnosis: string;
  treatment_plan?: string;
  dynamic_data?: Record<string, unknown>;
  user?: {
    full_name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    specialties?: { name: string }[];
  };
  clinicBranch?: {
    name?: string;
    address?: string;
  };
  vital_sign?: ConsultationVitalSign | null;
  prescription?: {
    uuid: string;
    public_token: string;
    status: string;
    items?: Array<{
      medication?: { name: string };
    }>;
  } | null;
}

const COMMON_SPECIALTIES = [
  "Medicina General",
  "Cardiología",
  "Pediatría",
  "Ginecología",
  "Traumatología",
  "Dermatología",
  "Oftalmología",
];

export default function PatientConsultationsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  // Estados de los filtros
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [specialtyVal, setSpecialtyVal] = useState("");

  // Debounce para el buscador de texto
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1); // Reiniciar a página 1 cuando cambia el filtro
    }, 350);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: paginatedData,
    isLoading,
    isError,
    isFetching,
  } = usePatientConsultationsQuery(page, debouncedSearch, specialtyVal);

  const consultations = Array.isArray(paginatedData?.data?.data)
    ? paginatedData.data.data
    : Array.isArray(paginatedData?.data)
    ? paginatedData.data
    : Array.isArray(paginatedData)
    ? paginatedData
    : [];
  const totalPages: number =
    paginatedData?.data?.last_page || paginatedData?.last_page || 1;

  const [selectedConsult, setSelectedConsult] =
    useState<DetailedConsultation | null>(null);
  const [detailedConsult, setDetailedConsult] =
    useState<DetailedConsultation | null>(null);

  // Sincronizar el estado del detalle en el macro-task
  useEffect(() => {
    if (!selectedConsult) {
      const t = setTimeout(() => setDetailedConsult(null), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDetailedConsult(selectedConsult), 0);
    return () => clearTimeout(t);
  }, [selectedConsult]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  const handleClearFilters = () => {
    setSearchVal("");
    setDebouncedSearch("");
    setSpecialtyVal("");
    setPage(1);
  };

  const hasActiveFilters = !!searchVal || !!specialtyVal;

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mis Consultas y Diagnósticos
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Accede al registro de tus consultas, diagnósticos SOAP y
          prescripciones.
        </p>
      </div>

      {/* Barra de Filtros (Buscador y Especialidad) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-pharmako-surface p-4 rounded-xl border border-pharmako-border-soft">
        {/* Buscador de Texto */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pharmako-text-muted" />
          <Input
            type="text"
            placeholder="Buscar por diagnóstico, síntoma o doctor..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 pr-8 bg-pharmako-surface border-pharmako-border focus:ring-pharmako-primary text-xs h-9 rounded-lg"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-pharmako-text-muted hover:text-pharmako-text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown de Especialidad */}
        <div className="w-full sm:w-56">
          <select
            value={specialtyVal}
            onChange={(e) => {
              setSpecialtyVal(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 rounded-lg border border-pharmako-border bg-pharmako-surface px-3 py-1 text-xs text-pharmako-text-primary outline-none focus:ring-1 focus:ring-pharmako-primary transition-all"
          >
            <option value="">Todas las especialidades</option>
            {COMMON_SPECIALTIES.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Botón para Limpiar */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="border-pharmako-border hover:bg-pharmako-background text-xs h-9 px-3 shrink-0 rounded-lg flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Contenedor Principal / Lista */}
      {isLoading || (isFetching && consultations.length === 0) || !user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 bg-pharmako-surface rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl p-6">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar las consultas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : consultations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8">
          <ClipboardList className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No se encontraron consultas registradas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            {hasActiveFilters
              ? "Prueba modificando los términos de búsqueda o especialidad seleccionada."
              : "Tus consultas y diagnósticos aparecerán aquí una vez que asistas a tu primera cita."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-4 border-pharmako-border hover:bg-pharmako-background text-xs h-8 px-3 rounded-lg"
            >
              Restablecer filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations.map((c: DetailedConsultation) => (
              <div
                key={c.uuid}
                onClick={() => setSelectedConsult(c)}
                className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                      <span className="text-xs text-pharmako-text-secondary font-medium">
                        Fecha:{" "}
                        {new Date(c.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-pharmako-text-primary truncate">
                      Dr.{" "}
                      {c.user?.full_name ||
                        c.user?.fullName ||
                        "Médico Especialista"}
                    </p>
                    <p className="text-xs text-pharmako-text-muted font-medium">
                      {c.user?.specialties?.[0]?.name || "Medicina General"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-pharmako-primary-light text-pharmako-text-secondary border border-pharmako-primary-muted/20 uppercase shrink-0">
                    Consulta
                  </span>
                </div>

                <div className="border-t border-pharmako-border-soft/60 pt-3 space-y-1.5 min-w-0">
                  <p className="text-xs font-semibold text-pharmako-text-muted">
                    Diagnóstico principal:
                  </p>
                  <p className="text-xs font-bold text-pharmako-text-primary truncate">
                    {c.diagnosis || "Evaluación General"}
                  </p>
                  {c.reason && (
                    <p className="text-[11px] text-pharmako-text-secondary line-clamp-2 leading-relaxed italic">
                      &quot;{c.reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="pt-4 mt-4">
              <Pagination
                currentPage={page}
                lastPage={totalPages}
                total={paginatedData?.data?.total || paginatedData?.total || 0}
                perPage={paginatedData?.data?.per_page || paginatedData?.per_page || 10}
                from={paginatedData?.data?.from || paginatedData?.from || null}
                to={paginatedData?.data?.to || paginatedData?.to || null}
                onPageChange={handlePageChange}
                variant="care"
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalles de Consulta (luca-design) */}
      <Dialog
        open={!!selectedConsult}
        onOpenChange={(open) => !open && setSelectedConsult(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-2xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailedConsult && (
            <>
              <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-pharmako-border-soft">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary">
                    Expediente de la Consulta Médica
                  </DialogTitle>
                  <span className="text-xs text-pharmako-text-secondary font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                    {new Date(detailedConsult.date).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </DialogHeader>

              {/* Grid Layout de 2 Columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Columna Izquierda: SOAP Clínico */}
                <div className="space-y-4">
                  {/* Diagnóstico */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Diagnóstico
                    </h4>
                    <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-care/20 bg-pharmako-care-light/5 text-xs font-bold text-pharmako-text-primary leading-relaxed shadow-2xs">
                      {detailedConsult.diagnosis || "Evaluación General"}
                    </div>
                  </div>

                  {/* Plan de Tratamiento */}
                  {detailedConsult.treatment_plan && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Plan de Tratamiento
                      </h4>
                      <div className="p-3.5 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed space-y-1.5">
                        <span className="font-bold text-pharmako-text-primary block">
                          Indicaciones del médico:
                        </span>
                        <p className="whitespace-pre-line">
                          {detailedConsult.treatment_plan}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Motivo de Consulta */}
                  {detailedConsult.reason && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Motivo de Consulta
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedConsult.reason}
                      </div>
                    </div>
                  )}

                  {/* Examen Físico */}
                  {detailedConsult.physical_exam && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Hallazgos del Examen Físico
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedConsult.physical_exam}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Médico, Signos Vitales y Receta */}
                <div className="space-y-4">
                  {/* Médico */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Médico Tratante
                    </h4>
                    <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft flex items-start gap-3 shadow-xs">
                      <div className="p-2 bg-pharmako-primary-light rounded-xl border border-pharmako-primary-muted/10 shrink-0">
                        <User className="h-5 w-5 text-pharmako-care" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-pharmako-text-primary">
                          Dr.{" "}
                          {detailedConsult.user?.full_name ||
                            detailedConsult.user?.fullName ||
                            "Médico Especialista"}
                        </p>
                        <p className="text-xs text-pharmako-text-secondary font-medium mt-0.5">
                          {detailedConsult.user?.specialties?.[0]?.name ||
                            "Medicina General"}
                        </p>

                        <div className="mt-3 space-y-1.5 border-t border-pharmako-border-soft/60 pt-2.5 text-xs text-pharmako-text-secondary">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span className="truncate">
                              {detailedConsult.user?.email ||
                                "contacto@lucahealth.com"}
                            </span>
                          </div>
                          {detailedConsult.user?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-pharmako-text-muted" />
                              <span>{detailedConsult.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signos Vitales de la Consulta */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Signos Vitales Asentados
                    </h4>
                    {detailedConsult.vital_sign ? (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Presión */}
                        {detailedConsult.vital_sign.systolic_bp && (
                          <div className="p-3 bg-pharmako-surface border border-pharmako-border-soft rounded-xl flex items-center gap-2.5">
                            <Activity className="h-4 w-4 text-pharmako-care shrink-0" />
                            <div>
                              <span className="text-[10px] text-pharmako-text-muted block">
                                Presión
                              </span>
                              <span className="text-xs font-bold text-pharmako-text-primary">
                                {detailedConsult.vital_sign.systolic_bp}/
                                {detailedConsult.vital_sign.diastolic_bp} mmHg
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Frecuencia Cardíaca */}
                        {detailedConsult.vital_sign.heart_rate && (
                          <div className="p-3 bg-pharmako-surface border border-pharmako-border-soft rounded-xl flex items-center gap-2.5">
                            <Heart className="h-4 w-4 text-pharmako-care shrink-0" />
                            <div>
                              <span className="text-[10px] text-pharmako-text-muted block">
                                Pulsaciones
                              </span>
                              <span className="text-xs font-bold text-pharmako-text-primary">
                                {detailedConsult.vital_sign.heart_rate} bpm
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Temperatura */}
                        {detailedConsult.vital_sign.temperature && (
                          <div className="p-3 bg-pharmako-surface border border-pharmako-border-soft rounded-xl flex items-center gap-2.5">
                            <Thermometer className="h-4 w-4 text-pharmako-care shrink-0" />
                            <div>
                              <span className="text-[10px] text-pharmako-text-muted block">
                                Temperatura
                              </span>
                              <span className="text-xs font-bold text-pharmako-text-primary">
                                {detailedConsult.vital_sign.temperature} °C
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Oxígeno */}
                        {detailedConsult.vital_sign.oxygen_sat && (
                          <div className="p-3 bg-pharmako-surface border border-pharmako-border-soft rounded-xl flex items-center gap-2.5">
                            <Waves className="h-4 w-4 text-pharmako-care shrink-0" />
                            <div>
                              <span className="text-[10px] text-pharmako-text-muted block">
                                Saturación
                              </span>
                              <span className="text-xs font-bold text-pharmako-text-primary">
                                {detailedConsult.vital_sign.oxygen_sat} %
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-center text-xs text-pharmako-text-muted">
                        No se asentaron signos vitales en esta visita.
                      </div>
                    )}
                  </div>

                  {/* Receta Médica Asociada */}
                  {detailedConsult.prescription && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Receta Asociada
                      </h4>
                      <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft space-y-2.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-pharmako-text-primary">
                          <Pill className="h-4 w-4 text-pharmako-care shrink-0" />
                          <span>Receta Electrónica</span>
                        </div>
                        <p className="text-[11px] text-pharmako-text-secondary leading-relaxed">
                          Esta consulta incluye una receta de medicamentos.
                          Podés consultar las posologías completas y respuestas
                          de farmacia en la sección dedicada.
                        </p>
                        <div className="pt-1">
                          <Link
                            href="/dashboard/recetas"
                            onClick={() => setSelectedConsult(null)}
                            className="inline-flex items-center gap-1.5 text-xs text-pharmako-primary hover:text-pharmako-primary-hover font-semibold transition-colors"
                          >
                            Ir a mis recetas
                            <ClipboardList className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-pharmako-border-soft pt-4 flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConsult(null)}
                  className="border-pharmako-border text-pharmako-text-primary hover:bg-pharmako-background rounded-lg font-medium"
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
