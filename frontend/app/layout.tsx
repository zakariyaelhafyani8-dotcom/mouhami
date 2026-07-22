// Layout racine — appliqué à toutes les pages
// Configure la langue, le RTL, et les métadonnées

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المكتب القانوني — ERP محاماة",
  description: "نظام متكامل لإدارة مكاتب المحاماة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
