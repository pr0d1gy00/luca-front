"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
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
  );
}
