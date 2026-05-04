import { z } from "zod";
// 1. Esquema Base (Lo que todos comparten)
export const baseAuthSchema = z.object({
  email: z.string().email("Correo Electronico invalido"),
  password: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[^A-Za-z0-9]/,
      "La contraseña debe contener al menos un carácter especial",
    ),
});

// 2. Esquema para Pacientes
export const patientRegisterSchema = baseAuthSchema.extend({
  name: z.string().min(2, "Requerido"),
  phone: z.string().min(10, "Número inválido"),
  confirmPassword: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[^A-Za-z0-9]/,
      "La contraseña debe contener al menos un carácter especial",
    ),
});

// 3. Esquema para Médicos
export const doctorRegisterSchema = baseAuthSchema.extend({
  name: z.string().min(2, "Requerido"),
  phone: z.string().min(10, "Número inválido"),
  medicalLicense: z
    .string()
    .min(5, "Debes ingresar tu número de licencia/colegiatura"),
  confirmPassword: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[^A-Za-z0-9]/,
      "La contraseña debe contener al menos un carácter especial",
    ),
});

// 4. Esquema para Instituciones (Clínicas / Farmacias / laboratorios)
export const institutionRegisterSchema = baseAuthSchema.extend({
  // Nombre Legal (Razón Social para facturación y contratos)
  legalName: z.string().min(3, "La razón social es obligatoria"),

  // Nombre Comercial (Cómo aparecerá en el mapa y la App del paciente)
  commercialName: z.string().min(2, "El nombre comercial es obligatorio"),

  // Identificador Fiscal (RUC, NIT, CIF, etc.)
  taxId: z
    .string()
    .min(5, "El identificador fiscal es obligatorio para validación B2B"),

  // Teléfono de la Institución (Central o recepción)
  phoneNumber: z.string().min(10, "Número de contacto inválido"),

  // Tipo de Institución (Para segmentar la lógica del dashboard)
  type: z.enum(["clinic", "pharmacy", "laboratory"], {
    message: "Selecciona un tipo de institución válido",
  }),
  confirmPassword: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[^A-Za-z0-9]/,
      "La contraseña debe contener al menos un carácter especial",
    ),
});
