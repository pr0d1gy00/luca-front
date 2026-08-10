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
import { Pagination } from "@/components/ui/pagination";
import { CheckoutModal } from "@/features/prescriptions/components/CheckoutModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteOffersTab } from "@/features/prescriptions/components/QuoteOffersTab";
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

  const rawPrescriptions = Array.isArray(paginatedData?.data?.data)
    ? paginatedData.data.data
    : Array.isArray(paginatedData?.data)
      ? paginatedData.data
      : Array.isArray(paginatedData)
        ? paginatedData
        : [];
  const totalPages: number =
    paginatedData?.data?.last_page || paginatedData?.last_page || 1;

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
  const [checkoutOffer, setCheckoutOffer] = useState<Record<string, unknown> | null>(null);
  const [checkoutSelectedItems, setCheckoutSelectedItems] = useState<number[] | null>(null);

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
      return (
        String(prescObj.uuid) === String(prescId) ||
        String(prescObj.id) === String(prescId) ||
        String(q.prescription_id) === String(prescId)
      );
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

              <Tabs defaultValue="detalles" className="w-full mt-4">
                <TabsList className="w-full justify-start border-b border-pharmako-border-soft rounded-none p-0 h-auto bg-transparent mb-4">
                  <TabsTrigger value="detalles" className="data-[state=active]:border-b-2 data-[state=active]:border-pharmako-care data-[state=active]:text-pharmako-care rounded-none shadow-none bg-transparent py-3">Detalles de la Receta</TabsTrigger>
                  <TabsTrigger value="cotizaciones" className="data-[state=active]:border-b-2 data-[state=active]:border-pharmako-care data-[state=active]:text-pharmako-care rounded-none shadow-none bg-transparent py-3">
                    Presupuestos ({getAssociatedQuoteOffers(detailedPresc.uuid).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="detalles" className="m-0 focus-visible:ring-0">
                  {/* Diseño de Receta Médica Real */}
                  <div className="flex flex-col gap-6 py-4 max-h-[60vh] overflow-y-auto pr-1 pb-10 relative">

                    {/* 1. Encabezado: Datos del Médico */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-pharmako-border-soft/60 pb-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-pharmako-care-light/20 rounded-2xl flex items-center justify-center border border-pharmako-care/20 shrink-0 shadow-sm overflow-hidden">
                          {detailedPresc.user?.logo_url || detailedPresc.user?.profilePictureUrl || detailedPresc.user?.avatar ? (
                            <img
                              src={detailedPresc.user?.logo_url || detailedPresc.user?.profilePictureUrl || detailedPresc.user?.avatar}
                              alt="Doctor"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-pharmako-care" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-black text-pharmako-text-primary tracking-tight">
                            Dr. {detailedPresc.user?.full_name || detailedPresc.user?.fullName || "Médico Especialista"}
                          </p>
                          <p className="text-sm text-pharmako-care font-semibold mb-1">
                            {detailedPresc.user?.specialties?.[0]?.name || "Medicina General"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {detailedPresc.user?.email || "contacto@lucahealth.com"}</span>
                            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {detailedPresc.user?.phone || "+54 9 11 5555-5555"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Cuerpo: Tratamiento y Posología */}
                    <div className="space-y-4 relative">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Pill className="h-4 w-4" /> Rx (Tratamiento)
                      </h4>
                      <div className="space-y-3">
                        {detailedPresc.items && detailedPresc.items.length > 0 ? (
                          detailedPresc.items.map((item, index) => (
                            <div
                              key={item.uuid ?? index}
                              className="py-3 px-0 border-b border-dashed border-slate-200 last:border-0 flex flex-col gap-3 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 text-pharmako-primary">
                                    <Check className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div>
                                    <p className="text-base font-bold text-slate-800 leading-tight">
                                      {item.medication?.active_principle || "Medicamento"}{" "}
                                      <span className="text-slate-400 font-medium text-sm">
                                        {item.medication?.commercial_name ? `(${item.medication.commercial_name})` : ""}
                                      </span>
                                    </p>
                                    {item.medication?.concentration && (
                                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        {item.medication.concentration}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0 mt-0.5">
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-pharmako-care/10 text-[11px] font-bold text-pharmako-care border border-pharmako-care/20">
                                    x{item.quantity || 1} unid.
                                  </span>
                                </div>
                              </div>

                              <div className="pl-7">
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-100/50 w-fit">
                                  <span className="flex items-center gap-1.5"><span className="font-bold text-slate-800">Dosis:</span> {item.dose || "1 toma"}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="flex items-center gap-1.5"><span className="font-bold text-slate-800">Frec:</span> {item.frequency || "N/A"}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="flex items-center gap-1.5"><span className="font-bold text-slate-800">Dur:</span> {item.duration || "N/A"}</span>
                                </div>

                                {item.notes && (
                                  <div className="mt-2 text-xs text-slate-500 italic flex gap-1.5">
                                    <span className="font-semibold text-slate-700 shrink-0 not-italic">Indicaciones:</span>
                                    <span>{item.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400 italic">No se detallan medicamentos.</p>
                        )}
                      </div>
                    </div>

                    {/* 3. Pie: Observaciones y Verificación */}
                    <div className="mt-6 pt-6 border-t border-pharmako-border-soft/60 flex flex-col md:flex-row items-start justify-between gap-6">
                      {/* Observaciones */}
                      <div className="flex-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Observaciones Médicas
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                          {detailedPresc.notes || "Ninguna observación adicional por parte del médico."}
                        </p>

                        {/* Fake Signature */}
                        <div className="mt-8 pt-4 border-t border-slate-300 border-dashed max-w-[200px] text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Firma del Médico</p>
                          <p className="font-mono text-xs text-slate-300 mt-1">Validez digital confirmada</p>
                        </div>
                      </div>

                      {/* Token */}
                      <div className="w-full md:w-64 bg-slate-50 rounded-xl border border-slate-200 p-4 shrink-0 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                          Token de Dispensación
                        </p>
                        <div className="flex flex-col items-center gap-2 mt-3">
                          {/* Generando un patron de barcode visual falso */}
                          <div className="flex h-8 gap-0.5 w-full justify-center opacity-40 mix-blend-multiply">
                            {[...Array(24)].map((_, i) => (
                              <div key={i} className={`bg-slate-800 h-full ${i % 2 === 0 ? 'w-1' : (i % 3 === 0 ? 'w-2' : 'w-0.5')}`}></div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 w-full mt-2">
                            <span className="font-mono text-base font-black text-slate-800 tracking-[0.2em] flex-1 text-center select-all">
                              {detailedPresc.public_token}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyToken(detailedPresc.public_token)}
                              className="h-8 w-8 text-slate-400 hover:text-pharmako-primary hover:bg-pharmako-primary/10 shrink-0"
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
                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="cotizaciones" className="m-0 focus-visible:ring-0 max-h-[60vh] overflow-y-auto pr-1">
                  <QuoteOffersTab
                    offers={getAssociatedQuoteOffers(detailedPresc.uuid)}
                    onCheckout={(offer, selected) => {
                      setCheckoutOffer(offer);
                      setCheckoutSelectedItems(selected);
                    }}
                  />
                </TabsContent>
              </Tabs>
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

      {/* Modal de Checkout / Reserva */}
      <CheckoutModal
        offer={checkoutOffer}
        selectedItems={checkoutSelectedItems}
        open={!!checkoutOffer}
        onOpenChange={(open) => !open && setCheckoutOffer(null)}
        onSuccess={() => {
          toast.success("¡Reserva completada con éxito!");
          // Opcional: Refrescar data o redirigir
        }}
      />
    </div>
  );
}
