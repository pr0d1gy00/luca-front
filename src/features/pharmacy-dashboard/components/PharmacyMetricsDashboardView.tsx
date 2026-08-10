"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Package, AlertTriangle, FileBox, Loader2, FilterX } from "lucide-react";
import { motion } from "motion/react";
import { staggerChildrenVariant, scaleInVariant, fadeUpVariant } from "@/app/lib/animations";
import { usePharmacyAnalytics } from "../hooks/usePharmacyAnalytics";
import type { PharmacyAnalyticsFilters } from "../types/analytics.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PharmacyMetricsDashboardView() {
  const [filters, setFilters] = useState<PharmacyAnalyticsFilters>({
    sale_condition: "all",
    expiration_status: "all",
  });

  const { data: analytics, isLoading, isError } = usePharmacyAnalytics(filters);

  // Render function for loading/error to keep main UI structure
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-pharmako-care mb-4" />
          <p className="font-medium text-sm">Actualizando métricas...</p>
        </div>
      );
    }

    if (isError || !analytics) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-red-500 bg-white border border-slate-200 rounded-xl">
          <AlertTriangle className="w-8 h-8 mb-4 text-red-400" />
          <p className="font-medium">Hubo un error cargando las analíticas</p>
        </div>
      );
    }

    const { overview, stock_distribution, batch_ingestion, top_brands } = analytics;

    return (
      <motion.div
        variants={staggerChildrenVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Overview Cards */}
        <motion.div variants={staggerChildrenVariant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={scaleInVariant} className="bg-white p-5 rounded-xl border border-slate-200 transition-colors duration-150 hover:border-pharmako-care/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">
                Valor de Inventario
              </span>
              <div className="p-2 rounded-lg bg-pharmako-care-light text-pharmako-care">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${new Intl.NumberFormat('en-US').format(overview.inventory_value)}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Refleja el valor actual
            </div>
          </motion.div>

          <motion.div variants={scaleInVariant} className="bg-white p-5 rounded-xl border border-slate-200 transition-colors duration-150 hover:border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">
                Items en Stock
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-US').format(overview.total_items)}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              En {overview.active_batches} lotes activos
            </div>
          </motion.div>

          <motion.div variants={scaleInVariant} className="bg-white p-5 rounded-xl border border-slate-200 transition-colors duration-150 hover:border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">
                Alerta de Vencimiento
              </span>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{overview.expiring_alerts}</div>
            <div className="text-xs text-red-500 font-bold mt-1">
              Vencen en los próximos {overview.expiring_days_threshold} días
            </div>
          </motion.div>

          <motion.div variants={scaleInVariant} className="bg-white p-5 rounded-xl border border-slate-200 transition-colors duration-150 hover:border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">
                Lotes en Proceso
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FileBox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{overview.processing_batches}</div>
            <div className="text-xs text-blue-500 font-bold mt-1">
              Pedidos de farmacia pendientes
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingestion de Lotes Chart */}
          <motion.div variants={fadeUpVariant} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col mb-6">
              <h3 className="text-lg font-bold text-slate-900">Ingreso de Lotes (6 Meses)</h3>
              <p className="text-sm text-slate-500">Tendencia de nuevos productos registrados</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batch_ingestion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar dataKey="productos" name="Nuevos Productos" fill="#23DCE1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribucion Chart */}
          <motion.div variants={fadeUpVariant} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
            <div className="flex flex-col mb-2">
              <h3 className="text-lg font-bold text-slate-900">Distribución por Condición</h3>
              <p className="text-sm text-slate-500">Estado legal del inventario activo</p>
            </div>
            <div className="h-[300px] w-full flex-1 flex items-center justify-center">
              {stock_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stock_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stock_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}
                      itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: '16px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <FilterX className="w-10 h-10 mb-3" />
                  <p className="text-sm font-medium">No hay datos para estos filtros</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Brands Table */}
        <motion.div variants={fadeUpVariant} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Marcas en Inventario</h3>
              <p className="text-sm text-slate-500">Laboratorios con mayor representación en stock</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Laboratorio</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">SKUs en Stock</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Porcentaje del Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top_brands.map((brand, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900">{brand.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600 font-medium">{brand.count} Productos</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pharmako-primary rounded-full"
                            style={{ width: `${brand.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-10 text-right">{brand.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {top_brands.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-slate-500 text-sm">
                      No hay marcas que coincidan con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase">Condición de Venta</label>
          <Select 
            value={filters.sale_condition} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, sale_condition: val }))}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
              <SelectValue>Todas las condiciones</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las condiciones</SelectItem>
              <SelectItem value="free">Venta Libre</SelectItem>
              <SelectItem value="prescription">Con Récipe</SelectItem>
              <SelectItem value="controlled">Psicotrópicos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase">Vencimiento</label>
          <Select 
            value={filters.expiration_status} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, expiration_status: val }))}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
              <SelectValue>Todos los estados</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="valid">Vigentes (&gt; 30 días)</SelectItem>
              <SelectItem value="expiring">Próx. a vencer (&le; 30 días)</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
