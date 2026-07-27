export interface MultiCurrencyPrice {
  USD?: number;
  VES?: number;
  EUR?: number;
}

export interface LabExamDetail {
  exam_name: string;
  price_usd?: number;
  notes?: string;
}

export interface LabQuoteOfferPayload {
  provider_profile_id: number;
  total_price_base: number;
  currency?: string;
  prices_manual?: MultiCurrencyPrice;
  items_detail?: LabExamDetail[];
  comments?: string;
}

export interface LabQuoteOffer {
  id: number;
  uuid: string;
  lab_request_id?: number;
  provider_profile_id?: number;
  total_price_base: number;
  currency: string;
  prices_manual?: MultiCurrencyPrice;
  items_detail?: LabExamDetail[];
  comments?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  created_at: string;
}

export interface LabAppointment {
  id: number;
  uuid: string;
  lab_quote_offer_id?: number;
  patient_id?: number;
  scheduled_date: string;
  time_slot?: string;
  status: "reserved" | "confirmed" | "sample_taken" | "completed" | "cancelled";
  notes?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export interface LabResultAttachment {
  file_name: string;
  file_url: string;
}

export interface LabResultPayload {
  lab_request_id?: number;
  patient_id?: number;
  file_url?: string;
  result_json?: Record<string, string>;
  attachments_json?: LabResultAttachment[];
  notes?: string;
  performed_at?: string;
}

export interface LabResultRecord {
  id: number;
  uuid: string;
  lab_request_id?: number;
  patient_id?: number;
  file_url?: string;
  result_json?: Record<string, string>;
  attachments_json?: LabResultAttachment[];
  notes?: string;
  reviewed_at?: string;
  email_sent_at?: string;
  status: string;
  performed_at?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export interface LabAnalyticsMetrics {
  most_requested_exams: Array<{ exam_name: string; requests_count: number }>;
  total_completed_results: number;
  top_patients: Array<{
    patient_id: number;
    patient_name: string;
    total_exams: number;
  }>;
  volume_breakdown: {
    internal: number;
    external: number;
    total: number;
  };
}
