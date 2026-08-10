"use client";

import React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fadeUpVariant } from "@/app/lib/animations";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-slate-200"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 py-2 font-bold text-slate-700 bg-slate-50/80 tracking-wider text-xs uppercase"
                  >
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-pharmako-care" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <motion.tr
                    key={row.id}
                    variants={fadeUpVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 group bg-white"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                  {row.getIsExpanded() && renderSubComponent ? (
                    <motion.tr
                      key={`${row.id}-expanded`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="bg-slate-50/30 border-b border-slate-100 overflow-hidden"
                    >
                      <TableCell colSpan={columns.length} className="p-0">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </motion.tr>
                  ) : null}
                </React.Fragment>
              ))}
            </AnimatePresence>
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-slate-500 font-medium"
              >
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
