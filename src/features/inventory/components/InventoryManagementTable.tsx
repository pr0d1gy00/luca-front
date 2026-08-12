"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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

          let displayName = item.active_ingredient || "Producto Farmacéutico";
          let details = "";
          let commercialName = "";

          if (item.medication) {
            displayName = item.medication.active_principle || item.medication.name || displayName;
            if (item.medication.concentration) {
              displayName += ` ${item.medication.concentration}`;
            }
            if (item.medication.presentation) {
              details = item.medication.presentation;
            }
            if (item.medication.commercial_name || item.medication.commercialName) {
              commercialName = item.medication.commercial_name || item.medication.commercialName;
            }
          }

          return (
            <div className="flex items-start gap-3 py-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  info.row.toggleExpanded();
                }}
                className={`mt-1 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${
                  info.row.getIsExpanded() 
                    ? "bg-pharmako-care text-white" 
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                }`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${info.row.getIsExpanded() ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-[15px] tracking-tight">{displayName}</span>
                  {commercialName && (
                    <span className="text-pharmako-care text-[10px] uppercase font-bold tracking-wider border border-pharmako-care/20 bg-pharmako-care/5 px-2 py-0.5 rounded-sm">
                      {commercialName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  {details && <span className="font-medium text-slate-600">{details}</span>}
                  {item.ean_code && (
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      EAN: {item.ean_code}
                    </span>
                  )}
                  {item.batch_number && (
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      LOTE: {item.batch_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "laboratory",
        header: "Laboratorio",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">
              {((info.getValue() as string) || "N")[0].toUpperCase()}
            </div>
            <span className="text-slate-600 text-sm font-medium">{(info.getValue() as string) || "Genérico"}</span>
          </div>
        ),
      },
      {
        accessorKey: "sale_condition",
        header: "Condición",
        cell: (info) => {
          const condition = info.getValue() as string;
          if (condition === "controlled") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Controlado
              </span>
            );
          }
          if (condition === "prescription") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Receta
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Libre
            </span>
          );
        },
      },
      {
        accessorKey: "package_stock",
        header: () => <div className="text-right">Stock Cajas</div>,
        cell: (info) => {
          const item = info.row.original;
          const isLowStock = item.package_stock <= item.min_stock_alert;
          const stockPercentage = Math.min(100, (item.package_stock / (item.min_stock_alert * 3)) * 100);
          
          return (
            <div className="flex flex-col items-end gap-1.5 w-24 ml-auto">
              <div className="flex items-center justify-end gap-1.5">
                <span className={`font-semibold text-sm ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
                  {item.package_stock}
                </span>
                <span className="text-xs text-slate-400">cajas</span>
                {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </div>
              {/* Visual Stock Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.max(5, stockPercentage)}%` }}
                />
              </div>
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
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-pharmako-care font-bold text-sm">
                  {item.fraction_stock}
                </span>
                <span className="text-slate-500 text-xs font-medium lowercase">
                  {item.fraction_unit_name}s
                </span>
              </div>
              <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                <div className="w-3 h-3 rounded bg-slate-100 flex items-center justify-center border border-slate-200 text-[8px] text-slate-500">
                  {item.units_per_package}
                </div>
                u/caja
              </span>
            </div>
          ) : (
            <span className="text-slate-300 text-xs font-medium italic">No aplica</span>
          );
        },
      },
      {
        id: "prices",
        header: () => <div className="text-right">Precios</div>,
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex flex-col items-end">
              {item.prices_manual ? (
                <>
                  <span className="font-semibold text-slate-900 text-[15px]">${item.prices_manual.USD || 0}</span>
                  <span className="text-[11px] text-slate-400 font-medium tracking-wide">Bs {item.prices_manual.VES || 0}</span>
                </>
              ) : (
                <span className="font-semibold text-slate-900 text-[15px]">${item.unit_price || 0}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right w-full"></div>,
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenEditModal(item);
                }}
                className="group flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 hover:border-pharmako-care hover:bg-pharmako-care/5 transition-all"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-pharmako-care transition-colors" />
              </button>
            </div>
          );
        },
      },
    ];
  }, [handleOpenEditModal]);

  return (
    <div className="space-y-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por monodroga, marca o EAN..."
              className="pl-10 h-10 border-slate-200 rounded-lg bg-white shadow-none text-[13px] text-slate-900 focus:border-pharmako-care focus-visible:ring-1 focus-visible:ring-pharmako-care/50 placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <select
              value={saleCondition}
              onChange={(e) => setSaleCondition(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 focus:outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care/50 cursor-pointer"
            >
              <option value="">Todas las condiciones</option>
              <option value="prescription">Bajo Receta</option>
              <option value="free">Venta Libre (OTC)</option>
              <option value="controlled">Psicotrópicos (Controlados)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`h-10 px-4 rounded-lg border text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 ${lowStockFilter
              ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockFilter ? 'text-amber-500' : 'text-slate-400'}`} />
            Stock Crítico
          </button>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-pharmako-care text-white font-semibold hover:bg-pharmako-care-hover shadow-none rounded-lg h-10 px-5 text-[13px] tracking-wide"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar Producto
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
        <DataTable
          columns={columns}
          data={inventory}
          isLoading={isLoading}
          renderSubComponent={({ row }) => {
            const item = row.original;
            return (
              <div className="px-6 py-5 bg-slate-50/50 flex flex-col sm:flex-row gap-8">
                {/* Detalles del Producto */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Información Adicional</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Ubicación / Estantería</p>
                      <p className="text-sm font-semibold text-slate-700">{item.location_rack || "No especificada"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Vencimiento</p>
                      <p className={`text-sm font-semibold ${item.expiration_date ? "text-slate-700" : "text-slate-400 italic"}`}>
                        {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('es-VE') : "No registrado"}
                      </p>
                    </div>
                    {item.medication?.commercial_name && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Nombre Comercial Sugerido</p>
                        <p className="text-sm font-semibold text-slate-700">{item.medication.commercial_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen de Precios Multi-Moneda */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pharmako-care/50"></div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pricing</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">USD</p>
                      <p className="text-lg font-bold text-emerald-600 tracking-tight">${item.prices_manual?.USD || item.unit_price || 0}</p>
                    </div>
                    <div className="flex flex-col justify-center border-l border-slate-100 pl-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VES</p>
                      <p className="text-sm font-bold text-slate-700 tracking-tight">Bs {item.prices_manual?.VES || 0}</p>
                    </div>
                    <div className="flex flex-col justify-center border-l border-slate-100 pl-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">EUR</p>
                      <p className="text-sm font-bold text-slate-700 tracking-tight">€ {item.prices_manual?.EUR || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
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
