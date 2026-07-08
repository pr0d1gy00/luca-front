"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";

const PUBLIC_PATHS = ["/login", "/register", "/doctors", "/pharmacies", "/clinics", "/"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let active = true;

    async function recoverSession() {
      try {
        const { data } = await apiClient.get<{
          user: {
            role: string;
            isVerified?: boolean;
            is_verified?: boolean;
            [key: string]: unknown;
          };
        }>("/auth/me");

        if (!active) return;

        const user = data.user;
        const userType = user.role === "patient" ? "patient" : "user";
        const isVerified = user.isVerified ?? user.is_verified ?? false;

        setAuth(userType, user, isVerified);

        const currentPath = window.location.pathname;
        const isPublicRoute = PUBLIC_PATHS.some(
          (route) => currentPath === route || currentPath.startsWith(route + "/"),
        );

        if (isPublicRoute) {
          router.replace("/dashboard");
        }
      } catch (err) {
        if (!active) return;
        console.error("[AuthProvider] Session recovery failed:", err);
        clearAuth();
      }
    }

    recoverSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
