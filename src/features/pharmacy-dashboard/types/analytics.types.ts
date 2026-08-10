export interface PharmacyAnalyticsData {
  overview: {
    inventory_value: number;
    inventory_value_trend: number;
    total_items: number;
    active_batches: number;
    expiring_alerts: number;
    expiring_days_threshold: number;
    processing_batches: number;
    pending_validations: number;
  };
  stock_distribution: {
    name: string;
    value: number;
    color: string;
  }[];
  top_brands: {
    name: string;
    count: number;
    percentage: number;
  }[];
  batch_ingestion: {
    mes: string;
    lotes: number;
    productos: number;
  }[];
}

export interface PharmacyAnalyticsFilters {
  sale_condition?: string;
  expiration_status?: string;
}
