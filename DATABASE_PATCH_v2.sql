-- ============================================================
-- TABLAS URGENTES PARA LUCA HEALTH OS
-- Alineadas con los tipos del frontend (codegraph-verified)
-- ============================================================

-- ---------------------------------------------------------
-- 1. CATÁLOGO DE MEDICAMENTOS
-- ---------------------------------------------------------

CREATE TABLE Medication (
  id              VARCHAR PRIMARY KEY,
  userId          VARCHAR,                    -- NULL = catálogo global LUCA; NOT NULL = personal del doctor
  activePrinciple VARCHAR NOT NULL,           -- Ej: "Amoxicilina"
  concentration   VARCHAR NOT NULL,           -- Ej: "500mg", "4mg/ml", "1g"
  presentation    VARCHAR NOT NULL CHECK (presentation IN (
                    'CAPSULA', 'TABLETA', 'JARABE', 'GOTAS', 'AMPOLLA', 'CREMA'
                  )),
  administrationRoute VARCHAR NOT NULL CHECK (administrationRoute IN (
                    'ORAL', 'INTRAVENOSA', 'INTRAMUSCULAR', 'TOPICA', 'OFTALMICA'
                  )),
  commercialName  VARCHAR,                    -- Nombre comercial opcional (ej: "Amoxil")
  isActive        BOOLEAN DEFAULT TRUE,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Un doctor no puede duplicar el mismo medicamento
CREATE UNIQUE INDEX idx_medication_unique
  ON Medication(userId, activePrinciple, concentration, presentation, administrationRoute);

-- ---------------------------------------------------------
-- 2. CITAS / AGENDA
-- ---------------------------------------------------------

CREATE TABLE Appointment (
  id              VARCHAR PRIMARY KEY,
  patientId       VARCHAR NOT NULL,
  doctorId        VARCHAR NOT NULL,           -- User con role=DOCTOR
  clinicId        VARCHAR,                    -- Opcional: si es en una clínica
  date            DATE NOT NULL,
  time            VARCHAR NOT NULL,           -- Ej: "09:30"
  type            VARCHAR NOT NULL,           -- Ej: "Control general", "Cardiología"
  status          VARCHAR NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  notes           TEXT,                       -- Notas internas del doctor
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (patientId) REFERENCES Patient(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId)  REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (clinicId)  REFERENCES Clinic(id) ON DELETE SET NULL
);

CREATE INDEX idx_appointment_doctor_date ON Appointment(doctorId, date);
CREATE INDEX idx_appointment_patient     ON Appointment(patientId);
CREATE INDEX idx_appointment_clinic      ON Appointment(clinicId);

-- ---------------------------------------------------------
-- 3. MEJORAS A TABLAS EXISTENTES
-- ---------------------------------------------------------

-- 3a. Agregar status a Consultation
ALTER TABLE Consultation
  ADD COLUMN status VARCHAR NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled'));

-- 3b. Agregar quantity y notes a PrescriptionItem
ALTER TABLE PrescriptionItem
  ADD COLUMN quantity INT DEFAULT 1,
  ADD COLUMN notes VARCHAR;

-- 3c. Cambiar medication (texto libre) por medicationId (FK a Medication)
-- Paso 1: agregar la columna FK
ALTER TABLE PrescriptionItem
  ADD COLUMN medicationId VARCHAR;

-- Paso 2: migrar datos existentes (asumiendo medication contiene el nombre)
-- UPDATE PrescriptionItem pi
-- SET medicationId = (SELECT id FROM Medication m WHERE m.activePrinciple || ' ' || m.concentration = pi.medication LIMIT 1);

-- Paso 3: hacer obligatoria y agregar FK
-- ALTER TABLE PrescriptionItem ALTER COLUMN medicationId SET NOT NULL;
ALTER TABLE PrescriptionItem
  ADD FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE RESTRICT;

-- Paso 4: eliminar columna vieja (después de migrar)
-- ALTER TABLE PrescriptionItem DROP COLUMN medication;

-- ---------------------------------------------------------
-- 4. DATOS SEED DEL CATÁLOGO GLOBAL
-- ---------------------------------------------------------

INSERT INTO Medication (id, activePrinciple, concentration, presentation, administrationRoute, commercialName) VALUES
  ('med-001', 'Amoxicilina',   '500mg',    'CAPSULA',  'ORAL',       'Amoxil'),
  ('med-002', 'Ibuprofeno',    '400mg',    'TABLETA',  'ORAL',       NULL),
  ('med-003', 'Paracetamol',   '500mg/ml', 'JARABE',   'ORAL',       NULL),
  ('med-004', 'Cloranfenicol', '0.5%',     'GOTAS',    'OFTALMICA',  NULL),
  ('med-005', 'Betametasona',  '0.05%',    'CREMA',    'TOPICA',     NULL),
  ('med-006', 'Omeprazol',     '20mg',     'CAPSULA',  'ORAL',       NULL),
  ('med-007', 'Metformina',    '850mg',    'TABLETA',  'ORAL',       NULL),
  ('med-008', 'Losartán',      '50mg',     'TABLETA',  'ORAL',       NULL),
  ('med-009', 'Dexametasona',  '4mg/ml',   'AMPOLLA',  'INTRAVENOSA', NULL),
  ('med-010', 'Ceftriaxona',   '1g',       'AMPOLLA',  'INTRAMUSCULAR', NULL),
  ('med-011', 'Ranitidina',    '50mg/2ml', 'AMPOLLA',  'INTRAVENOSA', NULL),
  ('med-012', 'Ketorolaco',    '30mg/ml',  'AMPOLLA',  'INTRAMUSCULAR', NULL);

-- ---------------------------------------------------------
-- 5. RESUMEN DE CAMBIOS
-- ---------------------------------------------------------
-- 
-- ✅ Medication     — Catálogo de medicamentos (global + personal)
-- ✅ Appointment    — Citas/agenda del doctor
-- ✅ Consultation.status — Flujo de consulta (pending → in-progress → completed)
-- ✅ PrescriptionItem.quantity — Cantidad de unidades
-- ✅ PrescriptionItem.notes — Observaciones del médico
-- ✅ PrescriptionItem.medicationId — FK a Medication (reemplaza texto libre)
