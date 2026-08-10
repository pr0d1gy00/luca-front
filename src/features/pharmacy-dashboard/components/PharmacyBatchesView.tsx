"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  TrendingUp,
  PackageCheck,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkInventoryEntryView } from "./BulkInventoryEntryView";

// Dummy data for the view

import { motion, AnimatePresence } from "motion/react";
import { staggerChildrenVariant, fadeUpVariant } from "@/app/lib/animations";

import { useAuthStore } from "@/store/auth";
import { usePharmacyBatchesQuery, usePharmacyBatchesMetricsQuery, useUpdateBatchMutation, BatchItem, usePharmacyBatchQuery } from "../hooks/usePharmacyBatches";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PharmacyBatchesView() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBatchUuid, setEditingBatchUuid] = useState<string | null>(null);
  const [previewBatchUuid, setPreviewBatchUuid] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  const providerId = user?.id || "fallback-provider-id";
  const { data: batchesResponse, isLoading } = usePharmacyBatchesQuery(providerId, 1);
  const batches = batchesResponse?.data || [];
  
  const { data: batchDetailData, isLoading: isLoadingDetail } = usePharmacyBatchQuery(previewBatchUuid || editingBatchUuid);

  const handleEdit = (batch: BatchItem) => {
    setEditingBatchUuid(batch.uuid);
  };

  const { data: metricsResponse, isLoading: isLoadingMetrics } = usePharmacyBatchesMetricsQuery(providerId);

  const dynamicMetrics = [
    {
      title: "Lotes Ingresados (Mes)",
      value: isLoadingMetrics ? "-" : (metricsResponse?.batches_this_month?.value?.toString() || "0"),
      trend: isLoadingMetrics ? "Cargando..." : (metricsResponse?.batches_this_month?.trend || "Sin datos previos"),
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Productos Cargados",
      value: isLoadingMetrics ? "-" : (metricsResponse?.total_products?.value?.toString() || "0"),
      trend: isLoadingMetrics ? "Cargando..." : (metricsResponse?.total_products?.trend || "Total acumulado"),
      icon: PackageCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Valor de Inventario",
      value: isLoadingMetrics ? "-" : (metricsResponse?.inventory_value?.value || "Bs 0"),
      trend: isLoadingMetrics ? "Cargando..." : (metricsResponse?.inventory_value?.trend || "Valor actualizado"),
      icon: TrendingUp,
      color: "bg-pharmako-care-light text-pharmako-care",
    },
  ];

  return (
    <>
    <AnimatePresence mode="wait">
      {isCreating || editingBatchUuid ? (
        <motion.div
          key="creating-or-editing"
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setIsCreating(false); setEditingBatchUuid(null); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Lotes y Facturas
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900">
              {editingBatchUuid ? "Editar Lote" : "Nuevo Lote"}
            </span>
          </div>
          {(editingBatchUuid && isLoadingDetail) ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-8 h-8 rounded-full border-2 border-pharmako-care/30 border-t-pharmako-care animate-spin mx-auto mb-3" />
              Cargando lote...
            </div>
          ) : (
            <BulkInventoryEntryView 
              initialData={editingBatchUuid ? batchDetailData?.data : undefined}
              onBack={() => { setIsCreating(false); setEditingBatchUuid(null); }} 
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          key="list"
          variants={staggerChildrenVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <motion.div variants={staggerChildrenVariant} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dynamicMetrics.map((metric, idx) => (
              <motion.div
                variants={fadeUpVariant}
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-3 transition-colors duration-150 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">
                    {metric.title}
                  </span>
                  <div className={`p-2 rounded-lg ${metric.color}`}>
                    <metric.icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {metric.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {metric.trend}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUpVariant} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Historial de Cargas (Lotes)
                </h2>
                <p className="text-sm text-slate-500">
                  Registro de todas las facturas y lotes ingresados al inventario.
                </p>
              </div>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-pharmako-care text-slate-900 font-bold hover:bg-pharmako-care-hover shadow-none transition-colors duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cargar Nuevo Lote
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ID Lote</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Referencia</th>
                    <th className="px-6 py-4 text-center">Productos</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Documentos</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerChildrenVariant}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Cargando lotes...</td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No hay lotes registrados</td>
                    </tr>
                  ) : (
                    batches.map((batch) => (
                      <motion.tr
                        variants={fadeUpVariant}
                        key={batch.id}
                        onClick={() => setPreviewBatchUuid(batch.uuid)}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4 align-middle">
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {batch.uuid ? batch.uuid.substring(0,8).toUpperCase() : `L-${batch.id}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle text-slate-500">
                          {new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(batch.created_at))}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium max-w-[200px] truncate">
                              {batch.notes || "Sin referencia"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(batch);
                              }}
                              className="text-xs font-bold text-pharmako-care hover:text-pharmako-care-hover transition-colors ml-2 opacity-0 group-hover:opacity-100"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">
                            {batch.items_count || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {batch.status === 'PROCESSED' || batch.status === 'Procesado' ? 'PROCESADO' : batch.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {batch.document_urls && batch.document_urls.length > 0 ? (
                              batch.document_urls.map((url: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`Ver Documento ${idx + 1}`}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-pharmako-care hover:border-pharmako-care transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs italic">N/A</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <Sheet open={!!previewBatchUuid} onOpenChange={(open) => !open && setPreviewBatchUuid(null)}>
      <SheetContent className="sm:max-w-xl overflow-y-auto w-full p-6 sm:p-8 flex flex-col gap-6">
        <SheetHeader className="mb-2">
          <SheetTitle className="text-xl font-bold text-slate-900">Detalle del Lote</SheetTitle>
          <SheetDescription className="text-slate-500">
            Revisa los productos ingresados y documentos asociados a este lote.
          </SheetDescription>
        </SheetHeader>
        
        <AnimatePresence mode="wait">
          {isLoadingDetail ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center py-12 text-slate-400"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-pharmako-care/30 border-t-pharmako-care animate-spin" />
                <span className="text-sm font-medium">Cargando detalles...</span>
              </div>
            </motion.div>
          ) : batchDetailData?.data ? (
            <motion.div 
              key="content"
              variants={staggerChildrenVariant}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {/* Resumen del Lote */}
              <motion.div variants={fadeUpVariant} className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">ID Lote</span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {batchDetailData.data.uuid?.substring(0,8).toUpperCase() || `L-${batchDetailData.data.id}`}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Fecha</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pharmako-care" />
                    {new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(batchDetailData.data.created_at))}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Notas / Referencia</span>
                  <span className="text-sm text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-100 block mt-1">
                    {batchDetailData.data.notes || <span className="text-slate-400 italic">Sin referencia adicional</span>}
                  </span>
                </div>
              </motion.div>

              {/* Documentos */}
              {batchDetailData.data.document_urls && batchDetailData.data.document_urls.length > 0 && (
                <motion.div variants={fadeUpVariant} className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-pharmako-care" /> 
                    Documentos Adjuntos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {batchDetailData.data.document_urls.map((url: string, idx: number) => {
                      const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-pharmako-care hover:shadow-sm transition-all duration-300"
                        >
                          <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                            {isImage ? (
                              <img src={url} alt={`Documento ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-pharmako-care transition-colors duration-300">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-pharmako-care transition-colors">
                              Doc {idx + 1}
                            </span>
                            <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pharmako-care-light text-slate-400 group-hover:text-pharmako-care transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Lista de Productos */}
              <motion.div variants={fadeUpVariant} className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-pharmako-care" />
                  Productos Ingresados
                </h3>
                {batchDetailData.data.items && batchDetailData.data.items.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {batchDetailData.data.items.map((item: any, idx: number) => (
                      <motion.div 
                        variants={fadeUpVariant}
                        key={item.id} 
                        className="p-4 rounded-xl border border-slate-100 bg-white hover:border-pharmako-care/50 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-pharmako-care-light/30 flex items-center justify-center text-pharmako-care font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-pharmako-care transition-colors">
                              {item.medication?.name || item.active_ingredient || "Medicamento Personalizado"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              Venc: {item.expiration_date ? new Intl.DateTimeFormat('es-VE').format(new Date(item.expiration_date)) : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-pharmako-care bg-pharmako-care-light/50 px-2.5 py-1 rounded-lg inline-block">
                            +{item.stock} <span className="text-xs font-semibold text-pharmako-care/70">uds</span>
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-1.5">
                            {item.unit_price ? `Bs ${item.unit_price}` : "Sin precio"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center rounded-xl border border-slate-100 bg-slate-50/50">
                    <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="text-sm text-slate-500 font-medium">No se encontraron productos en este lote.</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-slate-500"
            >
              Ocurrió un error al cargar el lote.
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
    </>
  );
}
