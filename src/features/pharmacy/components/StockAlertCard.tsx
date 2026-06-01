"use client";

import { AlertTriangle } from "lucide-react";

interface StockItem {
  name: string;
  quantity: number;
}

interface StockAlertCardProps {
  items: StockItem[];
}

export function StockAlertCard({ items }: StockAlertCardProps) {
  return (
    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-stone-500 text-sm font-medium">Stock Crítico</p>
          <p className="text-3xl font-bold text-[#1A3626] mt-1">{items.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-500">Requieren atención</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-stone-700">{item.name}</span>
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              {item.quantity} uds
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
