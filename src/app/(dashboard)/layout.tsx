"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { SmartHeader } from "@/components/SmartHeader";
import { DrawerToggleContext } from "@/app/dashboard/drawer-context";
import { MobileDrawer } from "@/features/doctor-dashboard/components/MobileDrawer";
import { BottomNav } from "@/features/doctor-dashboard/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  return (
    <DrawerToggleContext.Provider value={openDrawer}>
      <div className="flex h-screen bg-linear-to-br from-luca-gradient-start via-luca-gradient-mid to-luca-gradient-end">
        <Sidebar />

        <main className="flex-1 flex flex-col h-full overflow-y-auto pb-16 lg:pb-0">
          <SmartHeader />

          <div className="py-8 lg:py-12 flex-1">{children}</div>
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
  );
}