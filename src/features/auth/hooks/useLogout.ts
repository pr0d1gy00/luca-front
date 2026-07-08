import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { useState } from "react";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("[useLogout] Server logout failed:", err);
    } finally {
      clearAuth();
      toast.success("Sesión cerrada.");
      router.replace("/login");
      setLoading(false);
    }
  };

  return { logout, loading };
}
