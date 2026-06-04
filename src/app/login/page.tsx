"use client";
import { PharmiWorkspace, AuthContainer } from "@/components/pharmako-login";

export default function PharmakoLoginPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row">
      <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 max-h-[30vh] sm:max-h-[40vh] lg:max-h-none overflow-hidden">
        <PharmiWorkspace />
      </div>

      {/* 1. Este div se encarga EXCLUSIVAMENTE de centrar */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        {/* 2. ESTA ES LA JAULA ESTRICTA: Forzamos el ancho máximo desde fuera del componente */}
        <div className="w-full max-w-[600px]">
          <AuthContainer />
        </div>
      </div>
    </div>
  );
}
