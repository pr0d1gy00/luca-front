"use client";

import { Users } from "lucide-react";

interface QuotesCardProps {
  count: number;
  change: string;
}

export function QuotesCard({ count, change }: QuotesCardProps) {
  // Overlapping avatars group - using initials
  const avatars = [
    { initials: "ML", bg: "bg-emerald-100" },
    { initials: "CP", bg: "bg-amber-100" },
    { initials: "JR", bg: "bg-blue-100" },
    { initials: "AS", bg: "bg-purple-100" },
  ];

  return (
    <div className="bg-stone-100/60 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-stone-500 text-sm font-medium">Cotizaciones</p>
          <p className="text-3xl font-bold text-[#1A3626] mt-1">{count}</p>
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-xs font-medium text-stone-500">{change}</span>
          </div>
        </div>
      </div>

      {/* Overlapping avatars */}
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {avatars.map((av, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white ${av.bg} text-[#1A3626]`}
            >
              {av.initials}
            </div>
          ))}
        </div>
        <span className="ml-3 text-xs text-stone-500">+12 este mes</span>
      </div>
    </div>
  );
}
