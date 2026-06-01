"use client";

import { motion } from "motion/react";
import { staggerChildrenVariant } from "@/app/lib/animations";
import { Container } from "@/components/ui/Container";
import { usePharmacyKPIs } from "../hooks/usePharmacyKPIs";
import { usePharmacyOrders } from "../hooks/usePharmacyOrders";
import { usePharmacyNotifications } from "../hooks/usePharmacyNotifications";
import { KpiCards } from "./KpiCards";
import { OrderAgenda } from "./OrderAgenda";
import { QuickActions } from "./QuickActions";
import { CriticalNotifications } from "./CriticalNotifications";
import { PharmacyHeader } from "./PharmacyHeader";

export function PharmacyDashboard() {
  const kpis = usePharmacyKPIs();
  const orders = usePharmacyOrders();
  const notifications = usePharmacyNotifications();

  return (
    <Container variant="fluid" className="flex flex-col gap-12">
      <PharmacyHeader />

      <motion.div
        variants={staggerChildrenVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        <KpiCards kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OrderAgenda orders={orders} />
          </div>
          <div className="flex flex-col gap-6">
            <QuickActions />
            <CriticalNotifications notifications={notifications} />
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
