# LUCA Health OS — Documentation: Pharmacy API & Frontend Integration

> **Módulo de Farmacias (Pharmako / LUCA Health OS)**
> Versión: 1.0
> Fecha: 2026-07-27
> Ubicación API Backend: `/api/v1/pharmacy/*`

---

## 1. Visión General

El módulo de farmacias conecta la recepción de recetas médicas con la cotización de medicamentos, la gestión de inventario fraccionado/detallado, el upselling de productos de venta libre (OTC) y la confirmación diferida de stock.

### Reglas Clave de Dominio
1. **Cotización Ad-Hoc (Sin Inventario Previsto)**: Si la farmacia no tiene cargado un producto en inventario o prefiere no gestionar stock, puede cotizar libremente enviando `custom_product_name`.
2. **Sustitución Manual**: Cuando falta el medicamento prescripto, el farmacéutico selecciona el reemplazo en inventario (`substituted_inventory_id`) e indica la razón.
3. **Precios Multimoneda Manuales**: Cada cotización o producto permite enviar los importes explícitos en múltiples monedas (`prices_manual`: `{ "VES": 200, "USD": 40, "EUR": 34 }`), sin depender de conversiones automáticas.
4. **Venta Detallada / Fraccionada**: Soporte para vender por **Caja (`package`)** o por **Blíster/Unidad (`fraction`)**.
5. **Descuento de Stock Diferido**: Cotizar NO descuenta inventario. El stock se descuenta únicamente al confirmar la compra del cliente (`POST /api/v1/pharmacy/orders/{id}/confirm`).

---

## 2. Tipos e Interfaces de TypeScript (`src/features/pharmacy-dashboard/types/pharmacy.types.ts`)

```typescript
export type SaleCondition = 'free' | 'prescription' | 'controlled';
export type SellFormat = 'package' | 'fraction';
export type OrderStatus = 'pending' | 'confirmed' | 'dispensed' | 'cancelled';

export interface MultiCurrencyPriceMap {
  [currencyCode: string]: number; // Ej: { VES: 200, USD: 40, EUR: 34 }
}

export interface PharmacySetting {
  uuid: string;
  provider_id: number;
  auto_quoting_enabled: boolean;
  allow_partial_quotes: boolean;
  default_currency: string;
  custom_terms?: string;
  created_at: string;
  updated_at: string;
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
  custom_product_name?: string;    // Utilizado cuando no hay inventario cargado
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
```

---

## 3. Endpoints de la API Backend

Todos los endpoints requieren el header `Authorization: Bearer <token_farmacia>`.

### 3.1 Configuración de Farmacia (Modo Manual vs Automático)
- **GET `/api/v1/pharmacy/settings`**
  - Retorna las preferencias de la farmacia (`auto_quoting_enabled`, `default_currency`).
- **PUT `/api/v1/pharmacy/settings`**
  - **Body Payload**:
    ```json
    {
      "auto_quoting_enabled": false,
      "allow_partial_quotes": true,
      "default_currency": "USD",
      "custom_terms": "Entregas en 24 horas hábiles."
    }
    ```

### 3.2 Inventario Farmacéutico & Reportes
- **GET `/api/v1/pharmacy/inventory`**
  - **Query Params**: `search`, `sale_condition` (`free|prescription|controlled`), `low_stock` (`1|0`), `expiring_days` (`30|60|90`), `page`, `per_page`.
- **POST `/api/v1/pharmacy/inventory`**
  - **Body Payload**:
    ```json
    {
      "medication_id": 12,
      "ean_code": "7591001234567",
      "active_ingredient": "Acetaminofén",
      "laboratory": "Laboratorios Farmako",
      "sale_condition": "free",
      "allows_fractioning": true,
      "units_per_package": 10,
      "fraction_unit_name": "Blíster",
      "package_stock": 50,
      "fraction_stock": 4,
      "min_stock_alert": 5,
      "batch_number": "LOT-2026-X8",
      "expiration_date": "2027-12-31",
      "prices_manual": {
        "VES": 200,
        "USD": 40,
        "EUR": 34,
        "fraction_VES": 20,
        "fraction_USD": 4
      }
    }
    ```
- **PUT `/api/v1/pharmacy/inventory/{id}`**
  - Actualiza stock o datos del producto.
- **GET `/api/v1/pharmacy/inventory/reports/expirations?days=60`**
  - Listado de productos a vencer en los próximos N días.
- **GET `/api/v1/pharmacy/inventory/reports/controlled-books`**
  - Libro de controlados/psicotrópicos.

### 3.3 Cotización de Recetas (Manual, Ad-Hoc y Multimoneda)
- **GET `/api/v1/pharmacy/quote-requests`**
  - Listado de recetas recibidas para cotizar.
- **POST `/api/v1/pharmacy/quote-requests/{requestId}/offers`**
  - **Body Payload (Cotización mixta: Ad-hoc + Sustituto Manual + Multimoneda)**:
    ```json
    {
      "total_price_base": 40.00,
      "currency": "USD",
      "comments": "Disponible para entrega inmediata.",
      "items": [
        {
          "prescription_item_id": 101,
          "pharmacy_inventory_id": 45,
          "is_substituted": true,
          "substituted_inventory_id": 88,
          "substitution_reason": "Sin stock de marca original, se ofrece genérico bioequivalente de misma dosis.",
          "sell_format": "package",
          "quantity": 1,
          "prices_manual": {
            "VES": 200,
            "USD": 40,
            "EUR": 34
          }
        },
        {
          "prescription_item_id": 102,
          "custom_product_name": "Alcohol Antiséptico 70% 500ml",
          "sell_format": "fraction",
          "quantity": 2,
          "prices_manual": {
            "VES": 50,
            "USD": 10,
            "EUR": 8.5
          }
        }
      ]
    }
    ```

### 3.4 Motor de Upselling Asistido
- **GET `/api/v1/pharmacy/upsell-suggestions?active_ingredients[]=Amoxicilina`**
  - Retorna productos OTC complementarios sugeridos para agregar a la oferta.

### 3.5 Confirmación de Compra y Descuento Diferido de Stock
- **POST `/api/v1/pharmacy/orders/{orderId}/confirm`**
  - **Ejecuta el descuento real de stock en base de datos** al momento que el cliente confirma y paga el pedido.
