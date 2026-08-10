# LUCA Health OS - Base de Datos Completa (Consolidado)

> **Documento de Referencia de Base de Datos**
> Consolidación de todos los schemas (Fases 1 a 6 y módulos adicionales).
> Contiene la explicación del propósito ("por qué y para qué") de cada tabla para comprender el modelo de negocio.
> Última actualización: Julio 2026

---

## Tabla de Contenidos

1. [Normalización Geográfica](#1-normalización-geográfica)
2. [Identidad de Pacientes](#2-identidad-de-pacientes)
3. [Usuarios, Doctores y Especialidades](#3-usuarios-doctores-y-especialidades)
4. [Clínicas, Sucursales y Staff](#4-clínicas-sucursales-y-staff)
5. [Servicios y Hospitalización (Inpatient)](#5-servicios-y-hospitalización)
6. [Quirófanos y Cirugías](#6-quirófanos-y-cirugías)
7. [Proveedores (Farmacias y Laboratorios)](#7-proveedores-farmacias-y-laboratorios)
8. [Agenda, Citas y Consultas (SOAP)](#8-agenda-citas-y-consultas-soap)
9. [Antecedentes Médicos y Vademécum](#9-antecedentes-médicos-y-vademécum)
10. [Marketplace B2B2C y B2B](#10-marketplace-b2b2c-y-b2b)
11. [Insumos Médicos (Medical Supplies)](#11-insumos-médicos)
12. [Facturación, Pagos y Auditoría](#12-facturación-pagos-y-auditoría)

---

## 1. Normalización Geográfica

**Por qué y para qué:**
Para estandarizar las ubicaciones en todo el sistema. Permite buscar doctores, clínicas o farmacias por ciudad sin problemas de texto libre.

*   `countries`: Países soportados. (PK: id, name, code)
*   `states`: Estados/Provincias. (PK: id, FK: countryId)
*   `cities`: Ciudades. Entidad principal de enlace. (PK: id, FK: stateId)

---

## 2. Identidad de Pacientes

**Por qué y para qué:**
Separar la identidad del paciente (quien recibe el servicio) de los usuarios del sistema (quienes operan el sistema). Un paciente usa OTP (teléfono) o email para entrar.

*   `patient_accounts`: Cuenta de acceso del paciente. Contiene teléfono (login), email, passwordHash (opcional), status.
*   `patients`: Perfil médico e información demográfica vinculada a una cuenta. 

---

## 3. Usuarios, Doctores y Especialidades

**Por qué y para qué:**
Gestión de los profesionales de la salud, administradores y personal de proveedores que usan el OS.

*   `users`: Tabla central de acceso al sistema (Doctores, Admins, Proveedores). Maneja email, password, role y plan de suscripción.
*   `specialties`: Catálogo maestro de especialidades médicas (Cardiología, Pediatría, etc).
*   `doctor_specialty` (Pivote): Relaciona un `User` (Doctor) con múltiples `Specialty`.

---

## 4. Clínicas, Sucursales y Staff

**Por qué y para qué:**
Arquitectura multi-tenant para que una marca de clínica (`Clinic`) tenga múltiples sedes físicas (`ClinicBranch`) y organice a su personal en departamentos.

*   `clinics`: La organización o marca matriz (ej: "Clínica San José").
*   `clinic_branches`: Las sedes físicas reales de la clínica. Contienen dirección, coordenadas y ciudad.
*   `clinic_departments`: Departamentos dentro de una sucursal (ej: "Emergencia", "Cardiología").
*   `clinic_roles`: Roles personalizados de la clínica para control de permisos granulares.
*   `clinic_staff` / `clinic_branch_members`: Relaciona a los `Users` con la sucursal y su departamento/rol.

---

## 5. Servicios y Hospitalización

**Por qué y para qué:**
Permitir que las clínicas manejen pacientes internados (Inpatient), gestionen camas y facturen servicios brindados en las instalaciones.

*   `clinic_services`: Catálogo de servicios que ofrece una clínica (Consultas, Rayos X, Terapia).
*   `hospitalization_rooms`: Habitaciones de la clínica (ej: "Piso 3, Cuidados Intensivos").
*   `hospital_beds`: Camas individuales dentro de una habitación, rastreando su estado (Ocupada, Limpieza, Libre).
*   `hospital_admissions`: Registro del ingreso de un paciente (fecha de entrada, alta médica, cama asignada).
*   `inpatient_treatment_notes`: Notas de evolución médica diarias para pacientes hospitalizados.
*   `inpatient_medication_schedules`: Cronograma de administración de medicamentos (kardex de enfermería).
*   `service_requests` / `service_charges`: Solicitudes y cargos económicos por servicios prestados al paciente hospitalizado.

---

## 6. Quirófanos y Cirugías

**Por qué y para qué:**
Orquestar las intervenciones quirúrgicas, reservando espacios físicos y asignando al equipo humano.

*   `surgical_operations`: Registro principal de la cirugía (Paciente, Fecha, Procedimiento, Quirófano).
*   `surgical_teams`: Personal médico asignado a una cirugía (Cirujano principal, Anestesiólogo, Enfermera instrumentista).

---

## 7. Proveedores (Farmacias y Laboratorios)

**Por qué y para qué:**
Perfiles B2B que ofrecen productos o servicios a los pacientes (B2B2C) y clínicas (B2B).

*   `provider_profiles`: Perfil matriz del proveedor, indica si es `PHARMACY` o `LABORATORY`.
*   `provider_branches`: Sedes físicas del proveedor, esencial para logística local y geolocalización de entregas.
*   `pharmacy_inventory_batches`: Lotes o facturas de ingreso masivo, agrupando documentos/fotos de respaldo de compras.
*   `pharmacy_inventories`: Control de stock, lotes, precios (con impuestos) y referencias a `pharmacy_inventory_batches`. Permite carga manual con campos libres.
*   `pharmacy_sku_mappings`: Tabla de homologación (ACL). Traduce los SKUs sucios de los sistemas de farmacia (ej: A2, Profit) al ID universal de LUCA.
*   `pharmacy_settings`: Configuraciones de la farmacia (horarios, rangos de entrega).
*   `lab_settings`: Configuraciones y catálogo de pruebas de los laboratorios.

---

## 8. Agenda, Citas y Consultas (SOAP)

**Por qué y para qué:**
El núcleo del flujo clínico ambulatorio. Agenda la cita y luego permite registrar la historia médica del encuentro.

*   `appointments` / `lab_appointments`: Reservas de tiempo en la agenda del doctor o del laboratorio.
*   `consultations`: El acto médico en sí. Usa metodología SOAP (Subjective, Objective, Assessment, Plan). Se vincula 1:1 a una cita.
*   `vital_signs`: Registro de signos vitales capturados durante la consulta.
*   `lab_requests` / `lab_results`: Órdenes de laboratorio generadas en la consulta y los resultados subidos por el laboratorio.
*   `form_templates`: Plantillas JSON para construir formularios dinámicos especializados por rama médica.

---

## 9. Antecedentes Médicos y Vademécum

**Por qué y para qué:**
Mantener el historial longitudinal del paciente y un catálogo estandarizado de medicamentos para recetar sin errores.

*   `medical_backgrounds`: Antecedentes patológicos crónicos (Diabetes, HTA).
*   `surgical_histories`: Cirugías previas del paciente.
*   `family_histories`: Antecedentes genéticos/familiares.
*   `medications`: Vademécum de la plataforma (Principios activos, concentración, presentación).
*   `prescriptions`: La receta médica generada, con firma y vigencia.
*   `prescription_items`: Cada medicamento recetado con su dosis e indicaciones.

---

## 10. Marketplace B2B2C y B2B

**Por qué y para qué:**
Conectar la necesidad del paciente (receta u orden de lab) o la necesidad de la clínica (insumos) con los proveedores.

*   `quote_requests`: Solicitud de cotización lanzada por un paciente (basado en una receta).
*   `quote_offers` / `lab_quote_offers`: Ofertas enviadas por farmacias/laboratorios respondiendo a una solicitud, con precios y disponibilidad.
*   `quote_offer_items`: Detalle línea por línea de lo que ofrece la farmacia.
*   `upsell_rules`: Reglas para sugerir productos adicionales (ej: Si compra antibiótico, sugerir probiótico).
*   `pharmacy_orders` / `pharmacy_order_items`: Pedidos B2B directos (Clínica comprando a Farmacia) con estados logísticos.

---

## 11. Insumos Médicos (Medical Supplies)

**Por qué y para qué:**
Módulo dedicado a mayoristas o fabricantes de equipos médicos (jeringas, gasas, máquinas) para abastecer a Clínicas (B2B puro).

*   `medical_supply_settings`: Configuración del proveedor de insumos (Políticas, envíos).
*   `medical_supply_staff`: Empleados autorizados para operar la cuenta del proveedor.
*   `medical_supply_inventories`: Inventario físico de insumos (Catálogo B2B).
*   `medical_supply_quote_offers`: Respuestas a licitaciones o cotizaciones de clínicas.
*   `medical_supply_orders`: Órdenes de compra aprobadas, facturadas y despachadas a las clínicas.

---

## 12. Facturación, Pagos y Auditoría

**Por qué y para qué:**
Cerrar el ciclo económico de las atenciones y cumplir normativas de privacidad (HIPAA).

*   `invoices`: Facturas emitidas por consultas, hospitalizaciones o compras en el marketplace.
*   `invoice_items`: Líneas de la factura.
*   `payments`: Transacciones financieras (Tarjeta, Zelle, Seguro) asociadas a una factura.
*   `audit_logs`: Trazabilidad total de quién vio, editó o eliminó qué registro médico sensible (exigido por HIPAA).
*   `verification_documents`: Documentos para el proceso de KYC (Know Your Customer) de doctores y farmacias para prevenir fraude (Licencias médicas, RIF).

---
*Fin del Documento.*
