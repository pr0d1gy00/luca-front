"use client";

import { useState, useTransition, useEffect } from "react";
import { usePatientDocumentsQuery } from "@/features/documents/hooks/usePatientDocumentsQuery";
import { usePatientDocumentDetailQuery } from "@/features/documents/hooks/usePatientDocumentDetailQuery";
import { useAuthStore } from "@/store/auth";
import {
  Calendar,
  User,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  FileDown,
  X,
  FileBadge,
  Copy,
  Clock,
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

interface MedicalDocumentType {
  uuid: string;
  type: "CERTIFICATE" | "REFERRAL" | "REPORT";
  content?: string;
  public_token: string;
  pending_upload: boolean;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    fullName?: string;
  };
  clinicBranch?: {
    name?: string;
  };
}

export default function PatientDocumentsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  // Estados de Filtros
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Estado del Modal
  const [selectedDocUuid, setSelectedDocUuid] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Debouncing de la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1); // Reiniciar a pág 1 en búsqueda
    }, 350);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Cargar lista con filtros del backend
  const {
    data: paginatedData,
    isLoading: listLoading,
    isError: listError,
    isFetching: listFetching,
  } = usePatientDocumentsQuery(
    page,
    debouncedSearch,
    selectedType || undefined,
  );

  const documents: MedicalDocumentType[] =
    paginatedData?.data?.data || paginatedData?.data || [];
  const totalPages: number =
    paginatedData?.data?.last_page || paginatedData?.last_page || 1;

  // Cargar detalle del documento
  const { data: detailData, isFetching: detailFetching } =
    usePatientDocumentDetailQuery(selectedDocUuid || "");

  const detailedDoc: MedicalDocumentType | null = (detailData?.data ||
    detailData) as MedicalDocumentType | null;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  const handleClearFilters = () => {
    setSearchVal("");
    setSelectedType("");
    setPage(1);
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Error al copiar token:", err);
    }
  };

  // Badges y traducción de tipos de documentos
  const getDocTypeInfo = (type: string) => {
    switch (type) {
      case "CERTIFICATE":
        return {
          label: "Certificado",
          classes: "bg-emerald-50 text-emerald-600 border-emerald-100",
        };
      case "REFERRAL":
        return {
          label: "Referencia",
          classes: "bg-blue-50 text-blue-600 border-blue-100",
        };
      case "REPORT":
        return {
          label: "Informe",
          classes: "bg-teal-50 text-teal-600 border-teal-100",
        };
      default:
        return {
          label: type,
          classes: "bg-slate-50 text-slate-600 border-slate-100",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mis Documentos Médicos
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Accede, visualiza y descarga los certificados, constancias e informes
          médicos emitidos por tus doctores.
        </p>
      </div>

      {/* Controles de Filtros */}
      <div className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pharmako-text-muted" />
          <Input
            type="text"
            placeholder="Buscar por médico o palabras clave..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 bg-pharmako-surface border-pharmako-border focus:ring-pharmako-primary text-xs h-9 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selector de Tipo */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg border border-pharmako-border bg-pharmako-surface px-3 py-1.5 text-xs text-pharmako-text-primary outline-none focus:ring-1 focus:ring-pharmako-primary transition-all font-medium appearance-none"
            >
              <option value="">Todos los tipos</option>
              <option value="CERTIFICATE">Certificados</option>
              <option value="REFERRAL">Referencias / Órdenes</option>
              <option value="REPORT">Informes Médicos</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pharmako-text-muted pointer-events-none" />
          </div>

          {/* Limpiar Filtros */}
          {(searchVal || selectedType) && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-pharmako-border hover:bg-pharmako-background text-xs h-9 rounded-lg px-3 flex items-center gap-1 shrink-0"
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Grid del Listado */}
      {listLoading || (listFetching && documents.length === 0) || !user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 bg-pharmako-surface rounded-xl animate-pulse border border-pharmako-border-soft"
            />
          ))}
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl p-6 border border-pharmako-border-soft">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar los documentos
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo establecer conexión con el servidor para traer los
            archivos.
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8 border border-pharmako-border-soft">
          <ClipboardList className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No se encontraron documentos
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            Los informes, referencias o constancias emitidas aparecerán en esta
            sección.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const docInfo = getDocTypeInfo(doc.type);
              const docDate = new Date(doc.created_at).toLocaleDateString(
                "es-ES",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={doc.uuid}
                  onClick={() => setSelectedDocUuid(doc.uuid)}
                  className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                        <span className="text-xs text-pharmako-text-secondary font-medium">
                          Emitido: {docDate}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-pharmako-text-primary truncate">
                        {doc.clinicBranch?.name || "Clínica Emisora"}
                      </p>
                      <p className="text-xs text-pharmako-text-secondary font-medium truncate">
                        Dr. {doc.user?.first_name} {doc.user?.last_name}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase shrink-0 ${docInfo.classes}`}
                    >
                      {docInfo.label}
                    </span>
                  </div>

                  <div className="border-t border-pharmako-border-soft/60 pt-3 flex items-center justify-between text-xs">
                    <span className="text-pharmako-text-muted font-medium flex items-center gap-1.5">
                      <FileBadge className="h-4 w-4 text-pharmako-care" />
                      Código: {doc.public_token.slice(0, 8)}...
                    </span>

                    {doc.pending_upload ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 font-bold">
                        <Clock className="h-3 w-3 animate-pulse" />
                        Firmando
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-pharmako-success bg-pharmako-success-light px-2 py-1 rounded-full border border-pharmako-success/10 font-bold">
                        <CheckCircle className="h-3 w-3" />
                        Listo
                      </span>
                    )}
                  </div>
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

      {/* Modal de Detalle de Documento */}
      <Dialog
        open={!!selectedDocUuid}
        onOpenChange={(open) => !open && setSelectedDocUuid(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailFetching && !detailedDoc ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 border-4 border-pharmako-care border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-pharmako-text-secondary">
                Cargando documento...
              </p>
            </div>
          ) : detailedDoc ? (
            <>
              <DialogHeader className="pb-4 border-b border-pharmako-border-soft flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary">
                    Detalle del Documento
                  </DialogTitle>
                  <span
                    className={`text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase shrink-0 ${getDocTypeInfo(detailedDoc.type).classes}`}
                  >
                    {getDocTypeInfo(detailedDoc.type).label}
                  </span>
                </div>
              </DialogHeader>

              {/* Cuerpo del Modal */}
              <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {/* Info del Emisor */}
                <div className="bg-pharmako-background/60 border border-pharmako-border-soft rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex justify-between items-center text-pharmako-text-secondary">
                    <span>Médico Emisor:</span>
                    <span className="font-semibold text-pharmako-text-primary">
                      Dr. {detailedDoc.user?.first_name}{" "}
                      {detailedDoc.user?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-pharmako-text-secondary">
                    <span>Clínica / Centro:</span>
                    <span className="font-semibold text-pharmako-text-primary">
                      {detailedDoc.clinicBranch?.name || "Clínica Emisora"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-pharmako-text-secondary">
                    <span>Fecha de Emisión:</span>
                    <span className="font-semibold text-pharmako-text-primary">
                      {new Date(detailedDoc.created_at).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>

                {/* Contenido / Observaciones */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-pharmako-text-muted">
                    Contenido del Documento
                  </h4>
                  <div className="p-4 bg-pharmako-surface border border-pharmako-border-soft rounded-xl text-xs text-pharmako-text-secondary whitespace-pre-wrap leading-relaxed shadow-2xs min-h-[80px]">
                    {detailedDoc.content ||
                      "El documento no cuenta con observaciones textuales adicionales."}
                  </div>
                </div>

                {/* Token de Validación Pública */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-pharmako-text-muted">
                    Token de Validación Oficial
                  </h4>
                  <div className="bg-pharmako-background border border-pharmako-border-soft rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-mono text-pharmako-text-primary select-all break-all pr-4">
                      {detailedDoc.public_token}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToken(detailedDoc.public_token)}
                      className="border-pharmako-border bg-pharmako-surface text-pharmako-text-primary hover:bg-pharmako-background rounded-lg h-7 px-2 shrink-0 flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="size-3.5 text-pharmako-success" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-pharmako-care" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <DialogFooter className="border-t border-pharmako-border-soft pt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocUuid(null)}
                  className="border-pharmako-border text-pharmako-text-primary hover:bg-pharmako-background rounded-lg font-medium text-xs h-9"
                >
                  Cerrar
                </Button>

                {detailedDoc.file_path && !detailedDoc.pending_upload && (
                  <a
                    href={`http://localhost:8000/storage/${detailedDoc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 h-9 bg-pharmako-primary hover:bg-pharmako-primary-hover text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                  >
                    <FileDown className="h-4 w-4" />
                    Descargar PDF
                  </a>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
