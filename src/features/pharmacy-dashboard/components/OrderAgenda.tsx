"use client";

import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { ClipboardList } from "lucide-react";
import { OrderItem } from "./OrderItem";
import type { PharmacyOrder } from "../types";

interface OrderAgendaProps {
  orders: PharmacyOrder[];
}

export function OrderAgenda({ orders }: OrderAgendaProps) {
  const isEmpty = orders.length === 0;

  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-luca-primary" />
        Órdenes del Día
      </h3>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-luca-muted">
          <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">
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
            <OrderItem key={order.id} order={order} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
