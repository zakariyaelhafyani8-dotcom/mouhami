"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Scale,
  Gavel,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, href: "/dashboard", label: "لوحة القيادة" },
  { icon: Users, href: "/clients", label: "العملاء" },
  { icon: FolderOpen, href: "/cases", label: "الملفات" },
  { icon: Scale, href: "/case-types", label: "أنواع القضايا" },
  { icon: Gavel, href: "/audiences", label: "الجلسات" },
  { icon: BookOpen, href: "/ai/legal-search", label: "المكتبة" },
  { icon: Bot, href: "/ai", label: "المساعد" },
];

export default function FloatingSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed right-4 top-1/2 -translate-y-1/2 z-30">
      <div className="w-20 bg-white rounded-[30px] shadow-card py-6 flex flex-col items-center gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-250 ${
                active
                  ? "bg-[#EAF2FF] text-[#0F3D91]"
                  : "text-[#9AA6B8] hover:bg-[#EAF2FF] hover:text-[#0F3D91]"
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
            </a>
          );
        })}

        <div className="w-6 h-px bg-border my-2" />

        <a
          href="/settings"
          title="الإعدادات"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-250 ${
            isActive("/settings")
              ? "bg-[#EAF2FF] text-[#0F3D91]"
              : "text-[#9AA6B8] hover:bg-[#EAF2FF] hover:text-[#0F3D91]"
          }`}
        >
          <Settings className="w-6 h-6" strokeWidth={2} />
        </a>
      </div>
    </aside>
  );
}
