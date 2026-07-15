"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Sidebar from "@/components/Sidebar";
import {
  DrawerToggleContext,
  DrawerContext,
} from "@/app/dashboard/drawer-context";
import { MobileDrawer } from "@/features/doctor-dashboard/components/MobileDrawer";
import { BottomNav } from "@/features/doctor-dashboard/components/BottomNav";
import { SmartHeader } from "@/components/SmartHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  const { isVerified, role } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log("[DashboardLayout Guard] Status:", {
      role,
      isVerified,
      pathname,
    });
    if (role && role !== "patient" && !isVerified) {
      const cleanPath = pathname.replace(/\/$/, "");
      const allowedRoutes = [
        "/dashboard/pending-verification",
        "/dashboard/profile",
      ];
      if (!allowedRoutes.includes(cleanPath)) {
        console.log(
          "[DashboardLayout Guard] Redirecting to /dashboard/pending-verification from:",
          cleanPath,
        );
        router.replace("/dashboard/pending-verification");
      }
    }
  }, [isVerified, role, pathname, router]);

  const drawerContextValue = useMemo(
    () => ({
      open: openDrawer,
      close: closeDrawer,
      toggle: toggleDrawer,
    }),
    [openDrawer, closeDrawer, toggleDrawer],
  );

  return (
    <DrawerContext.Provider value={drawerContextValue}>
      <DrawerToggleContext.Provider value={openDrawer}>
        <div className="flex h-screen bg-linear-to-br from-luca-gradient-start via-luca-gradient-mid to-luca-gradient-end">
          {/* Fixed-position floating sidebar — taken out of flow */}
          <Sidebar />

          <main className="flex-1 flex flex-col h-full overflow-y-auto pb-16 lg:pb-0 lg:pl-[84px] thin-scrollbar">
            <div className="lg:hidden">
              <SmartHeader />
            </div>
            <div className="flex-1 p-6 lg:p-8 pt-6">{children}</div>
          </main>
        </div>

        {/* Mobile drawer (sheet) — reuses Sidebar component */}
        <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <div className="h-full flex flex-col pt-14 pb-4">
            <Sidebar inDrawer />
          </div>
        </MobileDrawer>

        {/* Bottom nav — always visible on mobile/tablet */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </DrawerToggleContext.Provider>
    </DrawerContext.Provider>
  );
}
