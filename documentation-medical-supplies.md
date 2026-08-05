# Medical Supplies API Documentation

Esta documentación detalla los endpoints desarrollados en el backend para la gestión de Casas de Insumos Médicos (Medical Supplies). Estos endpoints se ubican bajo el prefijo `/api/v1/medical-supply` y deben consumirse desde el frontend asegurando que el usuario esté autenticado (`auth:sanctum`) y cuente con los roles correctos (`MANAGER` o `SALES_REP` en su perfil asociado).

## 1. Configuración de Operaciones (Settings)

Gestiona los días laborables, el horario y la capacidad de auto-matching.

### Obtener Configuración
- **Método**: `GET`
- **Ruta**: `/api/v1/medical-supply/settings`
- **Rol requerido**: `MANAGER`, `SALES_REP`
- **Respuesta Exitosa (200)**:
  ```json
  {
    "is_24_hours": true,
    "working_days": ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    "opening_time": "08:00:00",
    "closing_time": "18:00:00",
    "auto_matching_enabled": true
  }
  ```

### Actualizar Configuración
- **Método**: `PUT`
- **Ruta**: `/api/v1/medical-supply/settings`
- **Rol requerido**: `MANAGER`
- **Payload**:
  ```json
  {
    "is_24_hours": false,
    "working_days": ["Lunes", "Martes", "Miercoles"],
    "opening_time": "09:00",
    "closing_time": "17:00",
    "auto_matching_enabled": true
  }
  ```

---

## 2. Personal (Staff)

Gestión de usuarios asociados a la casa de insumos y sus roles.

### Listar Empleados
- **Método**: `GET`
- **Ruta**: `/api/v1/medical-supply/staff`
- **Rol requerido**: `MANAGER`

### Asignar Rol a Usuario
- **Método**: `POST`
- **Ruta**: `/api/v1/medical-supply/staff`
- **Rol requerido**: `MANAGER`
- **Payload**:
  ```json
  {
    "user_id": 15,
    "role": "SALES_REP"
  }
  ```

---

## 3. Inventario (Inventory)

Gestión de ítems disponibles en la casa de insumos, vital si la funcionalidad `auto_matching_enabled` está activada.

### Listar Inventario
- **Método**: `GET`
- **Ruta**: `/api/v1/medical-supply/inventory`
- **Rol requerido**: `MANAGER`, `SALES_REP`

### Crear/Agregar Ítem
- **Método**: `POST`
- **Ruta**: `/api/v1/medical-supply/inventory`
- **Rol requerido**: `MANAGER`
- **Payload**:
  ```json
  {
    "item_name": "Surgical Mask",
    "sku": "MSK-001",
    "price_usd": 10.50,
    "price_bs": 380.00,
    "stock": 500,
    "is_active": true
  }
  ```

---

## 4. Cotizaciones (Quotes / Auto-Matching)

Estos endpoints manejan la creación de las ofertas (QuoteOffers) generadas en respuesta a una orden médica (MedicalSupplyOrder).

### Emitir Presupuesto Manual
- **Método**: `POST`
- **Ruta**: `/api/v1/medical-supply/quotes/manual`
- **Rol requerido**: `MANAGER`, `SALES_REP`
- **Payload**:
  ```json
  {
    "medical_supply_order_id": 12,
    "total_price": 50.00,
    "currency": "USD",
    "items_detail": [
      { "item": "MSK-001", "qty": 5, "price_usd": 10.00 }
    ]
  }
  ```

### Forzar Auto-Matching de Orden (Action Interno/Explícito)
Este endpoint busca una orden pendiente, lee el inventario de la casa de insumos (si está activado) y emite un `QuoteOffer` de forma automática si todos los items existen en su inventario.
- **Método**: `POST`
- **Ruta**: `/api/v1/medical-supply/quotes/auto-match/{order_id}`
- **Rol requerido**: `MANAGER`, `SALES_REP`

---

## 5. Panel de Control (Dashboard)

Endpoints de solo lectura diseñados para proveer KPIs gerenciales a la casa de insumos.

### Estadísticas Generales
- **Método**: `GET`
- **Ruta**: `/api/v1/medical-supply/dashboard/stats`
- **Rol requerido**: `MANAGER`
- **Descripción**: Retorna la cantidad de órdenes aceptadas, pendientes, rechazadas y las ganancias (revenue) totalizadas por moneda.

### Productos más demandados
- **Método**: `GET`
- **Ruta**: `/api/v1/medical-supply/dashboard/top-demanded`
- **Rol requerido**: `MANAGER`
- **Descripción**: Retorna una lista agregada de los ítems más frecuentemente incluidos en los despachos completados o cotizaciones generadas.
