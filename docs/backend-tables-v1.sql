-- ==============================================================================
-- LUCA Health OS - Initial Tables for Backend (Authentication & Locations)
-- Includes:
-- 1. Normalized Locations (Country -> State -> City)
-- 2. Auth & Identity (PatientAccount, User)
-- 3. Normalized Specialties
-- 4. Marketplace Providers & Clinics
-- 5. Doctor's Patient CRM Records
-- ==============================================================================

-- 1. LOCATION MASTER TABLES
CREATE TABLE "Country" (
    "id" UUID PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "code" VARCHAR(2) NOT NULL -- ISO 3166-1 alpha-2
);

CREATE TABLE "State" (
    "id" UUID PRIMARY KEY,
    "countryId" UUID NOT NULL REFERENCES "Country"("id"),
    "name" VARCHAR NOT NULL
);

CREATE TABLE "City" (
    "id" UUID PRIMARY KEY,
    "stateId" UUID NOT NULL REFERENCES "State"("id"),
    "name" VARCHAR NOT NULL
);

-- 2. GLOBAL PATIENT IDENTITY
CREATE TABLE "PatientAccount" (
    "id" UUID PRIMARY KEY,
    "phone" VARCHAR NOT NULL UNIQUE,
    "email" VARCHAR UNIQUE,
    "passwordHash" VARCHAR, -- Nullable for OTP-only login
    "fullName" VARCHAR NOT NULL,
    "avatarUrl" VARCHAR,
    "nationalId" VARCHAR UNIQUE,
    "username" VARCHAR UNIQUE,
    "cityId" UUID REFERENCES "City"("id"), -- Normalized Location
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. USERS (DOCTORS, ADMINS, PROVIDER OWNERS)
CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'PROVIDER', 'ADMIN');
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY,
    "email" VARCHAR NOT NULL UNIQUE,
    "passwordHash" VARCHAR NOT NULL,
    "fullName" VARCHAR NOT NULL,
    "phone" VARCHAR,
    "role" "UserRole" NOT NULL DEFAULT 'DOCTOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "planType" "PlanType" NOT NULL DEFAULT 'FREE',
    "logoUrl" VARCHAR,
    "signatureUrl" VARCHAR,
    "cityId" UUID REFERENCES "City"("id"), -- Normalized Location
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. SPECIALTIES NORMALIZATION (Many-to-Many)
CREATE TABLE "Specialty" (
    "id" UUID PRIMARY KEY,
    "name" VARCHAR NOT NULL UNIQUE,
    "description" TEXT
);

CREATE TABLE "DoctorSpecialty" (
    "id" UUID PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"("id"),
    "specialtyId" UUID NOT NULL REFERENCES "Specialty"("id"),
    UNIQUE ("userId", "specialtyId")
);

-- 5. CLINICS (Institutional)
CREATE TABLE "Clinic" (
    "id" UUID PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "rif" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "cityId" UUID NOT NULL REFERENCES "City"("id"), -- Normalized Location
    "logoUrl" VARCHAR,
    "website" VARCHAR,
    "phone" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. PROVIDER PROFILES (Pharmacies & Labs for Marketplace)
CREATE TYPE "ProviderType" AS ENUM ('PHARMACY', 'LABORATORY');

CREATE TABLE "ProviderProfile" (
    "id" UUID PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"("id") UNIQUE,
    "type" "ProviderType" NOT NULL,
    "commercialName" VARCHAR NOT NULL,
    "rif" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "cityId" UUID NOT NULL REFERENCES "City"("id"), -- Normalized Location
    "phone" VARCHAR NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false
);

-- 7. PATIENT RECORDS (Doctor's CRM)
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

CREATE TABLE "Patient" (
    "id" UUID PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"("id"),
    "patientAccountId" UUID REFERENCES "PatientAccount"("id"),
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "nationalId" VARCHAR NOT NULL,
    "birthDate" TIMESTAMP NOT NULL,
    "gender" "Gender" NOT NULL,
    "email" VARCHAR,
    "phone" VARCHAR,
    "address" VARCHAR,
    "cityId" UUID REFERENCES "City"("id"), -- Normalized Location
    "emergencyContactName" VARCHAR,
    "emergencyContactPhone" VARCHAR,
    "accessCode" VARCHAR UNIQUE,
    "lastLogin" TIMESTAMP,
    "bloodType" VARCHAR,
    "allergies" VARCHAR,
    "chronicConditions" VARCHAR,
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
