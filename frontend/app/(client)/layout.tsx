// Layout pour l'espace client

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin, getStoredUser, clearAuth } from "@/lib/auth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else if (isAdmin()) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!isAuthenticated() || isAdmin()) {
    return null;
  }

  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header client */}
      <header className="bg-primary-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="الشعار" className="w-8 h-8 rounded" />
            <span className="font-bold">مساحة العميل</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200">
              {user?.prenom} {user?.nom}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-primary-200 hover:text-white transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
