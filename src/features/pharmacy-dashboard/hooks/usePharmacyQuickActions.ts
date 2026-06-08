import { Plus, Package, MessageSquare } from "lucide-react";
import type { PharmacyQuickAction } from "../types";

export function usePharmacyQuickActions(): PharmacyQuickAction[] {
  return [
    {
      id: "pa-1",
      label: "Nueva Orden",
      icon: Plus,
      href: "/pharmacy/orders/new",
      variant: "primary",
    },
    {
      id: "pa-2",
      label: "Ver Inventario",
      icon: Package,
      href: "/pharmacy/inventory",
      variant: "secondary",
    },
    {
      id: "pa-3",
      label: "Mensajes",
      icon: MessageSquare,
      href: "/pharmacy/messages",
      variant: "outline",
    },
  ];
}
