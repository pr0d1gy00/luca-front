"use client";

interface SalesItem {
  name: string;
  amount: string;
  percentage: number;
}

interface TopVentasProps {
  items: SalesItem[];
}

export function TopVentas({ items }: TopVentasProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-stone-700">Top Ventas</h3>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">{item.name}</span>
              <span className="text-xs font-medium text-[#1A3626]">{item.amount}</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A3626]/70 rounded-full transition-all"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
