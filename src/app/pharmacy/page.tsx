"use client";

import { Container } from "@/components/ui/Container";
import { PharmacyHeader } from "@/features/pharmacy/components/PharmacyHeader";
import { MetricsGrid } from "@/features/pharmacy/components/MetricsGrid";
import { QuotesRadar } from "@/features/pharmacy/components/QuotesRadar";
import { SalesAndActivitySidebar } from "@/features/pharmacy/components/SalesAndActivitySidebar";

// Mock data - TODO: Replace with TanStack Query hooks when backend is ready

const MOCK_STOCK_ITEMS = [
  { name: "Paracetamol 500mg", quantity: 5 },
  { name: "Ibuprofeno 400mg", quantity: 3 },
];

const MOCK_QUOTES = [
  {
    id: "q1",
    patientName: "María López",
    patientInitials: "ML",
    patientColor: "bg-emerald-100",
    medicine: "Amoxicilina 500mg",
    timeRemaining: "2 días",
    status: "pending" as const,
  },
  {
    id: "q2",
    patientName: "Carlos Pérez",
    patientInitials: "CP",
    patientColor: "bg-amber-100",
    medicine: "Omeprazol 20mg",
    timeRemaining: "3 días",
    status: "pending" as const,
  },
  {
    id: "q3",
    patientName: "Ana Rodríguez",
    patientInitials: "AR",
    patientColor: "bg-blue-100",
    medicine: "Lorazepam 1mg",
    timeRemaining: "1 día",
    status: "sent" as const,
  },
  {
    id: "q4",
    patientName: "Juan Sánchez",
    patientInitials: "JS",
    patientColor: "bg-purple-100",
    medicine: "Enalapril 10mg",
    timeRemaining: "4 días",
    status: "reviewed" as const,
  },
  {
    id: "q5",
    patientName: "Laura Torres",
    patientInitials: "LT",
    patientColor: "bg-pink-100",
    medicine: "Metformina 850mg",
    timeRemaining: "5 días",
    status: "pending" as const,
  },
];

const MOCK_TOP_VENTAS = [
  { name: "Amoxicilina 500mg", amount: "$12,450", percentage: 85 },
  { name: "Paracetamol 1g", amount: "$8,920", percentage: 62 },
  { name: "Omeprazol 20mg", amount: "$6,780", percentage: 45 },
  { name: "Ibuprofeno 400mg", amount: "$4,230", percentage: 28 },
];

const MOCK_ACTIVITY = [
  {
    id: "a1",
    text: "Nueva cotización de María López",
    time: "Hace 5 min",
    color: "emerald" as const,
  },
  {
    id: "a2",
    text: "Orden #1234 enviada exitosamente",
    time: "Hace 23 min",
    color: "blue" as const,
  },
  {
    id: "a3",
    text: "Stock bajo: Paracetamol 500mg",
    time: "Hace 1 hora",
    color: "amber" as const,
  },
  {
    id: "a4",
    text: "Cotización aceptada por Carlos Pérez",
    time: "Hace 2 horas",
    color: "stone" as const,
  },
];

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F5]">
      <Container variant="fluid" className="py-6 flex flex-col gap-6">
        {/* Header with search and bell */}
        <PharmacyHeader />

        {/* 3 Metric Cards */}
        <MetricsGrid
          salesAmount="$24,350"
          salesChange="+12.5%"
          quotesCount={24}
          quotesChange="cotizaciones pendientes"
          stockItems={MOCK_STOCK_ITEMS}
        />

        {/* Main content: Radar + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar de Cotizaciones - 8 cols */}
          <div className="lg:col-span-8">
            <QuotesRadar quotes={MOCK_QUOTES} />
          </div>

          {/* Right sidebar - 4 cols */}
          <div className="lg:col-span-4">
            <SalesAndActivitySidebar
              topVentas={MOCK_TOP_VENTAS}
              activity={MOCK_ACTIVITY}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
