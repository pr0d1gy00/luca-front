export type SaleCondition = "free" | "prescription" | "controlled";
export type SellFormat = "package" | "fraction";
export type OrderStatus = "pending" | "confirmed" | "dispensed" | "cancelled";

export interface MultiCurrencyPriceMap {
  [currencyCode: string]: number; // Ej: { VES: 200, USD: 40, EUR: 34 }
}

export interface PharmacySetting {
  uuid: string;
  provider_id: number;
  auto_quoting_enabled: boolean;
  allow_partial_quotes: boolean;
  is_24_hours: boolean;
  delivery_radius_km: number;
  default_currency: string;
  custom_terms?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PharmacyInventoryItem {
  id: number;
  uuid: string;
  provider_id: number;
  medication_id: number;
  ean_code?: string;
  active_ingredient?: string;
  laboratory?: string;
  sale_condition: SaleCondition;
  batch_number?: string;
  expiration_date?: string;
  location_rack?: string;
  allows_fractioning: boolean;
  units_per_package: number;
  fraction_unit_name: string; // Ej: "Blíster", "Comprimido"
  package_stock: number;
  fraction_stock: number;
  stock: number;
  min_stock_alert: number;
  unit_price?: number;
  prices_manual?: MultiCurrencyPriceMap;
  medication?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface QuoteOfferItemPayload {
  prescription_item_id?: number;
  pharmacy_inventory_id?: number; // Nullable para ad-hoc
  custom_product_name?: string; // Para cotización libre sin inventario cargado
  is_substituted?: boolean;
  substituted_inventory_id?: number;
  substitution_reason?: string;
  sell_format: SellFormat;
  quantity: number;
  prices_manual?: MultiCurrencyPriceMap;
  notes?: string;
}

export interface CreateQuoteOfferPayload {
  total_price_base: number;
  currency: string;
  availability?: string;
  comments?: string;
  items: QuoteOfferItemPayload[];
}

export interface UpsellRuleSuggestion {
  id: number;
  uuid: string;
  trigger_active_ingredient: string;
  recommended_inventory_id: number;
  discount_percentage: number;
  recommendation_reason: string;
  recommended_inventory: PharmacyInventoryItem;
}

export interface PharmacyOrder {
  id: number;
  uuid: string;
  quote_offer_id?: number;
  provider_id: number;
  patient_account_id?: number;
  status: OrderStatus;
  selected_currency_payment?: MultiCurrencyPriceMap;
  stock_deducted: boolean;
  confirmed_at?: string;
  items?: PharmacyOrderItem[];
}

export interface PharmacyOrderItem {
  id: number;
  pharmacy_order_id: number;
  pharmacy_inventory_id?: number;
  product_name: string;
  sell_format: SellFormat;
  quantity: number;
  unit_prices_manual?: MultiCurrencyPriceMap;
}
