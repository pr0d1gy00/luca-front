"use client";

import { TrendingUp } from "lucide-react";

interface SalesCardProps {
  amount: string;
  change: string;
}

export function SalesCard({ amount, change }: SalesCardProps) {
  // Mock bar chart with different heights and opacities
  const bars = [
    { height: "h-8", opacity: "opacity-100" },
    { height: "h-12", opacity: "opacity-60" },
    { height: "h-6", opacity: "opacity-40" },
    { height: "h-16", opacity: "opacity-80" },
    { height: "h-10", opacity: "opacity-50" },
    { height: "h-14", opacity: "opacity-70" },
    { height: "h-4", opacity: "opacity-30" },
  ];

  return (
    <div className="bg-emerald-50/70 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-stone-500 text-sm font-medium">Ventas</p>
          <p className="text-3xl font-bold text-[#1A3626] mt-1">{amount}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">{change}</span>
          </div>
        </div>
      </div>

      {/* Mini bar chart simulation */}
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`w-full bg-[#1A3626] rounded-sm ${bar.height} ${bar.opacity}`}
          />
        ))}
      </div>
    </div>
  );
}
