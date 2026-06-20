# Documentación de API: Autenticación, Registro y Catálogos (Fase 1)

Este documento detalla exhaustivamente todos los endpoints del backend en la **Fase 1**. Sirve como especificación técnica definitiva para la integración del cliente (Agente Frontend) con el servidor Laravel.

---

## Consideraciones Arquitectónicas Generales

### 1. Sistema Multi-Guard (JWT)
El backend implementa dos ecosistemas de autenticación independientes con sus respectivos guardas JWT:
* **Ecosistema de Pacientes (`patient_api`)**: Rutas bajo el prefijo `/api/v1/auth/patients/`.
* **Ecosistema de Usuarios (`user_api`)**: Rutas bajo el prefijo `/api/v1/auth/users/`. Para Doctores, Proveedores (Farmacias, Laboratorios) y Administradores.

Ambos guardas devuelven el token en formato Bearer:
```http
Authorization: Bearer <access_token>
```

### 2. Idempotencia Obligatoria (`Idempotency-Key`)
Todas las peticiones `POST` (tanto registros, logins, refrescos de token y cierres de sesión) requieren obligatoriamente el header `Idempotency-Key` en la petición.
* **Header:** `Idempotency-Key: <UUIDv4>`
* **Fallo:** Si se omite, el backend responderá con `400 Bad Request`.

### 3. Carga de Archivos (KYC/Registro)
Los registros de doctores y proveedores procesan subida de documentos binarios. Por lo tanto, el frontend **debe** consumir estos endpoints utilizando el tipo de contenido `multipart/form-data`. Los campos del formulario deben mapearse según se detalla a continuación.

---

## 1. Ecosistema de Pacientes

### A. Registro de Paciente
Crea una nueva cuenta de paciente y realiza el login automático devolviendo el token.
* **Endpoint:** `POST /api/v1/auth/patients/register`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "full_name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "phone": "+584141234567",
  "password": "PasswordSeguro123",
  "national_id": "V-12345678",
  "username": "juanperez",
  "city_id": "d76d93a9-7ccb-420d-8094-7568734300c3"
}
```
* **Validaciones (422):**
  * `full_name`: Requerido, string, max: 255.
  * `email`: Opcional, string, formato email, único en `patient_accounts`.
  * `phone`: Requerido, string, max: 20, único en `patient_accounts`.
  * `password`: Opcional, string, min: 8.
  * `national_id`: Opcional, string, max: 50, único en `patient_accounts`.
  * `username`: Opcional, string, max: 50, único en `patient_accounts`.
  * `city_id`: Opcional, UUID, debe existir en la tabla `cities`.

* **Respuesta de Éxito (201 Created / 200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### B. Inicio de Sesión de Paciente
* **Endpoint:** `POST /api/v1/auth/patients/login`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "email": "juan.perez@email.com",
  "password": "PasswordSeguro123"
}
```
* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```
* **Respuesta de Error de Credenciales (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### C. Obtener Datos del Paciente Autenticado (Me)
* **Endpoint:** `GET /api/v1/auth/patients/me`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "id": 1,
  "uuid": "4392e21e-d4c3-4d43-8a3c-b1b7470fcf10",
  "phone": "+584141234567",
  "email": "juan.perez@email.com",
  "full_name": "Juan Pérez",
  "avatar_url": null,
  "national_id": "V-12345678",
  "username": "juanperez",
  "city_id": "d76d93a9-7ccb-420d-8094-7568734300c3",
  "created_at": "2026-06-20T16:12:00.000000Z",
  "updated_at": "2026-06-20T16:12:00.000000Z"
}
```

---

### D. Refrescar Token (Patient)
* **Endpoint:** `POST /api/v1/auth/patients/refresh`
* **Headers:** `Authorization: Bearer <token_expirado>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs... (Nuevo Token)",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### E. Cierre de Sesión (Patient)
* **Endpoint:** `POST /api/v1/auth/patients/logout`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

---

## 2. Ecosistema de Usuarios (Doctores y Proveedores)

### A. Registro de Doctor Médico
* **Endpoint:** `POST /api/v1/auth/users/register/doctor`
* **Content-Type:** `multipart/form-data`
* **Request Payload (Form-Data):**
  * `full_name` (string, requerido): Nombre del médico.
  * `email` (string, requerido): Email único.
  * `password` (string, requerido): Mínimo 8 caracteres.
  * `phone` (string, opcional): Teléfono administrativo.
  * `city_id` (UUID, opcional): ID de la ciudad seleccionada.
  * `specialty_ids[0]` (UUID, requerido): Primer elemento del array de especialidades.
  * `specialty_ids[1]` (UUID, opcional): Siguientes elementos del array.
  * `medical_license` (file, requerido): Documento de licencia médica (pdf, jpg, png, max: 10MB).

* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### B. Registro de Proveedor (Farmacia / Laboratorio)
* **Endpoint:** `POST /api/v1/auth/users/register/provider`
* **Content-Type:** `multipart/form-data`
* **Request Payload (Form-Data):**
  * `full_name` (string, requerido): Nombre del propietario/representante.
  * `email` (string, requerido): Email único.
  * `password` (string, requerido): Mínimo 8 caracteres.
  * `phone` (string, opcional): Teléfono comercial.
  * `city_id` (UUID, opcional): ID de la ciudad.
  * `commercial_name` (string, requerido): Nombre comercial del negocio.
  * `provider_type` (string, requerido): Debe ser `PHARMACY` o `LABORATORY`.
  * `rif` (string, requerido): RIF único del negocio.
  * `business_document` (file, requerido): Documento del registro mercantil o RIF (pdf, jpg, png, max: 10MB).

* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### C. Inicio de Sesión de Usuario (Médicos/Proveedores)
* **Endpoint:** `POST /api/v1/auth/users/login`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "email": "doctor@email.com",
  "password": "PasswordSeguro123"
}
```
* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```
* **Respuesta de Error de Credenciales (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### D. Obtener Datos del Usuario Autenticado (Me)
* **Endpoint:** `GET /api/v1/auth/users/me`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "id": 1,
  "uuid": "ee3b8602-545c-4be2-9382-3dbb72c1e602",
  "email": "doctor@email.com",
  "full_name": "Dr. Carlos Mendoza",
  "phone": "+584121112233",
  "role": "DOCTOR",
  "is_active": true,
  "plan_type": "FREE",
  "logo_url": null,
  "signature_url": null,
  "city_id": "d76d93a9-7ccb-420d-8094-7568734300c3",
  "created_at": "2026-06-20T16:15:00.000000Z",
  "updated_at": "2026-06-20T16:15:00.000000Z"
}
```

---

### E. Refrescar Token (User)
* **Endpoint:** `POST /api/v1/auth/users/refresh`
* **Headers:** `Authorization: Bearer <token_expirado>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs... (Nuevo Token)",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### F. Cierre de Sesión (User)
* **Endpoint:** `POST /api/v1/auth/users/logout`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta de Éxito (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

---

## 3. Catálogos Públicos (Sin Autenticación)

### A. Catálogo de Ciudades
* **Endpoint:** `GET /api/v1/locations/cities`
* **Respuesta de Éxito (200 OK):**
```json
{
  "data": [
    {
      "id": "d76d93a9-7ccb-420d-8094-7568734300c3",
      "name": "Caracas",
      "state": {
        "id": "c99e45f4-db8e-43cc-9406-40df0326e442",
        "name": "Distrito Capital"
      },
      "country": {
        "id": "1e6e44fe-d226-472f-af23-91a2ce3fe002",
        "name": "Venezuela",
        "code": "VE"
      }
    },
    {
      "id": "6c6c7616-10f4-4ce1-a290-43bce49ebcd6",
      "name": "Los Teques",
      "state": {
        "id": "ebf14cc4-4ac6-4f55-ab53-01074fc198ca",
        "name": "Miranda"
      },
      "country": {
        "id": "1e6e44fe-d226-472f-af23-91a2ce3fe002",
        "name": "Venezuela",
        "code": "VE"
      }
    }
  ]
}
```

---

### B. Catálogo de Especialidades Médicas
* **Endpoint:** `GET /api/v1/specialties`
* **Respuesta de Éxito (200 OK):**
```json
{
  "data": [
    {
      "id": "968b842c-bffd-40f1-83cc-96f8d412022d",
      "name": "Medicina General",
      "description": "Especialidad médica enfocada en Medicina General"
    },
    {
      "id": "bffcd681-c517-4a6e-9da7-5126f8c2330f",
      "name": "Pediatría",
      "description": "Especialidad médica enfocada en Pediatría"
    }
  ]
}
```

---

## 4. Respuestas de Error Comunes

### A. Errores de Validación (422 Unprocessable Entity)
Ocurre cuando algún campo del payload no cumple las validaciones de tipo, longitud o unicidad de Laravel.
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "city_id": [
      "The selected city id is invalid."
    ],
    "password": [
      "The password field must be at least 8 characters."
    ]
  }
}
```

### B. Falta o Error en Clave de Idempotencia (400 Bad Request)
Ocurre cuando no se envía el header `Idempotency-Key` o se envía con un formato no válido.
```json
{
  "error": "Missing or invalid Idempotency-Key header."
}
```

### C. Acceso Denegado por KYC en Revisión (403 Forbidden)
Ocurre cuando un médico o proveedor intenta entrar a secciones clínicas protegidas pero sus documentos aún están en evaluación (`PENDING`).
```json
{
  "message": "Su documentación se encuentra en revisión. Acceso restringido."
}
```

### D. Cuenta Suspendida (401 Unauthorized)
Si la cuenta se desactiva (`is_active = false`), las peticiones con JWT fallarán con:
```json
{
  "message": "Cuenta suspendida."
}
```

### E. Error Interno del Servidor (500 Internal Server Error)
Ocurre cuando falla el procesamiento de archivos o la transacción de la base de datos (por ejemplo, disco lleno o pérdida de conexión).
```json
{
  "error": "Registration failed: [Detalle del error técnico]"
}
```
