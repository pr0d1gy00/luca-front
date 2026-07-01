# Arquitectura de Base de Datos - LUCA Health OS

Este documento detalla la estructura lógica, decisiones de diseño y el propósito de cada una de las tablas del motor de datos de **LUCA Health OS**. La base de datos está implementada sobre **PostgreSQL** y diseñada para soportar un entorno médico de nivel empresarial (B2B2C) altamente relacional, seguro y auditable.

---

## 💡 Principios de Diseño y Decisiones Arquitectónicas

Antes de entrar al detalle de cada tabla, es fundamental entender los tres pilares de esta base de datos:

1. **El Modelo Organizacional (Sedes vs Marca):**
   Un gran error en sistemas de salud es asociar las citas o los registros clínicos a la "Clínica" como entidad legal única. En LUCA separamos esto en `Clinic` (entidad legal/fiscal) y `ClinicBranch` (sucursal física). Todo acto clínico (consultas, recetas, facturas, agendas) está amarrado a una **Sede (`clinicBranchId`)**. Esto permite la geolocalización precisa de los pacientes y la rotación eficiente de médicos entre sucursales.
2. **Normalización Geográfica Extrema:**
   Para habilitar en el futuro búsquedas y filtros ultra-precisos en el Marketplace (ej: *"Buscar farmacias que tengan X medicamento a menos de 5km"*), no usamos texto libre para direcciones. Toda dirección se amarra directamente a la tabla maestra `City`. 
3. **Esquema Híbrido (Relacional + JSONB):**
   Las historias clínicas varían según la especialidad del médico (un cardiólogo no mide lo mismo que un ginecólogo). En lugar de crear una base de datos con 400 columnas semi-vacías (Sparse Tables) o usar el anti-patrón EAV (Entity-Attribute-Value), implementamos un esquema híbrido: campos fijos para lo común y columnas `JSONB` indexadas para datos dinámicos y configuraciones de formularios.
4. **Cumplimiento Legal y Auditoría (HIPAA/GDPR):**
   Dado que manejamos datos de salud extremadamente sensibles, la base de datos incluye un sistema inmutable de `AuditLog` para registrar quién accede a qué datos y cuándo, además de un módulo KYC para profesionales.

---

## 1. Módulo: Geografía y Ubicación

Este módulo maestro normaliza la ubicación de pacientes, médicos, sedes y farmacias. Evita inconsistencias de tipeo y permite búsquedas geoespaciales.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Country`** | Almacena los países admitidos en el sistema. | Es el nodo raíz de la geografía. Guarda el código ISO para integraciones internacionales y el código telefónico para envíos automáticos de WhatsApp. |
| **`State`** | Almacena estados, departamentos o provincias. | Actúa como nivel intermedio de agrupación territorial. Depende directamente de un `Country`. |
| **`City`** | Almacena las ciudades. | **Es el único punto de unión geográfica con el resto de las entidades.** Para evitar anomalías, los perfiles de pacientes, sedes y farmacias apuntan a `City`, no a `State` ni a `Country`, ya que estos últimos se deducen a través de la relación relacional. |

---

## 2. Módulo: Identidad, Accesos y Roles

Gestiona quién es quién en el ecosistema, separando la identidad del paciente del flujo de trabajo de los profesionales.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`PatientAccount`** | Cuenta maestra global del paciente. | **Identidad B2B2C única.** Un paciente se registra una sola vez en LUCA (generalmente usando su número de teléfono de WhatsApp como llave única). Con esta cuenta única, el paciente puede acceder a su historial con diferentes médicos de forma integrada. |
| **`User`** | Usuarios profesionales (médicos, farmacéuticos, administradores de clínicas). | Gestiona las credenciales del personal que opera el sistema. Almacena campos clave como el `planType` (para el cobro de SaaS) y firmas/logos digitales necesarios para la validez de recetas y reportes. |
| **`Specialty`** | Catálogo global de especialidades médicas (ej: Pediatría, Cardiología). | Permite clasificar a los médicos en el directorio del marketplace y segmentar las plantillas de historias clínicas. |
| **`DoctorSpecialty`** | Relación de muchos a muchos entre `User` y `Specialty`. | Un médico puede tener múltiples especialidades (ej: Medicina Interna y Neumonología). Esta tabla rompe la relación N:N. |

---

## 3. Módulo: CRM de Pacientes (Fichas Médicas)

Representa la ficha del paciente dentro de la consulta privada de cada médico.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Patient`** | Ficha médica local de un paciente perteneciente a un doctor. | **El corazón del CRM médico.** Un paciente puede tener fichas médicas con distintos doctores (cada una con sus notas privadas, que otros médicos no pueden ver). Se enlaza opcionalmente a una `PatientAccount` global para permitir la exportación o consolidación de historiales con autorización del paciente. |

---

## 4. Módulo: Agenda y Turnos

Controla la planificación del tiempo y el flujo de pacientes.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Appointment`** | Agenda de citas médicas. | Permite estructurar los horarios de atención de los médicos en sedes específicas. Su `status` (pending, in-progress, completed, cancelled) es el motor que dibuja la lista de espera del día en la app del médico. |

---

## 5. Módulo: El Acto Clínico (SOAP) y Estudios

Este módulo representa el encuentro del médico con el paciente. Sigue el estándar internacional de notas médicas.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`FormTemplate`** | Plantillas de formularios dinámicos. | Permite a los doctores o clínicas diseñar su propia estructura de preguntas usando drag & drop. La configuración visual del formulario se guarda en un campo `schemaJson` (JSONB). |
| **`Consultation`** | Registro de la consulta médica (Notas SOAP). | **El núcleo del historial de salud.** Estructurado bajo el estándar SOAP (Subjetivo, Objetivo, Análisis, Plan). Cuenta con la columna `dynamicData` (JSONB) para almacenar las respuestas que correspondan a la plantilla elegida, sin forzar columnas innecesarias en la tabla. Está vinculada a una cita (`appointmentId`) y a una sede física. |
| **`VitalSign`** | Signos vitales capturados (Peso, tensión, etc.). | Relación **1:1 única** con `Consultation` para congelar el estado físico del paciente en ese encuentro. Incluye frecuencia cardíaca, respiratoria, saturación de oxígeno, temperatura y presión sistólica/diastólica. |
| **`LabRequest`** | Orden de exámenes de laboratorio. | Relación **1:1 única** con `Consultation`. Permite registrar qué exámenes solicitó el médico y sirve de ancla para que, en el futuro, el laboratorio suba los resultados digitales. |
| **`FollowUp`** | Seguimiento automatizado del paciente. | Se enlaza directamente a la `Consultation` para dar contexto al médico. Su propósito es programar envíos automáticos de WhatsApp (ej: *"¿Cómo sigues del dolor?"*) y capturar la respuesta del paciente. |

---

## 6. Módulo: Expediente Clínico Profundo (Antecedentes)

Tablas de registro histórico que no cambian con cada consulta, sino que componen el perfil permanente del paciente.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`MedicalBackground`** | Condiciones médicas crónicas e internaciones. | Relación **1:1** con `Patient`. Evita que el médico tenga que preguntar antecedentes crónicos en cada consulta. |
| **`SurgicalHistory`** | Historial de cirugías del paciente. | Relación **1:N** para registrar operaciones previas, fechas y hospitales. |
| **`FamilyHistory`** | Enfermedades hereditarias familiares. | Relación **1:N** para documentar qué patologías han sufrido padres, abuelos o hermanos. |
| **`Lifestyle`** | Hábitos del paciente (Fumar, alcohol, dieta, ejercicio). | Relación **1:1** con `Patient` para evaluar factores de riesgo conductuales. |
| **`ObstetricHistory`** | Antecedentes ginecológicos y obstétricos (Exclusivo mujeres). | Relación **1:1** con `Patient` para registrar embarazos, partos, cesáreas y fecha de última regla (FUM). |
| **`Vaccination`** | Registro de inmunizaciones. | Relación **1:N** para llevar el control de vacunas y dosis administradas. |

---

## 7. Módulo: Vademécum y Recetario

Gestiona los medicamentos e instrucciones de tratamiento.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Medication`** | Diccionario de medicamentos (Vademécum). | Si `userId` es `NULL`, el medicamento es del catálogo global del sistema. Si es `NOT NULL`, es un medicamento personalizado agregado por el doctor. Define principio activo, concentración y vía de administración. |
| **`Prescription`** | Receta médica o récipe emitido. | Es el contenedor de la prescripción. Tiene un `publicToken` único que viaja en un código QR para que la farmacia verifique la validez legal del documento sin autenticarse. |
| **`PrescriptionItem`** | Fármacos específicos recetados y su dosificación. | Relación **1:N** con `Prescription`. Especifica la dosis (ej: 1 tableta), frecuencia (cada 12h) y duración del tratamiento. |
| **`PrescriptionTemplate`** | Plantillas de recetas pre-configuradas. | Permite al médico guardar tratamientos comunes (ej: *"Tratamiento Amoxicilina Pediátrico"*) para recetarlos en un solo clic. |
| **`TemplateItem`** | Medicamentos dentro de la plantilla. | Relación **1:N** con la plantilla de receta. |
| **`MedicalDocument`** | Certificados, informes y referencias. | Documentos médicos formales distintos a las recetas. Cuentan con un `publicToken` para validaciones externas (ej: justificar un reposo ante una empresa). |

---

## 8. Módulo: Marketplace B2B2C

Módulo que conecta al paciente con farmacias y laboratorios para la cotización y compra de sus recetas.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`ProviderProfile`** | Perfil comercial de farmacias y laboratorios. | Relación **1:1** con `User` (cuando su rol es `PROVIDER`). Almacena sus datos fiscales (RIF), dirección física normalizada y estados de operación (`isOpen`, `isVerified`). |
| **`QuoteRequest`** | Solicitud de cotización de medicamentos o exámenes. | Creada por el paciente (a partir de una receta médica) para que el marketplace distribuya la solicitud a las farmacias cercanas que operen en la misma `cityId`. |
| **`QuoteOffer`** | Oferta de precio enviada por un proveedor. | Relación **1:N** con la solicitud. Almacena el precio cotizado (usando tipos `DECIMAL` para evitar problemas de precisión monetaria), moneda y condiciones de entrega. |

---

## 9. Módulo: Instituciones y Sedes

Estructura el modelo corporativo de franquicias, cooperativas de salud o clínicas independientes.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Clinic`** | Perfil legal del grupo médico o clínica. | Agrupa la marca y la información fiscal de nivel superior. |
| **`ClinicBranch`** | Sedes físicas del grupo médico. | **Punto de contacto real.** Representa el consultorio, hospital o sucursal. Almacena geolocalización precisa (latitud/longitud) e instrucciones de acceso. |
| **`ClinicBranchMember`** | Médicos y administrativos asignados a la sede. | Rompe la relación muchos a muchos entre usuarios y sedes. Permite documentar en qué departamento y número de consultorio atiende cada profesional en esa sucursal en particular. |

---

## 10. Módulo: Facturación y Cobros

Manejo contable de las consultas y transacciones del marketplace.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Invoice`** | Factura emitida por servicios médicos o medicamentos. | Registra la transacción contable. Se enlaza opcionalmente a la consulta o receta, y obligatoriamente a la sede física (`clinicBranchId`) para cumplir con regulaciones fiscales. |
| **`InvoiceItem`** | Conceptos detallados de la factura. | Relación **1:N** con la factura (`ON DELETE CASCADE`). Detalla cantidades y precios unitarios. |
| **`Payment`** | Pagos recibidos contra una factura. | Permite abonos parciales y múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, Pago Móvil, Seguro). |

---

## 11. Módulo: Operaciones y Cumplimiento

Asegura el funcionamiento fluido de la plataforma y el cumplimiento legal de seguridad de datos.

| Tabla | ¿Qué hace? | ¿Por qué está allí? (Propósito de Diseño) |
| :--- | :--- | :--- |
| **`Notification`** | Alertas in-app para los usuarios. | Mantiene el flujo activo de la plataforma avisando sobre nuevas cotizaciones, citas o recordatorios de seguimiento. |
| **`LabResult`** | Resultados subidos por los laboratorios. | Relación **1:1** con `LabRequest`. Permite al laboratorio subir los resultados estructurados (`JSONB`) y el archivo PDF definitivo para que el paciente y su doctor los consulten al instante. |
| **`PharmacyInventory`** | Stock y precios de medicamentos en farmacias. | Permite a las farmacias cargar su inventario. Ayuda a que el Marketplace cotice automáticamente sin que la farmacia tenga que responder de forma manual a cada mensaje. |
| **`AuditLog`** | Registro de accesos e histórico de cambios. | **Seguridad y cumplimiento HIPAA.** Registra cada lectura (`VIEW`), edición o eliminación de registros médicos, guardando la IP, el dispositivo y el detalle de qué datos se alteraron (`details` JSONB). Es inmutable. |
| **`VerificationDocument`** | Documentos KYC para verificación de cuentas profesionales. | Aloja títulos médicos, licencias y registros de comercio para que los administradores aprueben o rechacen el ingreso de nuevos profesionales a la plataforma. |
