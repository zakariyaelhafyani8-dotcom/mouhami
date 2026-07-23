// Hook personnalisé pour la gestion de l'authentification côté client

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AuthUser,
  getStoredUser,
  setStoredUser,
  setAuthTokens,
  clearAuth,
  isAuthenticated,
} from "@/lib/auth";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiService.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", { email, password });

      if (result.success && result.data) {
        setAuthTokens(result.data.accessToken, result.data.refreshToken);
        setStoredUser(result.data.user);
        setUser(result.data.user);

        // Rediriger selon le rôle
        if (result.data.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/client/dashboard");
        }
        return { success: true };
      }

      return { success: false, message: result.message };
    },
    [router]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      nom: string;
      prenom: string;
      telephone?: string;
    }) => {
      const result = await apiService.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", data);

      if (result.success && result.data) {
        setAuthTokens(result.data.accessToken, result.data.refreshToken);
        setStoredUser(result.data.user);
        setUser(result.data.user);
        router.push("/dashboard");
        return { success: true };
      }

      return { success: false, message: result.message };
    },
    [router]
  );

  const logout = useCallback(async () => {
    await apiService.post("/auth/logout", {});
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}
