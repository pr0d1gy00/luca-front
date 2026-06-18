"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutList } from "lucide-react";
import dynamic from "next/dynamic";

const ClinicalHistoryBuilder = dynamic(
  () =>
    import("@/features/clinical-history-builder").then(
      (mod) => mod.ClinicalHistoryBuilder,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    ),
  },
);

export default function BuilderPage() {
  // Prevent body scroll while builder is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex items-center gap-3 px-4 bg-white border-b border-slate-100 flex-shrink-0">
        <Link
          href="/clinical-history"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600
                     hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Plantillas
        </Link>

        <div className="w-px h-5 bg-slate-200" />

        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            Motor de Historias Clínicas
          </h1>
          <p className="text-xs text-slate-500">
            Constructor de plantillas — Drag &amp; Drop
          </p>
        </div>

        <div className="flex-1" />

        <Link
          href="/clinical-history"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600
                     hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <LayoutList className="w-4 h-4" />
          Ver plantillas
        </Link>
      </header>

      {/* Builder (fills remaining height) */}
      <div className="flex-1 overflow-hidden">
        <ClinicalHistoryBuilder />
      </div>
    </div>
  );
}
