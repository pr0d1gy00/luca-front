"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePharmacyInventory } from "@/features/pharmacy-dashboard/hooks/usePharmacyInventory";
import { AddEditInventoryModal } from "@/features/pharmacy-dashboard/components/AddEditInventoryModal";
import type { PharmacyInventoryItem } from "@/features/pharmacy-dashboard/types/pharmacy.types";

export function InventoryManagementTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [saleCondition, setSaleCondition] = useState<string>("");
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<PharmacyInventoryItem | null>(
    null,
  );

  const { inventory, pagination, isLoading } = usePharmacyInventory({
    search: searchTerm,
    sale_condition: saleCondition,
    low_stock: lowStockFilter,
    page,
    per_page: 10,
  });

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PharmacyInventoryItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por monodroga, marca o EAN..."
              className="pl-10 h-11 border-slate-200 rounded-xl bg-white shadow-none text-sm text-slate-900 focus:border-pharmako-care"
            />
          </div>

          <select
            value={saleCondition}
            onChange={(e) => setSaleCondition(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-pharmako-care"
          >
            <option value="">Todas las condiciones</option>
            <option value="prescription">Bajo Receta</option>
            <option value="free">Venta Libre (OTC)</option>
            <option value="controlled">Psicotrópicos (Controlados)</option>
          </select>

          <button
            type="button"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`h-11 px-3 rounded-xl border text-xs font-semibold transition-colors ${
              lowStockFilter
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Stock Crítico
          </button>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl h-11 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Producto
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Producto / Monodroga</th>
                <th className="p-4">Laboratorio</th>
                <th className="p-4">Condición</th>
                <th className="p-4">Stock Cajas</th>
                <th className="p-4">Fraccionamiento</th>
                <th className="p-4">Precios ($ / Bs / €)</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-500 text-xs"
                  >
                    Cargando inventario...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-500 text-xs"
                  >
                    No se encontraron productos registrados en inventario.
                  </td>
                </tr>
              ) : (
                inventory.map((item: PharmacyInventoryItem) => {
                  const isLowStock = item.package_stock <= item.min_stock_alert;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {item.medication?.name ||
                            item.active_ingredient ||
                            "Producto Farmacéutico"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.ean_code && <span>EAN: {item.ean_code}</span>}
                          {item.batch_number && (
                            <span>• Lote: {item.batch_number}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 text-xs font-medium">
                        {item.laboratory || "N/A"}
                      </td>
                      <td className="p-4">
                        {item.sale_condition === "controlled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
                            ● Controlado
                          </span>
                        ) : item.sale_condition === "prescription" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            Bajo Receta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                            Venta Libre
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {item.package_stock} Cajas
                          </span>
                          {isLowStock && (
                            <span
                              className="p-1 rounded-md bg-amber-100 text-amber-800"
                              title="Stock Crítico"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {item.allows_fractioning ? (
                          <span className="text-emerald-700 font-semibold">
                            Sí ({item.units_per_package}{" "}
                            {item.fraction_unit_name}s/caja) • Stock:{" "}
                            {item.fraction_stock} {item.fraction_unit_name}s
                          </span>
                        ) : (
                          <span className="text-slate-400">Solo Cajas</span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-900">
                        {item.prices_manual ? (
                          <span>
                            ${item.prices_manual.USD || 0} USD •{" "}
                            {item.prices_manual.VES || 0} Bs
                          </span>
                        ) : (
                          <span>${item.unit_price || 0} USD</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
          <div>
            Página {pagination.currentPage} de {pagination.lastPage} (
            {pagination.total} productos)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-200 bg-white text-slate-700 shadow-none rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-200 bg-white text-slate-700 shadow-none rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEditInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
