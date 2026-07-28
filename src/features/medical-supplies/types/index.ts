export interface MedicalSupplySettings {
  is_24_hours: boolean;
  working_days: string[];
  opening_time?: string;
  closing_time?: string;
  auto_matching_enabled: boolean;
}

export interface InventoryItem {
  id: number;
  provider_profile_id: number;
  item_name: string;
  sku: string;
  price_usd: number;
  price_bs: number;
  stock: number;
  is_active: boolean;
}

export interface DashboardStats {
  orders_accepted: number;
  orders_pending: number;
  orders_rejected: number;
  revenue_usd: number;
  revenue_bs: number;
}

export interface TopDemandedItem {
  item_name: string;
  sku: string;
  count: number;
}

export interface QuoteItemDetail {
  item: string; // SKU or plain text name
  qty: number;
  price_usd: number;
}

export interface QuotePayload {
  medical_supply_order_id: number;
  total_price: number;
  currency: "USD" | "BS" | "EUR";
  items_detail: QuoteItemDetail[];
}
