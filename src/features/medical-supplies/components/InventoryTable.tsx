"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { InventoryItem } from "../types";
import { useGetInventory } from "../hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Search, Filter, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";

export function InventoryTable() {
  const { data: inventory, isLoading } = useGetInventory();

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {row.getValue("sku")}
          </span>
        ),
      },
      {
        accessorKey: "item_name",
        header: "Product Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">
              {row.getValue("item_name")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "price_usd",
        header: "Price",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price_usd"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount);
          return <span className="text-sm text-slate-600 font-medium">{formatted}</span>;
        },
      },
      {
        accessorKey: "stock",
        header: "In Stock",
        cell: ({ row }) => {
          const stock = row.getValue("stock") as number;
          const isLowStock = stock <= 10 && stock > 0;
          return (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${stock === 0 ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-slate-700'}`}>
                {stock} u.
              </span>
              {isLowStock && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Low
                </span>
              )}
              {stock === 0 && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  Out
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
              )}
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: () => {
          return (
            <div className="flex justify-end">
              <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: inventory || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-4">
      {/* Table Header/Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-pharmako-care" />
            Inventory Stock
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your medical supplies and track stock levels in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care w-full sm:w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Main Card without shadows */}
      <Card className="border border-slate-200 shadow-none rounded-xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="h-11 text-xs font-semibold tracking-wide uppercase text-slate-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-pharmako-care border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-medium">Loading inventory...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Package className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-600">No items found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
