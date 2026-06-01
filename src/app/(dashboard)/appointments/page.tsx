"use client";

import { Container } from "@/components/ui/Container";
import { AppointmentCrudLayout } from "@/features/appointments/components/AppointmentCrudLayout";
import type { DoctorOption } from "@/features/appointments/schemas";

const DOCTORS: DoctorOption[] = [
  { id: "dr-001", name: "Dr. Alejandro Médici", specialty: "Medicina General" },
  { id: "dr-002", name: "Dra. Carolina Ruiz", specialty: "Cardiología" },
  { id: "dr-003", name: "Dr. Fernando Vega", specialty: "Dermatología" },
  { id: "dr-004", name: "Dra. Paula Herrera", specialty: "Pediatría" },
  { id: "dr-005", name: "Dr. Sebastián Pace", specialty: "Ortopedia" },
];

const today = new Date();
const makeDate = (daysOffset: number, hour: string) => {
  const d = new Date(today);
  d.setDate(today.getDate() + daysOffset);
  const [h, m] = hour.split(":");
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return d;
};

const MOCK_APPOINTMENTS = [
  {
    patientId: "dr-001",
    date: makeDate(0, "09:00"),
    time: "09:00",
    reason: "Control de presión arterial",
    type: "PRESENCIAL" as const,
    status: "CONFIRMADA" as const,
  },
  {
    patientId: "dr-002",
    date: makeDate(0, "10:30"),
    time: "10:30",
    reason: "Revisión de resultados de electrocardiograma",
    type: "PRESENCIAL" as const,
    status: "EN_SALA" as const,
  },
  {
    patientId: "dr-001",
    date: makeDate(0, "14:00"),
    time: "14:00",
    reason: "Consulta por dolor de cabeza recurrente",
    type: "ONLINE" as const,
    status: "PENDIENTE" as const,
  },
  {
    patientId: "dr-003",
    date: makeDate(0, "16:30"),
    time: "16:30",
    reason: "Control de lunar - seguimiento trimestral",
    type: "PRESENCIAL" as const,
    status: "PENDIENTE" as const,
  },
  {
    patientId: "dr-005",
    date: makeDate(1, "11:00"),
    time: "11:00",
    reason: "Dolor lumbar - primera evaluación",
    type: "PRESENCIAL" as const,
    status: "CONFIRMADA" as const,
  },
  {
    patientId: "dr-004",
    date: makeDate(2, "08:30"),
    time: "08:30",
    reason: "Vacunación del niño - esquema completo",
    type: "PRESENCIAL" as const,
    status: "PENDIENTE" as const,
  },
];

export default function ClinicAppointmentsPage() {
  return (
    <Container variant="fluid" className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-luca-muted-dark">
          Gestión de Citas
        </h1>
        <p className="text-sm text-luca-muted">
          Vista completa de todas las citas de la clínica
        </p>
      </div>

      <AppointmentCrudLayout appointments={MOCK_APPOINTMENTS} doctors={DOCTORS} />
    </Container>
  );
}