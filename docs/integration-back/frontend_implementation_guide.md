# Guía de Implementación Frontend: Autenticación y API (Fase 1)

> **Documento generado por QA/Arquitectura**
> Este documento complementa la documentación del backend con los detalles exactos (interfaces, tipados, flujos y diccionarios) que el equipo de Frontend (Next.js/Zustand/React Query) necesita para implementar la Fase 1 sin ambigüedades.

---

## 1. Tipos e Interfaces (TypeScript)

Para garantizar la seguridad de tipos, el frontend DEBE implementar las siguientes interfaces basadas en el esquema de base de datos.

### 1.1 Enums Globales
```typescript
export enum UserRole {
  DOCTOR = 'DOCTOR',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum ProviderType {
  PHARMACY = 'PHARMACY',
  LABORATORY = 'LABORATORY'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}
```

### 1.2 Modelos de Respuesta de `/me`

**Para el ecosistema de Pacientes (`GET /api/v1/auth/patients/me`):**
```typescript
export interface PatientAccount {
  id: string; // UUID
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  nationalId: string | null;
  username: string | null;
  cityId: string | null;
  createdAt: string; // ISO 8601 Date string
}
```

**Para el ecosistema de Usuarios (`GET /api/v1/auth/users/me`):**
```typescript
export interface UserProfile {
  id: string; // UUID
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  planType: PlanType;
  logoUrl: string | null;
  signatureUrl: string | null;
  cityId: string | null;
  createdAt: string; // ISO 8601 Date
  updatedAt: string; // ISO 8601 Date
  
  // Si es Provider, vendrá esta relación adjunta (opcional dependiendo del rol)
  providerProfile?: {
    id: string;
    type: ProviderType;
    commercialName: string;
    rif: string;
    isVerified: boolean;
  };
}
```

### 1.3 Payload de Token
```typescript
export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // en segundos
}
```

---

## 2. Flujos de Implementación Frontend (Axios / React Query)

### 2.1 Interceptor de Idempotencia (`Idempotency-Key`)
**Requisito de Arquitectura:** El Backend exige un `Idempotency-Key` en todas las peticiones `POST`.
**Implementación:** Crear un Axios Interceptor que intercepte toda petición de método `POST` y le asigne un `uuidv4()`. Si es un reintento de la *misma* acción (ej. el usuario hace click dos veces en el botón y la app no lo bloqueó, o Axios reintenta por fallo de red), se debe mantener el mismo UUID.

### 2.2 Interceptor de Refresh Token (JWT)
**Requisito de Arquitectura:** El token expira.
**Implementación:** 
1. El Axios Interceptor debe detectar respuestas `401 Unauthorized`.
2. Si el error no es por cuenta suspendida (verificar body de la respuesta), el frontend debe pausar las peticiones en cola.
3. Llamar a `POST /api/v1/auth/users/refresh` (o `patients/refresh`) enviando el token expirado en el header `Authorization`.
4. Si el backend retorna un nuevo token (200 OK), actualizar Zustand y reintentar las peticiones en cola.
5. Si el backend retorna 401 en el refresh, limpiar el store de Zustand y redirigir al login (`/auth/login`).

### 2.3 Manejo de Errores (422, 403, 401)
El frontend debe estandarizar el parsing de errores de Laravel:
* **422 Unprocessable Entity:** Mapear el objeto `errors` directo a los campos de `react-hook-form` usando `setError()`.
* **403 Forbidden (KYC Pendiente):** Si el rol es `DOCTOR` o `PROVIDER` y se recibe un 403 con mensaje de revisión, redirigir a una página de `/dashboard/pending-verification`.
* **401 Unauthorized (Cuenta Suspendida):** Si se recibe "Cuenta suspendida.", forzar el logout local y mostrar un Toast/Modal crítico.

### 2.4 Envío de Formularios Multipart (Registro Doctores/Proveedores)
**Atención:** Para enviar arreglos como `specialty_ids` en `multipart/form-data`, el Frontend debe iterar y hacer `append` con corchetes vacíos o índices.
*Ejemplo correcto usando FormData:*
```javascript
const formData = new FormData();
formData.append('full_name', data.fullName);
// ...
data.specialtyIds.forEach((id, index) => {
  formData.append(`specialty_ids[${index}]`, id); // Formato Laravel
});
formData.append('medical_license', data.medicalLicenseFile);
```

---
## 3. Endpoints de Catálogo (Disponibles)

Los endpoints de catálogo obligatorios para los formularios de registro están completamente implementados y disponibles para su consumo en el frontend.

### 3.1 Catálogo de Ubicaciones (`GET /api/v1/locations/cities`)
* **Endpoint:** `GET /api/v1/locations/cities`
* **Content-Type:** `application/json`
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

### 3.2 Catálogo de Especialidades (`GET /api/v1/specialties`)
* **Endpoint:** `GET /api/v1/specialties`
* **Content-Type:** `application/json`
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

## 4. Arquitectura Multisede (Branches)

Para soportar el modelo escalable de clínicas y laboratorios/farmacias en varias sucursales físicas, se ha eliminado la información de dirección y teléfono del modelo principal de clínicas/proveedores. Toda sede física se maneja a través de sucursales (Branches).

### 4.1 Reglas del Frontend para Clínicas y Proveedores
* **Direcciones y Teléfonos:** Ya **no** se consultan ni se muestran directamente de la entidad `Clinic` o `ProviderProfile`. Se deben consultar y renderizar desde sus respectivas colecciones de sucursales (`ClinicBranch` y `ProviderBranch`).
* **Sucursal Principal:** Toda clínica o proveedor posee al menos una sucursal. La sucursal principal tiene el flag `is_main_branch: true`.

### 4.2 Interfaces TypeScript de Branches

**Sede de Clínica (`ClinicBranch`):**
```typescript
export interface ClinicBranch {
  id: string; // UUID público expuesto
  clinicId: number; // ID numérico interno
  name: string; // Nombre de la sede (ej. "Sede Las Mercedes")
  address: string;
  cityId: string; // UUID de la ciudad
  phone: string;
  isMainBranch: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  observations: string | null;
  createdAt: string;
}
```

**Miembro de Sede de Clínica (`ClinicBranchMember`):**
Enlaza a los médicos (`users` con rol `DOCTOR`) a nivel de sucursal física.
```typescript
export interface ClinicBranchMember {
  id: string; // UUID
  userId: number; // ID de usuario
  clinicBranchId: number; // ID de sede
  role: 'DOCTOR' | 'ASSISTANT';
  department: string | null;
  officeNumber: string | null;
  isActive: boolean;
}
```

**Sede de Proveedor (`ProviderBranch`):**
Aplica para laboratorios y farmacias.
```typescript
export interface ProviderBranch {
  id: string; // UUID
  providerProfileId: number;
  name: string;
  address: string;
  cityId: string; // UUID
  phone: string;
  isOpen: boolean;
  isMainBranch: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  observations: string | null;
  createdAt: string;
}
```

