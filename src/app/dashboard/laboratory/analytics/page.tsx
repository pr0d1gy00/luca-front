"use client";

import { LabAnalyticsDashboard } from "@/features/laboratory/components/LabAnalyticsDashboard";

export function LaboratoryAnalyticsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Analytics y Compra de Reactivos
        </h1>
        <p className="text-sm text-slate-600">
          Proyección de demanda de exámenes, insumos requeridos y ranking de
          pacientes frecuentes (Plataforma + Walk-in).
        </p>
      </div>

      <LabAnalyticsDashboard />
    </div>
  );
}

export default LaboratoryAnalyticsPage;
