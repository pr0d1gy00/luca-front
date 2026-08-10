"use client";

import { useState } from "react";
import { Package, BarChart3, FileBox, LineChart } from "lucide-react";
import { InventoryManagementTable } from "@/features/inventory/components/InventoryManagementTable";
import { PharmacyReportsView } from "@/features/inventory/components/PharmacyReportsView";
import { PharmacyBatchesView } from "@/features/pharmacy-dashboard/components/PharmacyBatchesView";
import { PharmacyMetricsDashboardView } from "@/features/pharmacy-dashboard/components/PharmacyMetricsDashboardView";

import { motion, AnimatePresence } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";

export default function PharmacyInventoryPage() {
  const [view, setView] = useState<"inventory" | "reports" | "batches" | "metrics">("inventory");

  // Helper function to wrap the active view with motion
  const renderView = () => {
    switch (view) {
      case "inventory":
        return <InventoryManagementTable key="inventory" />;
      case "batches":
        return <PharmacyBatchesView key="batches" />;
      case "metrics":
        return <PharmacyMetricsDashboardView key="metrics" />;
      case "reports":
        return <PharmacyReportsView key="reports" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Inventario Farmacéutico
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Control de stock, fraccionamiento por blíster, mermas por
            vencimiento y libro de psicotrópicos.
          </p>
        </div>

        {/* View Selector */}
        <div className="flex p-1 gap-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setView("inventory")}
            className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors shadow-none ${view === "inventory"
              ? "text-pharmako-care border-b border-pharmako-care"
              : "text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
          >
            <Package className="w-4 h-4 " />
            <span>Catálogo y Stock</span>
          </button>
          <button
            onClick={() => setView("batches")}
            className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors shadow-none ${view === "batches"
              ? "text-pharmako-care border-b border-pharmako-care"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <FileBox className="w-4 h-4" />
            <span>Lotes y Facturas</span>
          </button>
          <button
            onClick={() => setView("metrics")}
            className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors shadow-none ${view === "metrics"
              ? "text-pharmako-care border-b border-pharmako-care"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Analíticas</span>
          </button>
          <button
            onClick={() => setView("reports")}
            className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors shadow-none ${view === "reports"
              ? "text-pharmako-care border-b border-pharmako-care"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reportes Especializados</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
