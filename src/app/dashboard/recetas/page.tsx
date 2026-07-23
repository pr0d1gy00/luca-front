"use client";

import { useState, useTransition, useEffect } from "react";
import { usePatientPrescriptionsQuery } from "@/features/prescriptions/hooks/usePatientPrescriptionsQuery";
import { usePatientQuotesQuery } from "@/features/prescriptions/hooks/usePatientQuotesQuery";
import { useAuthStore } from "@/store/auth";
import {
  Calendar,
  Pill,
  User,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Mail,
  Building,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type TabType = "all" | "active" | "cancelled";

interface QuoteOffer {
  id: string;
  price: number;
  currency: string;
  availability?: string;
  comments?: string;
  pharmacy?: {
    commercialName?: string;
    commercial_name?: string;
    rif?: string;
    address?: string;
    phone?: string;
  };
}

interface PrescriptionItem {
  id: string;
  uuid: string;
  prescriptionUuid: string;
  medicationUuid: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  notes?: string;
  medication?: {
    name: string;
    concentration?: string;
    presentation?: string;
    active_principle?: string;
    commercial_name?: string;
  };
}

interface DetailedPrescription {
  id: string;
  uuid: string;
  date: string;
  expiration_date: string;
  notes?: string;
  public_token: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
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
  items: PrescriptionItem[];
}

export default function PatientPrescriptionsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [, startTransition] = useTransition();

  const {
    data: paginatedData,
    isLoading,
    isError,
    isFetching,
  } = usePatientPrescriptionsQuery(page);

  const { data: quotesData } = usePatientQuotesQuery();

  const rawPrescriptions = paginatedData?.data || [];
  const totalPages: number = paginatedData?.last_page || 1;

  // Filtrar recetas según la pestaña seleccionada
  const prescriptions = rawPrescriptions.filter(
    (presc: DetailedPrescription) => {
      if (activeTab === "active") {
        return presc.status === "ACTIVE";
      }
      if (activeTab === "cancelled") {
        return presc.status === "CANCELLED" || presc.status === "EXPIRED";
      }
      return true;
    },
  );

  const [selectedPresc, setSelectedPresc] =
    useState<DetailedPrescription | null>(null);
  const [detailedPresc, setDetailedPresc] =
    useState<DetailedPrescription | null>(null);
  const [copied, setCopied] = useState(false);

  // Sincronizar el estado del detalle en el macro-task
  useEffect(() => {
    if (!selectedPresc) {
      const t = setTimeout(() => setDetailedPresc(null), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDetailedPresc(selectedPresc), 0);
    return () => clearTimeout(t);
  }, [selectedPresc]);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  // Obtener cotizaciones del mercado asociadas a esta receta
  const getAssociatedQuoteOffers = (prescId: string) => {
    const quotes = (quotesData?.data || quotesData || []) as Array<
      Record<string, unknown>
    >;
    const associatedQuote = quotes.find((q) => {
      const prescObj = (q.prescription as Record<string, unknown>) || {};
      const pId = prescObj.id ?? prescObj.uuid ?? q.prescription_id;
      return String(pId) === String(prescId);
    });
    return (associatedQuote?.offers as QuoteOffer[]) || [];
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mis Recetas Médicas
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Gestiona tus recetas activas, consulta las indicaciones del
          tratamiento y obtén las ofertas de las farmacias.
        </p>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex items-center gap-1 border-b border-pharmako-border-soft overflow-x-auto pb-px">
        {(["active", "cancelled", "all"] as TabType[]).map((tab) => (
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
            {tab === "active" && "Recetas Activas"}
            {tab === "cancelled" && "Vencidas / Canceladas"}
            {tab === "all" && "Todas las Recetas"}
          </button>
        ))}
      </div>

      {/* Contenedor Principal / Lista */}
      {isLoading || (isFetching && prescriptions.length === 0) || !user ? (
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
            Error al cargar las recetas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información del servidor. Si estás sin
            conexión, revisa tu base de datos local.
          </p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8">
          <Pill className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No se encontraron recetas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            {activeTab === "active"
              ? "Actualmente no tienes tratamientos o recetas activas pendientes de retirar."
              : "No tienes recetas archivadas o vencidas en tu historial."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((presc: DetailedPrescription) => {
              const prescItems = presc.items || [];
              const associatedOffers = getAssociatedQuoteOffers(presc.uuid);

              return (
                <div
                  key={presc.uuid}
                  onClick={() => setSelectedPresc(presc)}
                  className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                        <span className="text-xs text-pharmako-text-secondary font-medium">
                          Emitida:{" "}
                          {new Date(presc.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-pharmako-text-primary truncate">
                        Dr.{" "}
                        {presc.user?.full_name ||
                          presc.user?.fullName ||
                          "Médico Especialista"}
                      </p>
                      <p className="text-xs text-pharmako-text-muted font-medium">
                        {presc.user?.specialties?.[0]?.name ||
                          "Medicina General"}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase shrink-0",
                        presc.status === "ACTIVE"
                          ? "bg-pharmako-success-light text-pharmako-success border-pharmako-success/10"
                          : "bg-slate-50 text-slate-500 border-slate-200",
                      )}
                    >
                      {presc.status === "ACTIVE"
                        ? "Activa"
                        : presc.status === "EXPIRED"
                          ? "Vencida"
                          : "Cancelada"}
                    </span>
                  </div>

                  <div className="border-t border-pharmako-border-soft/60 pt-3">
                    <p className="text-xs font-semibold text-pharmako-text-muted mb-1.5">
                      Medicamentos recetados:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prescItems.length > 0 ? (
                        prescItems.slice(0, 3).map((item: PrescriptionItem) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-pharmako-primary-light text-pharmako-text-secondary rounded-lg text-[10px] font-semibold border border-pharmako-primary-muted/20"
                          >
                            <Pill className="h-2.5 w-2.5 text-pharmako-care" />
                            {item.medication?.active_principle +
                              " " +
                              "(" +
                              item.medication?.commercial_name +
                              ")" || "Medicamento"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-pharmako-text-muted">
                          Sin especificaciones
                        </span>
                      )}
                      {prescItems.length > 3 && (
                        <span className="text-[10px] text-pharmako-text-secondary font-bold self-center">
                          +{prescItems.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge de Ofertas de Farmacia en el Listado */}
                  {associatedOffers.length > 0 && (
                    <div className="border-t border-pharmako-border-soft/60 pt-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-pharmako-success flex items-center gap-1">
                        <Building className="h-3 w-3 shrink-0" />
                        {associatedOffers.length}{" "}
                        {associatedOffers.length === 1
                          ? "oferta de farmacia"
                          : "ofertas de farmacia"}
                      </span>
                      <span className="text-[10px] text-pharmako-primary font-semibold flex items-center gap-0.5">
                        Ver detalles <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-pharmako-border-soft pt-4 mt-4">
              <span className="text-xs text-pharmako-text-secondary">
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
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

      {/* Modal de Detalles de la Receta (luca-design) */}
      <Dialog
        open={!!selectedPresc}
        onOpenChange={(open) => !open && setSelectedPresc(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-2xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailedPresc && (
            <>
              <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-pharmako-border-soft">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary flex items-center gap-2">
                    Detalles de la Receta Médica
                  </DialogTitle>
                  <span
                    className={cn(
                      "text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase shrink-0",
                      detailedPresc.status === "ACTIVE"
                        ? "bg-pharmako-success-light text-pharmako-success border-pharmako-success/10"
                        : "bg-slate-50 text-slate-500 border-slate-200",
                    )}
                  >
                    {detailedPresc.status === "ACTIVE" ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </DialogHeader>

              {/* Grid Layout de 2 Columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Columna Izquierda: Medicamentos e Indicaciones */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Tratamiento y Posología
                    </h4>
                    <div className="space-y-3">
                      {detailedPresc.items && detailedPresc.items.length > 0 ? (
                        detailedPresc.items.map((item, index) => (
                          <div
                            key={item.uuid ?? index}
                            className="p-4 rounded-xl border border-pharmako-border-soft bg-pharmako-surface shadow-xs space-y-2"
                          >
                            <div className="flex items-start gap-2">
                              <Pill className="h-4 w-4 text-pharmako-care shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-pharmako-text-primary">
                                  {item.medication?.active_principle +
                                    " " +
                                    `(${item.medication?.commercial_name})` ||
                                    "Medicamento"}
                                </p>
                                {item.medication?.concentration && (
                                  <p className="text-[10px] text-pharmako-text-secondary font-medium">
                                    Concentración:{" "}
                                    {item.medication.concentration}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-pharmako-text-secondary border-t border-pharmako-border-soft/60 pt-2">
                              <div>
                                <span className="text-[10px] text-pharmako-text-muted block">
                                  Dosis
                                </span>
                                <span className="font-semibold">
                                  {item.dose || "1 toma"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-pharmako-text-muted block">
                                  Frecuencia
                                </span>
                                <span className="font-semibold">
                                  {item.frequency || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-pharmako-text-muted block">
                                  Duración
                                </span>
                                <span className="font-semibold">
                                  {item.duration || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-pharmako-text-muted block">
                                  Cantidad
                                </span>
                                <span className="font-semibold">
                                  {item.quantity || 1} unidades
                                </span>
                              </div>
                            </div>

                            {item.notes && (
                              <div className="bg-pharmako-background p-2.5 rounded-lg border border-pharmako-border-soft text-[11px] text-pharmako-text-secondary leading-relaxed">
                                <span className="font-bold text-pharmako-text-primary block mb-0.5">
                                  Indicaciones:
                                </span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-pharmako-text-muted">
                          No se detallan ítems de prescripción.
                        </p>
                      )}
                    </div>
                  </div>

                  {detailedPresc.notes && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Observaciones Médicas Generales
                      </h4>
                      <div className="p-3 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-xs text-pharmako-text-secondary leading-relaxed">
                        {detailedPresc.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Médico, Token de Surtido y Respuestas de Farmacias */}
                <div className="space-y-4">
                  {/* Sección Médico */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Médico Prescriptor
                    </h4>
                    <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft flex items-start gap-3 shadow-xs">
                      <div className="p-2 bg-pharmako-primary-light rounded-xl border border-pharmako-primary-muted/10 shrink-0">
                        <User className="h-5 w-5 text-pharmako-care" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-pharmako-text-primary">
                          Dr.{" "}
                          {detailedPresc.user?.full_name ||
                            detailedPresc.user?.fullName ||
                            "Médico Especialista"}
                        </p>
                        <p className="text-xs text-pharmako-text-secondary font-medium mt-0.5">
                          {detailedPresc.user?.specialties?.[0]?.name ||
                            "Medicina General"}
                        </p>

                        <div className="mt-3 space-y-1.5 border-t border-pharmako-border-soft/60 pt-2.5 text-xs text-pharmako-text-secondary">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span className="truncate">
                              {detailedPresc.user?.email ||
                                "contacto@lucahealth.com"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-pharmako-text-muted" />
                            <span>
                              {detailedPresc.user?.phone ||
                                "+54 9 11 5555-5555"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección Token Público de Surtido */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Verificación en Farmacia
                    </h4>
                    <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-care/20 bg-pharmako-care-light/5 shadow-xs space-y-3">
                      <div>
                        <p className="text-xs font-bold text-pharmako-text-primary">
                          Token Público de Receta
                        </p>
                        <p className="text-[10px] text-pharmako-text-secondary mt-0.5 leading-relaxed">
                          Presenta este token en la farmacia para que el
                          farmacéutico pueda consultar y dispensar tus
                          medicamentos.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-pharmako-background border border-pharmako-border-soft rounded-lg p-2.5">
                        <span className="font-mono text-sm font-bold text-pharmako-text-primary tracking-wider flex-1 select-all">
                          {detailedPresc.public_token}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopyToken(detailedPresc.public_token)
                          }
                          className="h-8 w-8 text-pharmako-text-secondary hover:text-pharmako-primary shrink-0"
                          title="Copiar token"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-pharmako-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Respuestas de Farmacias (Marketplace / Cotizaciones) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Respuestas y Presupuestos de Farmacias
                    </h4>
                    <div className="space-y-2">
                      {getAssociatedQuoteOffers(detailedPresc.uuid).length >
                      0 ? (
                        getAssociatedQuoteOffers(detailedPresc.uuid).map(
                          (offer: QuoteOffer) => (
                            <div
                              key={offer.id}
                              className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft space-y-3 shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Building className="h-4 w-4 text-pharmako-care shrink-0" />
                                  <p className="text-xs font-bold text-pharmako-text-primary truncate">
                                    {offer.pharmacy?.commercialName ||
                                      offer.pharmacy?.commercial_name ||
                                      "Farmacia Proveedora"}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-pharmako-success shrink-0">
                                  {offer.price} {offer.currency || "USD"}
                                </span>
                              </div>

                              <div className="text-xs text-pharmako-text-secondary space-y-1.5 border-t border-pharmako-border-soft/60 pt-2">
                                {offer.availability && (
                                  <p className="text-[11px] leading-relaxed">
                                    <span className="font-semibold text-pharmako-text-primary">
                                      Disponibilidad:
                                    </span>{" "}
                                    {offer.availability}
                                  </p>
                                )}
                                {offer.comments && (
                                  <p className="text-[11px] text-pharmako-text-muted bg-pharmako-background p-1.5 rounded leading-relaxed border border-pharmako-border-soft">
                                    &quot;{offer.comments}&quot;
                                  </p>
                                )}
                                {(offer.pharmacy?.address ||
                                  offer.pharmacy?.phone) && (
                                  <div className="space-y-1.5 pt-2 border-t border-pharmako-border-soft/60 mt-2">
                                    {offer.pharmacy.phone && (
                                      <div className="flex items-center gap-1.5 text-[11px]">
                                        <Phone className="h-3 w-3 text-pharmako-text-muted shrink-0" />
                                        <span>{offer.pharmacy.phone}</span>
                                      </div>
                                    )}
                                    {offer.pharmacy.address && (
                                      <div className="flex items-start gap-1.5 text-[11px]">
                                        <MapPin className="h-3 w-3 text-pharmako-text-muted shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">
                                          {offer.pharmacy.address}
                                        </span>
                                      </div>
                                    )}

                                    {/* Botón interactivo de Google Maps */}
                                    {offer.pharmacy?.address && (
                                      <div className="pt-1.5">
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                            (offer.pharmacy.commercialName ||
                                              "Farmacia") +
                                              " " +
                                              offer.pharmacy.address,
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-pharmako-primary hover:text-pharmako-primary-hover font-semibold transition-colors text-[10px]"
                                        >
                                          <MapPin className="h-3 w-3 text-pharmako-care shrink-0" />
                                          Cómo llegar (Google Maps)
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="p-4 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-center text-xs text-pharmako-text-muted">
                          Aún sin cotizaciones de farmacia. Envía esta receta a
                          cotizar en el Marketplace para recibir presupuestos
                          locales.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-pharmako-border-soft pt-4 flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPresc(null)}
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
