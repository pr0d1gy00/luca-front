"use client";

import { useState, useTransition, useEffect } from "react";
import { usePatientLabResultsQuery } from "@/features/labs/hooks/usePatientLabResultsQuery";
import { useAuthStore } from "@/store/auth";
import {
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  X,
  FileDown,
  Activity,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LabRequestDetail {
  uuid: string;
  exams_list?: string[];
  instructions?: string;
  is_completed?: boolean;
}

interface DetailedLabResult {
  id: string;
  uuid: string;
  file_url: string;
  result_json: Record<string, unknown>;
  notes: string;
  status: "PENDING" | "COMPLETED" | "ABNORMAL" | "CANCELLED";
  performed_at: string;
  reviewed_at: string | null;
  reviewed_by?: {
    full_name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    specialties?: { name: string }[];
  } | null;
  lab_request?: LabRequestDetail | null;
}

export default function PatientLabResultsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  // Estados de los filtros
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusVal, setStatusVal] = useState("");

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
  } = usePatientLabResultsQuery(page, debouncedSearch, statusVal);

  const results = Array.isArray(paginatedData?.data?.data)
    ? paginatedData.data.data
    : Array.isArray(paginatedData?.data)
    ? paginatedData.data
    : Array.isArray(paginatedData)
    ? paginatedData
    : [];
  const totalPages: number =
    paginatedData?.data?.last_page || paginatedData?.last_page || 1;

  const [selectedResult, setSelectedResult] =
    useState<DetailedLabResult | null>(null);
  const [detailedResult, setDetailedResult] =
    useState<DetailedLabResult | null>(null);

  // Sincronizar el estado del detalle en el macro-task
  useEffect(() => {
    if (!selectedResult) {
      const t = setTimeout(() => setDetailedResult(null), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDetailedResult(selectedResult), 0);
    return () => clearTimeout(t);
  }, [selectedResult]);

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
    setStatusVal("");
    setPage(1);
  };

  const hasActiveFilters = !!searchVal || !!statusVal;

  // Formateador de Badges de Estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-pharmako-success-light text-pharmako-success border border-pharmako-success/10 uppercase shrink-0">
            Completado
          </span>
        );
      case "ABNORMAL":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 uppercase shrink-0">
            Anormal
          </span>
        );
      case "PENDING":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 uppercase shrink-0">
            Pendiente
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 uppercase shrink-0">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 uppercase shrink-0">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mis Estudios y Resultados de Laboratorio
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Consulta los reportes médicos, descargá los PDFs de tus análisis y
          visualiza las observaciones.
        </p>
      </div>

      {/* Barra de Filtros (Buscador y Estado) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-pharmako-surface p-4 rounded-xl border border-pharmako-border-soft">
        {/* Buscador de Texto */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pharmako-text-muted" />
          <Input
            type="text"
            placeholder="Buscar por tipo de examen o observaciones..."
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

        {/* Dropdown de Estado */}
        <div className="w-full sm:w-56">
          <select
            value={statusVal}
            onChange={(e) => {
              setStatusVal(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 rounded-lg border border-pharmako-border bg-pharmako-surface px-3 py-1 text-xs text-pharmako-text-primary outline-none focus:ring-1 focus:ring-pharmako-primary transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="COMPLETED">Completado</option>
            <option value="PENDING">Pendiente</option>
            <option value="ABNORMAL">Anormal / Alerta</option>
            <option value="CANCELLED">Cancelado</option>
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
      {isLoading || (isFetching && results.length === 0) || !user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-pharmako-surface rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl p-6">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar los estudios
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8">
          <ClipboardList className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No se encontraron resultados
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            {hasActiveFilters
              ? "Prueba modificando la búsqueda o el filtro de estado."
              : "Tus reportes y análisis de laboratorio aparecerán aquí una vez que estén listos."}
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
            {results.map((r: DetailedLabResult) => {
              const examsList = r.lab_request?.exams_list || [];
              const titleText =
                examsList.length > 0
                  ? examsList.join(", ")
                  : "Resultados de Laboratorio";

              return (
                <div
                  key={r.uuid}
                  onClick={() => setSelectedResult(r)}
                  className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                        <span className="text-xs text-pharmako-text-secondary font-medium">
                          Fecha:{" "}
                          {new Date(r.performed_at).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-pharmako-text-primary truncate">
                        {titleText}
                      </p>
                      <p className="text-xs text-pharmako-text-muted font-medium truncate">
                        {r.notes ? r.notes : "Sin observaciones adicionales"}
                      </p>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  {r.reviewed_by && (
                    <div className="border-t border-pharmako-border-soft/60 pt-3 flex items-center justify-between text-xs text-pharmako-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-pharmako-text-muted" />
                        <span>
                          Dr.{" "}
                          {r.reviewed_by.full_name ||
                            r.reviewed_by.fullName ||
                            "Médico Revisor"}
                        </span>
                      </div>
                      {r.file_url && (
                        <span className="text-[10px] font-bold text-pharmako-primary flex items-center gap-1">
                          <FileDown className="h-3 w-3 shrink-0" />
                          PDF disponible
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Modal de Detalles de Resultados (luca-design) */}
      <Dialog
        open={!!selectedResult}
        onOpenChange={(open) => !open && setSelectedResult(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-2xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailedResult && (
            <>
              <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-pharmako-border-soft">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary">
                    Reporte de Estudio Médico
                  </DialogTitle>
                  <span className="text-xs text-pharmako-text-secondary font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                    Realizado:{" "}
                    {new Date(detailedResult.performed_at).toLocaleDateString(
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
                {/* Columna Izquierda: Resultados del Reporte */}
                <div className="space-y-4">
                  {/* Exámenes realizados */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Estudios Solicitados
                    </h4>
                    <div className="p-3.5 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-primary font-bold space-y-1.5">
                      {detailedResult.lab_request?.exams_list &&
                      detailedResult.lab_request.exams_list.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {detailedResult.lab_request.exams_list.map((exam) => (
                            <li
                              key={exam}
                              className="text-pharmako-text-primary"
                            >
                              {exam}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Análisis General</p>
                      )}
                    </div>
                  </div>

                  {/* Notas / Observaciones */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Observaciones del Laboratorio
                    </h4>
                    <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed whitespace-pre-line">
                      {detailedResult.notes ||
                        "El laboratorio no reportó hallazgos adicionales."}
                    </div>
                  </div>

                  {/* Botón de Descarga del Archivo PDF */}
                  {detailedResult.file_url && (
                    <div className="pt-2">
                      <a
                        href={detailedResult.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pharmako-primary hover:bg-pharmako-primary-hover text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        <FileDown className="h-4 w-4" />
                        Descargar Reporte PDF
                      </a>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Doctor y Estado */}
                <div className="space-y-4">
                  {/* Estado de Revisión */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Estado de Revisión
                    </h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(detailedResult.status)}
                      {detailedResult.status === "ABNORMAL" && (
                        <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Requiere atención
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Solicitado/Revisado por */}
                  {detailedResult.reviewed_by && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Médico Evaluador
                      </h4>
                      <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft flex items-start gap-3 shadow-xs">
                        <div className="p-2 bg-pharmako-primary-light rounded-xl border border-pharmako-primary-muted/10 shrink-0">
                          <User className="h-5 w-5 text-pharmako-care" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-pharmako-text-primary">
                            Dr.{" "}
                            {detailedResult.reviewed_by.full_name ||
                              detailedResult.reviewed_by.fullName ||
                              "Médico Revisor"}
                          </p>
                          <p className="text-xs text-pharmako-text-secondary font-medium mt-0.5">
                            {detailedResult.reviewed_by.specialties?.[0]
                              ?.name || "Patología Clínica"}
                          </p>

                          <div className="mt-3 space-y-1.5 border-t border-pharmako-border-soft/60 pt-2.5 text-xs text-pharmako-text-secondary">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-pharmako-text-muted" />
                              <span className="truncate">
                                {detailedResult.reviewed_by.email ||
                                  "contacto@lucahealth.com"}
                              </span>
                            </div>
                            {detailedResult.reviewed_by.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-pharmako-text-muted" />
                                <span>{detailedResult.reviewed_by.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instrucciones de la orden original */}
                  {detailedResult.lab_request?.instructions && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Instrucciones de la Orden
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedResult.lab_request.instructions}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-pharmako-border-soft pt-4 flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
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
