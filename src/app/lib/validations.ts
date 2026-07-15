import { z } from "zod";

// 1. Esquema Base (Lo que todos comparten)
export const baseAuthSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
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
export const patientRegisterSchema = baseAuthSchema
  .extend({
    name: z.string().min(2, "Requerido"),
    phone: z.string().min(7, "Número inválido"),
    cityId: z.string().optional(),
    nationalId: z
      .string()
      .min(5, "DNI/Cédula inválido")
      .optional()
      .or(z.literal("")),
    username: z.string().optional(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// 3. Esquema para Médicos
export const doctorRegisterSchema = baseAuthSchema
  .extend({
    name: z.string().min(2, "Requerido"),
    phone: z.string().min(7, "Número inválido"),
    nationalId: z
      .string()
      .min(5, "DNI/Cédula inválido")
      .optional()
      .or(z.literal("")),
    cityId: z.string().optional(),
    specialtyIds: z
      .array(z.string())
      .min(1, "Selecciona al menos una especialidad"),
    medicalLicense: z
      .any()
      .refine((file) => file !== null && file !== undefined, {
        message: "La licencia médica es obligatoria",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// 4. Esquema para Instituciones (Clínicas / Farmacias / laboratorios)
export const institutionRegisterSchema = baseAuthSchema
  .extend({
    legalName: z.string().min(3, "La razón social es obligatoria"),
    commercialName: z.string().min(2, "El nombre comercial es obligatorio"),
    taxId: z.string().min(5, "El identificador fiscal (RIF) es obligatorio"),
    phoneNumber: z.string().min(7, "Número de contacto inválido"),
    cityId: z.string().optional(),
    type: z.enum(["clinic", "pharmacy", "laboratory"], {
      message: "Selecciona un tipo de institución válido",
    }),
    businessDocument: z
      .any()
      .refine((file) => file !== null && file !== undefined, {
        message: "El documento de registro es obligatorio",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
