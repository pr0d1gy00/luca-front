import { useGetDashboardStats } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";

export function DashboardCards() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return <div>Loading dashboard stats...</div>;
  }

  const statItems = [
    {
      title: "Pending Orders",
      value: stats.orders_pending,
      icon: Clock,
      color: "text-amber-500",
    },
    {
      title: "Accepted Orders",
      value: stats.orders_accepted,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      title: "Rejected Orders",
      value: stats.orders_rejected,
      icon: XCircle,
      color: "text-red-500",
    },
    {
      title: "Revenue (USD)",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(stats.revenue_usd),
      icon: DollarSign,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <Card key={index} className="border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {item.title}
            </CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
