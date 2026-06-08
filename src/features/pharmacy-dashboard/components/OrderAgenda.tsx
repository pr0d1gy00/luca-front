"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { ClipboardList } from "lucide-react";
import { OrderItem } from "./OrderItem";
import { PrescriptionSheet } from "./PrescriptionSheet";
import { usePharmacyPrescription } from "../hooks/usePharmacyPrescription";
import type { PharmacyOrder } from "../types";

interface OrderAgendaProps {
  orders: PharmacyOrder[];
}

export function OrderAgenda({ orders }: OrderAgendaProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prescription = usePharmacyPrescription(selectedId);
  const isEmpty = orders.length === 0;

  return (
    <>
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <div className="bg-pharmako-care-light rounded-lg p-1.5">
            <ClipboardList className="w-4 h-4 text-pharmako-care" />
          </div>
          Órdenes del Día
        </h3>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <ClipboardList className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">
              No hay órdenes pendientes para hoy
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerChildrenVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {orders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onClick={() => setSelectedId(order.id)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      <PrescriptionSheet
        prescription={prescription}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
