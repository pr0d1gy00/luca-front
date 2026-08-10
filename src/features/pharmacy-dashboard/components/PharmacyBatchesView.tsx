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
import { usePharmacyBatchesQuery, usePharmacyBatchesMetricsQuery } from "../hooks/usePharmacyBatches";

export function PharmacyBatchesView() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();
  
  // Backend infers providerId from auth token, but we need it for React Query cache key
  const providerId = user?.id || "fallback-provider-id";
  const { data: batchesResponse, isLoading } = usePharmacyBatchesQuery(providerId, 1);
  const batches = batchesResponse?.data || [];

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
    <AnimatePresence mode="wait">
      {isCreating ? (
        <motion.div
          key="creating"
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setIsCreating(false)}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Lotes y Facturas
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900">
              Nuevo Lote
            </span>
          </div>
          <BulkInventoryEntryView onBack={() => setIsCreating(false)} />
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
          {/* Metrics Dashboard */}
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

          {/* Main List */}
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
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-4">ID Lote</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Notas / Referencia</th>
                    <th className="p-4 text-center">Productos</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerChildrenVariant} className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">Cargando...</td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">No hay lotes registrados</td>
                    </tr>
                  ) : (
                    batches.map((batch) => (
                      <motion.tr
                        variants={fadeUpVariant}
                        key={batch.id}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="p-4 font-mono text-xs font-medium text-slate-900">
                          {batch.uuid ? batch.uuid.substring(0,8).toUpperCase() : `L-${batch.id}`}
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(batch.created_at))}
                        </td>
                        <td className="p-4 text-slate-900 font-medium max-w-[300px] truncate">
                          {batch.notes || "Sin referencia"}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md">
                            {batch.items_count || 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {batch.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {batch.document_urls && batch.document_urls.length > 0 && (
                            <div className="flex flex-col gap-1 items-end">
                              {batch.document_urls.map((url: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-pharmako-care hover:text-pharmako-care-hover transition-colors"
                                >
                                  {batch.document_urls.length === 1 ? "Ver Factura" : `Doc ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          )}
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
  );
}
