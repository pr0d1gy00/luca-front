"use client";

import { useState, useTransition, useEffect } from "react";
import { usePatientInvoicesQuery } from "@/features/invoices/hooks/usePatientInvoicesQuery";
import { usePatientInvoiceDetailQuery } from "@/features/invoices/hooks/usePatientInvoiceDetailQuery";
import { useReportPaymentMutation } from "@/features/invoices/hooks/useReportPaymentMutation";
import { useAuthStore } from "@/store/auth";
import {
  Calendar,
  User,
  CreditCard,
  FileText,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Upload,
  CheckCircle,
  FileDown,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface PaymentRecord {
  uuid: string;
  amount: number;
  method: "CASH" | "CARD" | "TRANSFER" | "INSURANCE" | "OTHER";
  reference?: string;
  paid_at: string;
  notes?: string;
  receipt_path?: string;
}

interface DetailedInvoice {
  id: string;
  uuid: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status:
    | "DRAFT"
    | "SENT"
    | "PAID"
    | "PARTIALLY_PAID"
    | "OVERDUE"
    | "CANCELLED";
  due_date?: string;
  notes?: string;
  user?: {
    full_name?: string;
    fullName?: string;
  };
  clinicBranch?: {
    name?: string;
  };
  items?: InvoiceItem[];
  payments?: PaymentRecord[];
}

export default function PatientInvoicesPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  // Estados de carga e interfaz
  const [selectedInvoiceUuid, setSelectedInvoiceUuid] = useState<string | null>(
    null,
  );

  // Cargar lista de facturas
  const {
    data: paginatedData,
    isLoading: listLoading,
    isError: listError,
    isFetching: listFetching,
  } = usePatientInvoicesQuery(page);

  const invoices = paginatedData?.data || [];
  const totalPages: number = paginatedData?.last_page || 1;

  // Cargar detalle de factura cuando se selecciona una
  const { data: detailData, isFetching: detailFetching } =
    usePatientInvoiceDetailQuery(selectedInvoiceUuid || "");

  const detailedInvoice = (detailData?.data ||
    detailData) as DetailedInvoice | null;

  // Mutación para reportar pagos
  const reportPaymentMutation = useReportPaymentMutation();

  // Estados del Formulario de Reporte de Pago
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<
    "CASH" | "CARD" | "TRANSFER" | "INSURANCE" | "OTHER"
  >("TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Pre-llenar el monto con el saldo pendiente de la factura
  useEffect(() => {
    if (detailedInvoice) {
      const totalPaid =
        detailedInvoice.payments?.reduce(
          (acc, p) => acc + Number(p.amount),
          0,
        ) || 0;
      const pendingAmount = Number(detailedInvoice.total) - totalPaid;
      const t = setTimeout(() => {
        setAmount(pendingAmount > 0 ? pendingAmount.toFixed(2) : "");
      }, 0);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setAmount("");
        setReference("");
        setNotes("");
        setFile(null);
        setFormError("");
        setFormSuccess("");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [detailedInvoice]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage);
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 4 * 1024 * 1024) {
        setFormError("El archivo no debe superar los 4MB");
        return;
      }
      setFile(selectedFile);
      setFormError("");
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedInvoiceUuid) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Por favor ingrese un monto de pago válido");
      return;
    }

    const formData = new FormData();
    formData.append("amount", numAmount.toString());
    formData.append("method", method);
    if (reference) formData.append("reference", reference);
    if (notes) formData.append("notes", notes);
    if (file) formData.append("receipt", file);

    try {
      await reportPaymentMutation.mutateAsync({
        uuid: selectedInvoiceUuid,
        paymentData: formData,
      });

      setFormSuccess("¡Pago reportado exitosamente!");
      setFile(null);
      setReference("");
      setNotes("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errMsg =
        axiosError.response?.data?.message ||
        "Error al reportar el pago. Por favor intente de nuevo.";
      setFormError(errMsg);
    }
  };

  // Formateador de Badges de Estado de Factura
  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-pharmako-success-light text-pharmako-success border border-pharmako-success/10 uppercase shrink-0">
            Pagada
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 uppercase shrink-0">
            Abonada
          </span>
        );
      case "SENT":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-pharmako-primary-light text-pharmako-text-secondary border border-pharmako-primary-muted/20 uppercase shrink-0">
            Enviada
          </span>
        );
      case "OVERDUE":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 uppercase shrink-0">
            Vencida
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 uppercase shrink-0">
            Cancelada
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 uppercase shrink-0">
            Borrador
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-pharmako-text-primary">
          Mis Facturas y Pagos
        </h1>
        <p className="text-sm text-pharmako-text-secondary">
          Visualiza tus facturas, consulta tus consumos de consulta o
          Marketplace y reporta tus transferencias o depósitos.
        </p>
      </div>

      {/* Contenedor Principal / Lista */}
      {listLoading || (listFetching && invoices.length === 0) || !user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-pharmako-surface rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-surface rounded-xl p-6">
          <AlertCircle className="h-10 w-10 text-pharmako-danger mb-3" />
          <p className="text-base font-bold text-pharmako-text-primary">
            Error al cargar las facturas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-md">
            No se pudo obtener la información de facturación del servidor.
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-pharmako-surface rounded-xl p-8">
          <ClipboardList className="h-12 w-12 text-pharmako-text-muted mb-4" />
          <p className="text-lg font-bold text-pharmako-text-primary">
            No tienes facturas emitidas
          </p>
          <p className="text-sm text-pharmako-text-secondary mt-1 max-w-sm">
            Las facturas por consultas o cotizaciones aparecerán aquí una vez
            que sean emitidas por tu médico o la red de farmacias.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((inv: DetailedInvoice) => (
              <div
                key={inv.uuid}
                onClick={() => setSelectedInvoiceUuid(inv.uuid)}
                className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-pharmako-care" />
                      <span className="text-xs text-pharmako-text-secondary font-medium">
                        Emisión:{" "}
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin fecha límite"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-pharmako-text-primary truncate">
                      {inv.clinicBranch?.name || "Clínica / Proveedor"}
                    </p>
                    <p className="text-xs text-pharmako-text-muted font-medium truncate">
                      Emisor: Dr.{" "}
                      {inv.user?.full_name ||
                        inv.user?.fullName ||
                        "Médico Emisor"}
                    </p>
                  </div>
                  {getInvoiceStatusBadge(inv.status)}
                </div>

                <div className="border-t border-pharmako-border-soft/60 pt-3 flex items-center justify-between text-xs text-pharmako-text-secondary">
                  <span className="font-semibold text-pharmako-text-muted">
                    Total facturado:
                  </span>
                  <span className="text-base font-bold text-pharmako-text-primary flex items-center gap-0.5">
                    <DollarSign className="h-4 w-4 text-pharmako-care shrink-0" />
                    {inv.total} {inv.currency || "USD"}
                  </span>
                </div>
              </div>
            ))}
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

      {/* Modal de Detalle de Factura e Historial/Reporte de Pagos */}
      <Dialog
        open={!!selectedInvoiceUuid}
        onOpenChange={(open) => !open && setSelectedInvoiceUuid(null)}
      >
        <DialogContent className="bg-pharmako-surface sm:max-w-2xl rounded-xl shadow-lg border border-pharmako-border-soft p-6">
          {detailFetching && !detailedInvoice ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 border-4 border-pharmako-care border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-pharmako-text-secondary">
                Cargando desglose de factura...
              </p>
            </div>
          ) : detailedInvoice ? (
            <>
              <DialogHeader className="flex flex-col gap-1.5 pb-4 border-b border-pharmako-border-soft">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg font-bold text-pharmako-text-primary">
                    Detalle de Factura
                  </DialogTitle>
                  <span className="text-xs text-pharmako-text-secondary font-medium">
                    Due Date:{" "}
                    {detailedInvoice.due_date
                      ? new Date(detailedInvoice.due_date).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "Sin fecha límite"}
                  </span>
                </div>
              </DialogHeader>

              {/* Grid Layout de 2 Columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Columna Izquierda: Conceptos de Factura y Pagos Realizados */}
                <div className="space-y-4">
                  {/* Desglose de Items */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Conceptos Facturados
                    </h4>
                    <div className="border border-pharmako-border-soft rounded-xl overflow-hidden text-xs bg-pharmako-surface shadow-2xs">
                      <div className="bg-pharmako-background px-3 py-2 font-semibold text-pharmako-text-primary border-b border-pharmako-border-soft flex justify-between">
                        <span>Concepto</span>
                        <span>Total</span>
                      </div>
                      <div className="divide-y divide-pharmako-border-soft/60">
                        {detailedInvoice.items &&
                        detailedInvoice.items.length > 0 ? (
                          detailedInvoice.items.map((item) => (
                            <div
                              key={item.id}
                              className="px-3 py-2 flex justify-between text-pharmako-text-secondary"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-medium text-pharmako-text-primary truncate">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-pharmako-text-muted">
                                  Cant: {item.quantity} x {item.price} USD
                                </p>
                              </div>
                              <span className="font-bold text-pharmako-text-primary shrink-0">
                                {item.subtotal} USD
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-center text-pharmako-text-muted">
                            No se detallaron ítems en la factura.
                          </div>
                        )}
                      </div>
                      <div className="bg-pharmako-background/60 p-3 border-t border-pharmako-border-soft space-y-1 text-[11px] text-pharmako-text-secondary">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{detailedInvoice.subtotal} USD</span>
                        </div>
                        {Number(detailedInvoice.discount) > 0 && (
                          <div className="flex justify-between text-pharmako-success">
                            <span>Descuento:</span>
                            <span>-{detailedInvoice.discount} USD</span>
                          </div>
                        )}
                        {Number(detailedInvoice.tax) > 0 && (
                          <div className="flex justify-between">
                            <span>Impuesto:</span>
                            <span>+{detailedInvoice.tax} USD</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold text-pharmako-text-primary pt-1 border-t border-pharmako-border-soft/60">
                          <span>Total:</span>
                          <span>{detailedInvoice.total} USD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historial de Pagos */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                      Historial de Pagos Reportados
                    </h4>
                    {detailedInvoice.payments &&
                    detailedInvoice.payments.length > 0 ? (
                      <div className="space-y-2">
                        {detailedInvoice.payments.map((pay) => (
                          <div
                            key={pay.uuid}
                            className="p-3 bg-pharmako-surface border border-pharmako-border-soft rounded-xl text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-pharmako-success">
                                {pay.amount} USD
                              </span>
                              <span className="text-[10px] bg-pharmako-background text-pharmako-text-muted px-2 py-0.5 rounded uppercase font-semibold">
                                {pay.method === "TRANSFER"
                                  ? "Transferencia"
                                  : pay.method}
                              </span>
                            </div>
                            <div className="text-[10px] text-pharmako-text-secondary space-y-1">
                              {pay.reference && (
                                <p>
                                  <span className="font-semibold text-pharmako-text-primary">
                                    Referencia:
                                  </span>{" "}
                                  {pay.reference}
                                </p>
                              )}
                              <p>
                                <span className="font-semibold text-pharmako-text-primary">
                                  Fecha:
                                </span>{" "}
                                {new Date(pay.paid_at).toLocaleDateString(
                                  "es-ES",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                              {pay.notes && (
                                <p className="italic text-pharmako-text-muted mt-1 bg-pharmako-background p-1.5 rounded leading-normal">
                                  &quot;{pay.notes}&quot;
                                </p>
                              )}
                            </div>
                            {pay.receipt_path && (
                              <div className="pt-1.5 border-t border-pharmako-border-soft/60 flex items-center justify-between">
                                <a
                                  href={`http://localhost:8000/storage/${pay.receipt_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-pharmako-primary hover:text-pharmako-primary-hover font-bold transition-colors"
                                >
                                  <FileImage className="h-3.5 w-3.5" />
                                  Ver Comprobante
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-pharmako-surface rounded-xl border border-pharmako-border-soft text-center text-xs text-pharmako-text-muted">
                        No se han reportado pagos para esta factura.
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Reportar Pago */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-pharmako-border-soft/80 pt-4 md:pt-0 md:pl-6">
                  {detailedInvoice.status !== "PAID" &&
                  detailedInvoice.status !== "CANCELLED" ? (
                    <form onSubmit={handleSubmitPayment} className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-pharmako-text-muted">
                        Reportar Pago Manual
                      </h4>

                      {formError && (
                        <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {formSuccess && (
                        <div className="p-2.5 bg-pharmako-success-light border border-pharmako-success/20 rounded-lg text-xs text-pharmako-success flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{formSuccess}</span>
                        </div>
                      )}

                      {/* Input de Monto */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-pharmako-text-muted block">
                          Monto Pagado (USD)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pharmako-text-muted" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-7 bg-pharmako-surface border-pharmako-border focus:ring-pharmako-primary text-xs h-8 rounded-lg font-bold text-pharmako-text-primary"
                            required
                          />
                        </div>
                      </div>

                      {/* Select de Método */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-pharmako-text-muted block">
                          Método de Pago
                        </label>
                        <select
                          value={method}
                          onChange={(e) =>
                            setMethod(
                              e.target.value as
                                | "CASH"
                                | "CARD"
                                | "TRANSFER"
                                | "INSURANCE"
                                | "OTHER",
                            )
                          }
                          className="w-full h-8 rounded-lg border border-pharmako-border bg-pharmako-surface px-2.5 py-1 text-xs text-pharmako-text-primary outline-none focus:ring-1 focus:ring-pharmako-primary transition-all font-medium"
                        >
                          <option value="TRANSFER">
                            Transferencia Bancaria / Pago Móvil
                          </option>
                          <option value="CARD">
                            Tarjeta de Débito/Crédito
                          </option>
                          <option value="CASH">Efectivo / Divisas</option>
                          <option value="INSURANCE">Seguro Médico</option>
                          <option value="OTHER">Otro</option>
                        </select>
                      </div>

                      {/* Referencia */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-pharmako-text-muted block">
                          Nro. de Referencia / Transacción
                        </label>
                        <Input
                          type="text"
                          placeholder="Código de confirmación bancaria"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="bg-pharmako-surface border-pharmako-border focus:ring-pharmako-primary text-xs h-8 rounded-lg"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-pharmako-text-muted block">
                          Notas / Comentarios adicionales
                        </label>
                        <Textarea
                          placeholder="Banco emisor, titular de la cuenta, etc."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="bg-pharmako-surface border-pharmako-border focus:ring-pharmako-primary text-xs rounded-lg min-h-[50px] resize-none"
                        />
                      </div>

                      {/* Cargador de Capture */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-pharmako-text-muted block">
                          Comprobante de Pago (Capture / Foto)
                        </label>
                        <div className="relative border border-dashed border-pharmako-border-soft hover:border-pharmako-care rounded-lg p-3 text-center cursor-pointer transition-colors bg-pharmako-background/40">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center gap-1 text-[11px] text-pharmako-text-secondary">
                            <Upload className="h-5 w-5 text-pharmako-care" />
                            {file ? (
                              <span className="font-semibold text-pharmako-primary truncate max-w-xs block">
                                {file.name}
                              </span>
                            ) : (
                              <span>
                                Haga click para subir capture (Máx 4MB)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={reportPaymentMutation.isPending}
                        className="w-full h-8 rounded-lg bg-pharmako-primary hover:bg-pharmako-primary-hover text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2"
                      >
                        {reportPaymentMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando reporte...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Registrar Comprobante
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-pharmako-background/60 p-5 rounded-xl border border-pharmako-border-soft/60">
                      <CheckCircle className="h-10 w-10 text-pharmako-success mb-2" />
                      <p className="text-xs font-bold text-pharmako-text-primary">
                        Factura Completada
                      </p>
                      <p className="text-[11px] text-pharmako-text-secondary mt-1 leading-relaxed">
                        Esta factura ha sido pagada en su totalidad o cancelada.
                        No se requieren más reportes de pago.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-pharmako-border-soft pt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoiceUuid(null)}
                  className="border-pharmako-border text-pharmako-text-primary hover:bg-pharmako-background rounded-lg font-medium text-xs h-8"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
