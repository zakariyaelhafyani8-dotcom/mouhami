"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, FileText, Settings } from "lucide-react";
import ReminderBell from "@/components/reminders/ReminderBell";
import { getStoredUser, clearAuth } from "@/lib/auth";

const navItems = [
  { label: "لوحة القيادة", href: "/dashboard" },
  { label: "العملاء", href: "/clients" },
  { label: "الملفات", href: "/cases" },
  { label: "أنواع القضايا", href: "/case-types" },
  { label: "الجلسات", href: "/audiences" },
  { label: "المكتبة", href: "/ai/legal-search" },
  { label: "المساعد", href: "/ai" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="h-24 bg-white shadow-[0_1px_0_0_#E8EEF7] sticky top-0 z-20">
      <div className="flex items-center justify-between h-full px-8">
        <Link href="/dashboard" className="flex items-center shrink-0">
          <img src="/images/logo.png" alt="محامي" className="h-[90px] w-auto" />
        </Link>

        <nav className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2.5 text-base whitespace-nowrap rounded-lg transition-all duration-250 ${
                  isActive
                    ? "text-[#0F3D91] font-bold"
                    : "text-[#6B7280] hover:text-[#0F3D91] font-semibold"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 right-1/2 translate-x-1/2 w-7 h-0.5 bg-[#FF9F1C] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <ReminderBell />

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#EAF2FF] transition-all duration-250 cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F3D91] to-[#1E5BDB] flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {user?.nom?.charAt(0) || "م"}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-base font-bold text-[#0E2F6B] leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-[#6B7280] leading-tight">محامٍ</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#6B7280] transition-transform duration-250 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-card shadow-card border border-border z-20 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-border">
                    <p className="font-bold text-[#0E2F6B] text-base">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/documents"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-right px-4 py-3.5 text-base text-[#0E2F6B] hover:bg-primary-50 transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-[#6B7280]" />
                    المستندات
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-right px-4 py-3.5 text-base text-[#0E2F6B] hover:bg-primary-50 transition-colors flex items-center gap-3"
                  >
                    <Settings className="w-5 h-5 text-[#6B7280]" />
                    الإعدادات
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-3.5 text-base text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer border-t border-border"
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
