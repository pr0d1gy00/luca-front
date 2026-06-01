"use client";

import { Container } from "@/components/ui/Container";
import { MedicationsCrudLayout } from "@/features/medications/components/MedicationsCrudLayout";

export default function DoctorMedicationsPage() {
  return (
    <Container variant="fluid" className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-luca-muted-dark">
          Medicamentos
        </h1>
        <p className="text-sm text-luca-muted">
          Catálogo de medicamentos para recetas digitales
        </p>
      </div>

      <MedicationsCrudLayout />
    </Container>
  );
}