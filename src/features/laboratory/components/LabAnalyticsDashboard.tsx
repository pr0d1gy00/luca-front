"use client";

import {
  TestTube,
  Users,
  BarChart3,
  PieChart,
  ShoppingCart,
} from "lucide-react";
import { useLabAnalytics } from "../hooks/useLabAnalytics";

export function LabAnalyticsDashboard() {
  const { data: analytics, isLoading } = useLabAnalytics();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
        Cargando métricas de análisis de laboratorio y reactivos...
      </div>
    );
  }

  const mostRequested = analytics?.most_requested_exams || [];
  const topPatients = analytics?.top_patients || [];
  const breakdown = analytics?.volume_breakdown || {
    internal: 0,
    external: 0,
    total: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Exámenes Procesados
            </span>
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <TestTube className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analytics?.total_completed_results || 0}
          </div>
          <p className="text-xs text-slate-500">
            Estudios con resultados publicados
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Volumen Interno vs Externo
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {breakdown.internal}{" "}
            <span className="text-xs text-slate-400 font-normal">internos</span>{" "}
            / {breakdown.external}{" "}
            <span className="text-xs text-slate-400 font-normal">walk-in</span>
          </div>
          <p className="text-xs text-slate-500">
            Total unificado: {breakdown.total} órdenes
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Planificación de Insumos
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Reactivos Activos
          </div>
          <p className="text-xs text-slate-500">Basado en demanda proyectada</p>
        </div>
      </div>

      {/* Main Analytics Content: Most Requested (Reactive Purchase) & Top Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Requested Exams for Reactive Purchasing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Exámenes Más Solicitados (Compra de Reactivos)
              </h3>
              <p className="text-xs text-slate-500">
                Permite anticipar la adquisición de insumos y kits
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mostRequested.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No hay datos suficientes de demanda.
              </div>
            ) : (
              mostRequested.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pharmako-care text-slate-900 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.exam_name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                    {item.requests_count} solicitudes
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Frequent Patients Ranking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pacientes Más Frecuentes
              </h3>
              <p className="text-xs text-slate-500">
                Pacientes con mayor número de estudios realizados
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topPatients.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No hay datos registrados de pacientes.
              </div>
            ) : (
              topPatients.map((pat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {pat.patient_name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {pat.total_exams} estudios
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
