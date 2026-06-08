"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { Truck, Store } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { PharmacyOrder } from "../types";

interface OrderItemProps {
  order: PharmacyOrder;
  onClick?: () => void;
}

const fulfillmentIcon = {
  delivery: Truck,
  presencial: Store,
};

export function OrderItem({ order, onClick }: OrderItemProps) {
  const { patientName, prescription, time, status, fulfillmentType } = order;
  const Icon = fulfillmentIcon[fulfillmentType];

  return (
    <motion.div
      variants={fadeUpVariant}
      onClick={onClick}
      className="rounded-xl p-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-slate-900 font-medium truncate">{patientName}</p>
          <p className="text-slate-500 text-sm">{prescription}</p>
          <p className="text-slate-400 text-sm">{time}</p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Icon className="w-4 h-4 text-slate-400" />
          <StatusBadge status={status} />
        </div>
      </div>
    </motion.div>
  );
}
