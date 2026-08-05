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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InventoryTable() {
  const { data: inventory, isLoading } = useGetInventory();

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "item_name",
        header: "Name",
      },
      {
        accessorKey: "price_usd",
        header: "Price (USD)",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("price_usd"));
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount);
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
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

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <Card className="border-slate-100 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-slate-900">Inventory Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-slate-500">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-slate-700">
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
                    className="h-24 text-center text-slate-500"
                  >
                    No items in inventory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
