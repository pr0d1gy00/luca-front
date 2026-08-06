"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { usePharmacyDashboard } from "../hooks/usePharmacyDashboard";
import { KpiCards } from "./KpiCards";
import { OrderAgenda } from "./OrderAgenda";
import { QuoteAgenda } from "./QuoteAgenda";
import { QuickActions } from "./QuickActions";
import { CriticalNotifications } from "./CriticalNotifications";
import { PharmacyGreeting } from "./PharmacyGreeting";

export function PharmacyDashboard() {
  const { data, isLoading } = usePharmacyDashboard();

  if (isLoading || !data) {
    return <div className="p-8 text-center text-slate-500">Cargando dashboard...</div>;
  }

  const { kpis, orders, notifications } = data;

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div variants={staggerChildrenVariant}>
        <PharmacyGreeting />
      </motion.div>

      <motion.div variants={staggerChildrenVariant}>
        <KpiCards kpis={kpis} />
      </motion.div>

      <motion.div
        variants={staggerChildrenVariant}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2">
          <QuoteAgenda limit={5} />
          <OrderAgenda orders={orders} />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActions />
          <CriticalNotifications notifications={notifications} />
        </div>
      </motion.div>
    </motion.div>
  );
}
