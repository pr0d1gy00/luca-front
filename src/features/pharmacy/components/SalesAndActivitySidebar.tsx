"use client";

import { TopVentas } from "./TopVentas";
import { ActivityTimeline } from "./ActivityTimeline";

interface SalesItem {
  name: string;
  amount: string;
  percentage: number;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  color: "emerald" | "amber" | "blue" | "stone";
}

interface SalesAndActivitySidebarProps {
  topVentas: SalesItem[];
  activity: ActivityItem[];
}

export function SalesAndActivitySidebar({
  topVentas,
  activity,
}: SalesAndActivitySidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <TopVentas items={topVentas} />
      <ActivityTimeline items={activity} />
    </div>
  );
}
