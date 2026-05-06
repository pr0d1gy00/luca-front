"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { SmartHeader } from "@/components/SmartHeader";
import { DrawerToggleContext } from "@/app/dashboard/drawer-context";
import { MobileDrawer } from "@/features/doctor-dashboard/components/MobileDrawer";
import { BottomNav } from "@/features/doctor-dashboard/components/BottomNav";
import { navigationConfig } from "@/config/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  return (
    <DrawerToggleContext.Provider value={openDrawer}>
      <div className="flex h-screen bg-linear-to-br from-luca-gradient-start via-luca-gradient-mid to-luca-gradient-end">
        <Sidebar />

        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          <SmartHeader />

          <div className="py-8 lg:py-12 flex-1">{children}</div>
        </main>
      </div>

      {/* Mobile drawer (sheet) */}
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <nav
          className="flex flex-col gap-1 p-4 pt-16"
          aria-label="Navegación móvil"
        >
          {navigationConfig
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-luca-primary/10 text-luca-primary"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
        </nav>
        <BottomNav />
      </MobileDrawer>
    </DrawerToggleContext.Provider>
  );
}
