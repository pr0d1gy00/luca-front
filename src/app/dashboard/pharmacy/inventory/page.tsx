"use client";

import { useState } from "react";
import { Package, BarChart3 } from "lucide-react";
import { InventoryManagementTable } from "@/features/inventory/components/InventoryManagementTable";
import { PharmacyReportsView } from "@/features/inventory/components/PharmacyReportsView";

export default function PharmacyInventoryPage() {
  const [view, setView] = useState<"inventory" | "reports">("inventory");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Inventario Farmacéutico
          </h1>
          <p className="text-sm text-slate-600">
            Control de stock, fraccionamiento por blíster, mermas por
            vencimiento y libro de psicotrópicos.
          </p>
        </div>

        {/* View Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60">
          <button
            onClick={() => setView("inventory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-none ${
              view === "inventory"
                ? "bg-white text-slate-900 border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4 text-pharmako-care" />
            <span>Catálogo y Stock</span>
          </button>
          <button
            onClick={() => setView("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-none ${
              view === "reports"
                ? "bg-white text-slate-900 border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-pharmako-care" />
            <span>Reportes Especializados</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "inventory" ? (
        <InventoryManagementTable />
      ) : (
        <PharmacyReportsView />
      )}
    </div>
  );
}
