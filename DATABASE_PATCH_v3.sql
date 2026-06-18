-- ============================================================
-- LUCA HEALTH OS — PATCH v3: MÓDULOS CRÍTICOS + MEJORAS RÁPIDAS
-- ============================================================
-- 
-- v3 (2026-06-09):
--   🟢 PharmacyInventory  — Stock de farmacias/boticas
--   🟢 LabResult           — Resultados de exámenes de laboratorio
--   🟢 Invoice + InvoiceItem + Payment — Facturación y pagos
--   🟢 AuditLog            — Trazabilidad HIPAA/GDPR
--   ⚪ Patient: +emergencyContactName, +emergencyContactPhone
--   ⚪ Medication: +requiresPrescription, +contraindications
-- ============================================================

-- ---------------------------------------------------------
-- 1. INVENTARIO DE FARMACIAS
-- ---------------------------------------------------------
-- Cada ProviderProfile (PHARMACY) puede tener stock de medicamentos.
-- Un registro por combinación provider-medicamento-lote.

CREATE TABLE PharmacyInventory (
  id              VARCHAR PRIMARY KEY,
  providerId      VARCHAR NOT NULL,            -- FK → ProviderProfile
  medicationId    VARCHAR NOT NULL,            -- FK → Medication
  stock           INT NOT NULL DEFAULT 0,
  minStockAlert   INT DEFAULT 10,              -- Umbral para alerta de reabastecimiento
  batchNumber     VARCHAR,                     -- Número de lote
  expirationDate  DATE,                        -- Fecha de vencimiento del lote
  unitPrice       DECIMAL(10,2),               -- Precio unitario para cotizaciones
  
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (providerId)   REFERENCES "ProviderProfile"(id) ON DELETE CASCADE,
  FOREIGN KEY (medicationId) REFERENCES "Medication"(id)         ON DELETE CASCADE,

  -- Una farmacia no puede tener dos registros del mismo lote
  UNIQUE (providerId, medicationId, batchNumber)
);

CREATE INDEX idx_inventory_provider   ON "PharmacyInventory"(providerId);
CREATE INDEX idx_inventory_medication ON "PharmacyInventory"(medicationId);
CREATE INDEX idx_inventory_expiration ON "PharmacyInventory"(expirationDate)
  WHERE expirationDate IS NOT NULL;

-- ---------------------------------------------------------
-- 2. RESULTADOS DE LABORATORIO
-- ---------------------------------------------------------
-- Vinculado 1:1 con LabRequest. Guarda los valores del análisis
-- en JSONB para flexibilidad (ej: {glucosa: 90, colesterol: 180}).

CREATE TABLE LabResult (
  id              VARCHAR PRIMARY KEY,
  labRequestId    VARCHAR NOT NULL UNIQUE,     -- FK → LabRequest (1:1)
  patientId       VARCHAR NOT NULL,            -- FK → Patient (desnormalizado para queries)
  
  fileUrl         VARCHAR,                     -- URL del PDF con el informe completo
  resultJson      JSONB,                       -- Resultados estructurados (flexible por tipo de examen)
  notes           TEXT,                        -- Notas del bioanalista / técnico
  
  reviewedBy      VARCHAR,                     -- FK → User (médico que revisó los resultados)
  reviewedAt      TIMESTAMP,
  
  status          VARCHAR NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'COMPLETED', 'ABNORMAL', 'CANCELLED')),
  performedAt     TIMESTAMP,                   -- Fecha real de la toma de muestra / análisis
  
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (labRequestId) REFERENCES "LabRequest"(id) ON DELETE CASCADE,
  FOREIGN KEY (patientId)    REFERENCES "Patient"(id)     ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy)   REFERENCES "User"(id)        ON DELETE SET NULL
);

CREATE INDEX idx_lab_result_patient ON "LabResult"(patientId);
CREATE INDEX idx_lab_result_status  ON "LabResult"(status);

-- ---------------------------------------------------------
-- 3. FACTURACIÓN Y PAGOS
-- ---------------------------------------------------------

-- 3a. Factura (puede vincularse opcionalmente a consulta y/o receta)
CREATE TABLE Invoice (
  id              VARCHAR PRIMARY KEY,
  userId          VARCHAR NOT NULL,            -- FK → User (médico o clínica que factura)
  patientId       VARCHAR NOT NULL,            -- FK → Patient
  consultationId  VARCHAR,                     -- FK → Consultation (opcional)
  prescriptionId  VARCHAR,                     -- FK → Prescription (opcional)
  
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax             DECIMAL(10,2) DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency        VARCHAR NOT NULL DEFAULT 'USD',
  
  status          VARCHAR NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN (
                      'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'
                    )),
  dueDate         DATE,
  notes           TEXT,
  
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (userId)         REFERENCES "User"(id)         ON DELETE RESTRICT,
  FOREIGN KEY (patientId)      REFERENCES "Patient"(id)       ON DELETE RESTRICT,
  FOREIGN KEY (consultationId) REFERENCES "Consultation"(id)  ON DELETE SET NULL,
  FOREIGN KEY (prescriptionId) REFERENCES "Prescription"(id)  ON DELETE SET NULL
);

CREATE INDEX idx_invoice_user    ON "Invoice"(userId);
CREATE INDEX idx_invoice_patient ON "Invoice"(patientId);
CREATE INDEX idx_invoice_status  ON "Invoice"(status);
CREATE INDEX idx_invoice_due     ON "Invoice"(dueDate) WHERE status IN ('SENT', 'PARTIALLY_PAID');

-- 3b. Línea de factura (ítems facturados)
CREATE TABLE InvoiceItem (
  id              VARCHAR PRIMARY KEY,
  invoiceId       VARCHAR NOT NULL,            -- FK → Invoice
  description     VARCHAR NOT NULL,            -- Ej: "Consulta general", "Amoxicilina 500mg"
  quantity        INT NOT NULL DEFAULT 1,
  unitPrice       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,

  FOREIGN KEY (invoiceId) REFERENCES "Invoice"(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_item_invoice ON "InvoiceItem"(invoiceId);

-- 3c. Pago (una factura puede tener múltiples pagos parciales)
CREATE TABLE Payment (
  id              VARCHAR PRIMARY KEY,
  invoiceId       VARCHAR NOT NULL,            -- FK → Invoice
  amount          DECIMAL(10,2) NOT NULL,
  method          VARCHAR NOT NULL
                    CHECK (method IN ('CASH', 'CARD', 'TRANSFER', 'INSURANCE', 'OTHER')),
  reference       VARCHAR,                     -- Número de referencia de la transacción
  paidAt          TIMESTAMP DEFAULT NOW(),
  notes           TEXT,

  FOREIGN KEY (invoiceId) REFERENCES "Invoice"(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_invoice ON "Payment"(invoiceId);

-- ---------------------------------------------------------
-- 4. AUDITORÍA (HIPAA / GDPR)
-- ---------------------------------------------------------
-- Registra cada acceso o modificación a datos sensibles de pacientes.
-- Indispensable para compliance en health tech.

CREATE TABLE AuditLog (
  id              VARCHAR PRIMARY KEY,
  userId          VARCHAR,                     -- FK → User (quién realizó la acción)
  patientId       VARCHAR,                     -- FK → Patient (de quién son los datos)
  action          VARCHAR NOT NULL
                    CHECK (action IN (
                      'VIEW', 'CREATE', 'UPDATE', 'DELETE',
                      'EXPORT', 'LOGIN', 'LOGOUT', 'PRINT'
                    )),
  resource        VARCHAR NOT NULL,            -- Ej: "Consultation:abc123"
  resourceType    VARCHAR NOT NULL,            -- Ej: "Consultation", "Prescription", "Patient"
  details         JSONB,                       -- Metadatos: {changedFields: [...], oldValues: {...}}
  ipAddress       VARCHAR,
  userAgent       VARCHAR,
  createdAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (userId)    REFERENCES "User"(id)    ON DELETE SET NULL,
  FOREIGN KEY (patientId) REFERENCES "Patient"(id) ON DELETE SET NULL
);

-- Índices para consultas frecuentes de auditoría
CREATE INDEX idx_audit_user     ON "AuditLog"(userId);
CREATE INDEX idx_audit_patient  ON "AuditLog"(patientId);
CREATE INDEX idx_audit_resource ON "AuditLog"(resourceType, resource);
CREATE INDEX idx_audit_created  ON "AuditLog"(createdAt DESC);

-- ---------------------------------------------------------
-- 5. MEJORAS RÁPIDAS A TABLAS EXISTENTES
-- ---------------------------------------------------------

-- 5a. Agregar contactos de emergencia a Patient
-- (El frontend ya tiene estos campos en el schema de Zod)
ALTER TABLE "Patient"
  ADD COLUMN "emergencyContactName"  VARCHAR,
  ADD COLUMN "emergencyContactPhone" VARCHAR;

-- 5b. Agregar seguridad clínica a Medication
ALTER TABLE "Medication"
  ADD COLUMN "requiresPrescription" BOOLEAN DEFAULT TRUE,
  ADD COLUMN "contraindications"    TEXT;

-- ---------------------------------------------------------
-- 6. RESUMEN DE CAMBIOS v3
-- ---------------------------------------------------------
--
-- 🟢 CRÍTICOS (4 tablas nuevas):
--    PharmacyInventory  → Stock y precios de farmacias
--    LabResult          → Resultados de exámenes (completa LabRequest)
--    Invoice            → Facturación médica
--    InvoiceItem        → Ítems/detalle de factura
--    Payment            → Registro de pagos
--    AuditLog           → Trazabilidad de accesos (compliance)
--
-- ⚪ MEJORAS (2 ALTER TABLE):
--    Patient            → +emergencyContactName, +emergencyContactPhone
--    Medication         → +requiresPrescription, +contraindications
--
-- Total: 6 CREATE TABLE + 2 ALTER TABLE
