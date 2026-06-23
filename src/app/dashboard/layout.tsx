"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Sidebar from "@/components/Sidebar";
import { DrawerToggleContext } from "@/app/dashboard/drawer-context";
import { MobileDrawer } from "@/features/doctor-dashboard/components/MobileDrawer";
import { BottomNav } from "@/features/doctor-dashboard/components/BottomNav";
import { useState, useCallback } from "react";

function VerificationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isVerified } = useAuthStore();

  useEffect(() => {
    // Sin token → redirigir al login
    if (!token) {
      router.replace("/login");
      return;
    }

    // Token presente pero cuenta NO verificada → pending-verification
    if (!isVerified) {
      router.replace("/dashboard/pending-verification");
    }
  }, [token, isVerified, router]);

  // Si no está verificado, no renderizar nada (el efecto redirige)
  if (!token || !isVerified) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-[#23dce1]/20 border-t-[#23dce1] animate-spin" />
          <p className="text-sm text-slate-400">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  return (
    <VerificationGuard>
      <DrawerToggleContext.Provider value={openDrawer}>
        <div className="flex h-screen bg-linear-to-br from-luca-gradient-start via-luca-gradient-mid to-luca-gradient-end">
          {/* Fixed-position floating sidebar — taken out of flow */}
          <Sidebar />

          <main className="flex-1 flex flex-col h-full overflow-y-auto pb-16 lg:pb-0 lg:pl-[84px] thin-scrollbar">
            <div className="flex-1 p-6 lg:p-8 pt-6">{children}</div>
          </main>
        </div>

        {/* Mobile drawer (sheet) — reuses Sidebar component */}
        <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <div className="pt-14">
            <Sidebar inDrawer />
          </div>
        </MobileDrawer>

        {/* Bottom nav — always visible on mobile/tablet */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </DrawerToggleContext.Provider>
    </VerificationGuard>
  );
}
