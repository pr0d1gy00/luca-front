# Documentación del Módulo de Laboratorios (LUCA Health OS)

Este documento contiene la especificación de contratos de la API REST del backend (`medicina/`), los tipos en TypeScript e interfaces necesarias para el consumo desde el Frontend (`luca-front`).

---

## 1. Endpoints de la API REST (`/api/v1/laboratory/*`)

### 1.1 Solicitudes de Exámenes y Cotizaciones
- `GET /api/v1/laboratory/requests`
  - **Propósito**: Listar peticiones de laboratorio pendientes emitidas por médicos o solicitadas por pacientes.
- `POST /api/v1/laboratory/requests/{requestId}/quotes`
  - **Propósito**: Enviar cotización manual multimoneda por el laboratorio.
  - **Payload Body**:
    ```json
    {
      "provider_profile_id": 1,
      "total_price_base": 45.00,
      "currency": "USD",
      "prices_manual": {
        "USD": 45.00,
        "VES": 2250.00,
        "EUR": 40.00
      },
      "items_detail": [
        {
          "exam_name": "Hemograma Completo",
          "price_usd": 15.00,
          "notes": "Ayuno de 8 horas requerido"
        },
        {
          "exam_name": "Perfil Lipídico",
          "price_usd": 30.00,
          "notes": "Ayuno de 12 horas"
        }
      ],
      "comments": "Retiro de muestra disponible en nuestra sede principal de 7:00 AM a 11:00 AM."
    }
    ```
- `POST /api/v1/laboratory/quotes/{offerId}/accept`
  - **Propósito**: Aceptar cotización por parte del paciente.

---

### 1.2 Logística y Reserva de Cupos por Fecha
- `POST /api/v1/laboratory/appointments/book`
  - **Propósito**: Reservar cupo por fecha para toma de muestra / atención.
  - **Payload Body**:
    ```json
    {
      "lab_quote_offer_id": 12,
      "scheduled_date": "2026-08-05",
      "time_slot": "08:30 AM",
      "notes": "Paciente prefiere atención matutina."
    }
    ```
- `GET /api/v1/laboratory/appointments?date=2026-08-05`
  - **Propósito**: Consultar agenda de cupos del día para el laboratorio.

---

### 1.3 Carga y Notificación de Resultados (Email + PDF)
- `POST /api/v1/laboratory/results`
  - **Propósito**: Registrar resultados del examen, adjuntar PDFs/imágenes y disparar notificación automática por email al paciente.
  - **Payload Body**:
    ```json
    {
      "lab_request_id": 5,
      "patient_id": 10,
      "file_url": "https://storage.luca.health/results/hemograma_10.pdf",
      "result_json": {
        "hemoglobina": "14.2 g/dL",
        "leucocitos": "6,500 /mm3",
        "plaquetas": "250,000 /mm3"
      },
      "attachments_json": [
        {
          "file_name": "ecografia_abdominal.png",
          "file_url": "https://storage.luca.health/attachments/eco_10.png"
        }
      ],
      "notes": "Parámetros dentro de los rangos normales de referencia.",
      "performed_at": "2026-07-27T10:00:00Z"
    }
    ```

---

### 1.4 Órdenes Externas ("Walk-in")
- `POST /api/v1/laboratory/external-orders`
  - **Propósito**: Registrar exámenes manuales de pacientes que ingresan directo al laboratorio fuera de la plataforma.
  - **Payload Body**:
    ```json
    {
      "external_patient_name": "Carlos Rodríguez",
      "external_patient_document": "V-18293041",
      "exams_list": ["Glicemia e Insulina basal", "Uroanálisis"],
      "instructions": "Orden presentada en físico en mostrador."
    }
    ```

---

### 1.5 Dashboard Analytics (Compra de Reactivos y Pacientes Frecuentes)
- `GET /api/v1/laboratory/analytics/metrics`
  - **Propósito**: Retornar indicadores clave para la compra de reactivos e insumos.
  - **Respuesta JSON**:
    ```json
    {
      "data": {
        "most_requested_exams": [
          { "exam_name": "Hemograma Completo", "requests_count": 142 },
          { "exam_name": "Perfil Lipídico", "requests_count": 98 }
        ],
        "total_completed_results": 320,
        "top_patients": [
          { "patient_id": 10, "patient_name": "María García", "total_exams": 8 }
        ],
        "volume_breakdown": {
          "internal": 240,
          "external": 80,
          "total": 320
        }
      }
    }
    ```

---

## 2. Tipos de TypeScript (`src/features/laboratory/types/laboratory.types.ts`)

```typescript
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
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

export interface LabAppointment {
  id: number;
  uuid: string;
  lab_quote_offer_id?: number;
  patient_id?: number;
  scheduled_date: string;
  time_slot?: string;
  status: 'reserved' | 'confirmed' | 'sample_taken' | 'completed' | 'cancelled';
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
}

export interface LabAnalyticsMetrics {
  most_requested_exams: Array<{ exam_name: string; requests_count: number }>;
  total_completed_results: number;
  top_patients: Array<{ patient_id: number; patient_name: string; total_exams: number }>;
  volume_breakdown: {
    internal: number;
    external: number;
    total: number;
  };
}
```
