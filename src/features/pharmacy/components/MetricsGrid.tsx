"use client";

import { SalesCard } from "./SalesCard";
import { QuotesCard } from "./QuotesCard";
import { StockAlertCard } from "./StockAlertCard";

interface MetricsGridProps {
  salesAmount: string;
  salesChange: string;
  quotesCount: number;
  quotesChange: string;
  stockItems: { name: string; quantity: number }[];
}

export function MetricsGrid({
  salesAmount,
  salesChange,
  quotesCount,
  quotesChange,
  stockItems,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SalesCard
        amount={salesAmount}
        change={salesChange}
        changeValue={salesChangeValue}
      />
      <QuotesCard count={quotesCount} change={quotesChange} />
      <StockAlertCard items={stockItems} />
    </div>
  );
}
