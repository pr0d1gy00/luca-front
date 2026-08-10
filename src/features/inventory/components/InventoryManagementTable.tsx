"use client";

import { useState, useMemo } from "react";
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
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export function InventoryManagementTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [saleCondition, setSaleCondition] = useState<string>("");
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<PharmacyInventoryItem | null>(null);

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

  const columns: ColumnDef<PharmacyInventoryItem, any>[] = useMemo(() => {
    return [
      {
        id: "product",
        header: "Producto / Monodroga",
        accessorFn: (row) => row.medication?.name || row.active_ingredient || "Producto Farmacéutico",
        cell: (info) => {
          const item = info.row.original;
          return (
            <div>
              <div className="font-bold text-slate-900">{info.getValue() as string}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                {item.ean_code && <span>EAN: {item.ean_code}</span>}
                {item.batch_number && <span>• Lote: {item.batch_number}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "laboratory",
        header: "Laboratorio",
        cell: (info) => <span className="text-slate-700 text-xs font-medium">{(info.getValue() as string) || "N/A"}</span>,
      },
      {
        accessorKey: "sale_condition",
        header: "Condición",
        cell: (info) => {
          const condition = info.getValue() as string;
          if (condition === "controlled") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
                ● Controlado
              </span>
            );
          }
          if (condition === "prescription") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                Bajo Receta
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
              Venta Libre
            </span>
          );
        },
      },
      {
        accessorKey: "package_stock",
        header: "Stock Cajas",
        cell: (info) => {
          const item = info.row.original;
          const isLowStock = item.package_stock <= item.min_stock_alert;
          return (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{item.package_stock} Cajas</span>
              {isLowStock && (
                <span className="p-1 rounded-md bg-amber-100 text-amber-800" title="Stock Crítico">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "fractioning",
        header: "Fraccionamiento",
        cell: (info) => {
          const item = info.row.original;
          return item.allows_fractioning ? (
            <span className="text-emerald-700 font-semibold text-xs">
              Sí ({item.units_per_package} {item.fraction_unit_name}s/caja) • Stock: {item.fraction_stock} {item.fraction_unit_name}s
            </span>
          ) : (
            <span className="text-slate-400 text-xs">Solo Cajas</span>
          );
        },
      },
      {
        id: "prices",
        header: "Precios ($ / Bs / €)",
        cell: (info) => {
          const item = info.row.original;
          return (
            <span className="text-xs font-medium text-slate-900">
              {item.prices_manual ? (
                <span>
                  ${item.prices_manual.USD || 0} USD • {item.prices_manual.VES || 0} Bs
                </span>
              ) : (
                <span>${item.unit_price || 0} USD</span>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right w-full">Acciones</div>,
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditModal(item)}
                className="text-pharmako-primary hover:text-pharmako-primary-hover hover:bg-pharmako-primary/10 transition-colors duration-150"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          );
        },
      },
    ];
  }, [handleOpenEditModal]);

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
        <DataTable columns={columns} data={inventory} isLoading={isLoading} />
      </div>

      {/* Pagination & Modals */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-500">
          Mostrando {inventory.length} de {pagination?.total || 0} productos
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none h-8 px-3"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={
              isLoading || !pagination || page >= (pagination.lastPage || 1)
            }
            className="border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none h-8 px-3"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
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
