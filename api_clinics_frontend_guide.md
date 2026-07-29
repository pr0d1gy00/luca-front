# Documentación de API: Módulo de Clínicas (Frontend Guide)

Este documento contiene la especificación de los endpoints del módulo de Clínicas desarrollados en el backend (Laravel) y que deben ser consumidos por el frontend (Next.js).

**Base URL:** `https://api.lucahealth.os/api/v1/clinics/{branch_id}`
**Autenticación:** Requiere token Bearer (Usuario autenticado con rol en la clínica).

## 1. Organización de la Clínica (Organization)

Permite gestionar la estructura interna de la sucursal.

### `GET /departments`
- **Descripción:** Lista los departamentos de la clínica.
- **Respuesta (200):** Array de objetos `{ id, branch_id, name, description, is_active }`.

### `POST /departments`
- **Descripción:** Crea un nuevo departamento.
- **Body:** `{ name: string, description: string (opcional) }`
- **Respuesta (201):** Objeto del departamento creado.

### `GET /roles`
- **Descripción:** Lista los roles disponibles en la clínica (ej: Cirujano, Enfermero Jefe, Administrador).
- **Respuesta (200):** Array de roles `{ id, branch_id, name, permissions (json) }`.

### `POST /roles`
- **Descripción:** Crea un nuevo rol.
- **Body:** `{ name: string, permissions: array }`
- **Respuesta (201):** Objeto del rol creado.

### `GET /services`
- **Descripción:** Lista los servicios tarifados que la clínica ofrece (ej: Noche de Cuidados Intensivos, Derecho a Pabellón).
- **Respuesta (200):** Array de servicios `{ id, name, category, price, currency }`.

### `POST /services`
- **Descripción:** Registra un nuevo servicio en la clínica.
- **Body:** `{ name: string, category: string, price: numeric, currency: string }`
- **Respuesta (201):** Objeto del servicio creado.

---

## 2. Gestión de Personal (Staff)

Permite que la clínica invite médicos y que el personal esté asociado a la sucursal.

### `GET /staff`
- **Descripción:** Lista todo el personal asociado a la sucursal.
- **Respuesta (200):** Array de personal (con relación al `user` y `clinic_role`).

### `POST /staff`
- **Descripción:** Agrega un usuario (ej. médico) al personal de la clínica. (Invitación o asignación directa).
- **Body:** `{ user_id: uuid, clinic_role_id: uuid, status: enum('PENDING', 'ACTIVE', 'INACTIVE') }`
- **Respuesta (201):** Objeto `ClinicStaff`.

### `PUT /staff/{id}`
- **Descripción:** Actualiza el rol o estado de un miembro del personal (ej. el médico acepta la invitación pasando de `PENDING` a `ACTIVE`).
- **Body:** `{ clinic_role_id: uuid (opcional), status: string (opcional) }`
- **Respuesta (200):** Objeto actualizado.

---

## 3. Hospitalización (Inpatient)

Gestión de pacientes ingresados, camas y tratamientos.

### `GET /rooms`
- **Descripción:** Lista las habitaciones y camas de la sucursal.
- **Filtros opcionales:** `?status=AVAILABLE`
- **Respuesta (200):** Array de habitaciones, incluyendo camas anidadas (`beds`).

### `GET /admissions`
- **Descripción:** Lista de ingresos hospitalarios (pacientes internados).
- **Filtros opcionales:** `?status=ACTIVE`
- **Respuesta (200):** Array de admisiones con detalles del paciente y cama asignada.

### `POST /admissions`
- **Descripción:** Ingresa un paciente a una cama libre de la clínica.
- **Body:** `{ patient_account_id: uuid, clinic_bed_id: uuid, admission_date: datetime, reason: string }`
- **Respuesta (201):** Admisión creada.

### `POST /admissions/{admission_id}/treatment-notes`
- **Descripción:** Registra notas y evoluciones médicas para el paciente ingresado.
- **Body:** `{ doctor_id: uuid, note: string, type: string }`
- **Respuesta (201):** Nota creada.

### `POST /admissions/{admission_id}/medications`
- **Descripción:** Agenda y registra los medicamentos administrados durante la estadía.
- **Body:** `{ medication_id: uuid, dosage: string, frequency: string, scheduled_time: time }`
- **Respuesta (201):** Registro de medicamento.

### `POST /admissions/{admission_id}/service-charges`
- **Descripción:** Carga cobros a la estadía del paciente (ej: exámenes, material descartable, días de cama).
- **Body:** `{ service_id: uuid, quantity: int, unit_price: numeric, total: numeric }`
- **Respuesta (201):** Cargo registrado.

---

## 4. Planificación Quirúrgica (Surgical Planning)

Operaciones, equipos quirúrgicos e insumos.

### `GET /operations`
- **Descripción:** Lista las operaciones agendadas.
- **Respuesta (200):** Array de operaciones.

### `POST /operations`
- **Descripción:** Programa una nueva cirugía.
- **Body:** `{ patient_account_id: uuid, room_id: uuid, scheduled_date: datetime, estimated_duration: int, status: string }`
- **Respuesta (201):** Operación creada.

### `GET /operations/{operation_id}/recent-history`
- **Descripción:** **Regla de negocio:** Permite a la clínica acceder a las historias clínicas, consultas y tratamientos previos del paciente, **solo si son menores a un mes y se realizaron en esa misma clínica**.
- **Respuesta (200):** Array consolidado con historial.

### `POST /operations/{operation_id}/team`
- **Descripción:** Asigna doctores y enfermeras a la operación.
- **Body:** `{ staff_id: uuid, role_in_surgery: string (ej: 'LEAD_SURGEON', 'ANESTHESIOLOGIST') }`
- **Respuesta (201):** Miembro asignado.

### `GET /supply-orders`
- **Descripción:** Lista de solicitudes de insumos generadas.
- **Respuesta (200):** Array de listas/récipes.

### `POST /supply-orders`
- **Descripción:** Genera una solicitud/récipe para insumos (laboratorio, farmacia o casa de insumos quirúrgicos) vinculada a una operación.
- **Body:** `{ operation_id: uuid, provider_type: enum('PHARMACY', 'LAB', 'MEDICAL_SUPPLY'), items: array }`
- **Respuesta (201):** Orden creada.

### `POST /supply-orders/{order_id}/emit`
- **Descripción:** Emite (envía o confirma) la solicitud externa para que las casas de insumos la preparen.
- **Respuesta (200):** Estado actualizado a `EMITTED`.
