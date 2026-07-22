"use client";

import Link from "next/link";

const aiModules = [
  {
    title: "منشئ المستندات",
    description: "قم بإنشاء مسودات المستندات القانونية: وكالة، شكاية، مقال، عقد، إنذار...",
    href: "/ai/generator",
    color: "bg-green-50 text-green-600",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: "المكتبة القانونية",
    description: "ابحث في القوانين المغربية: أدخل سؤالك واحصل على النصوص القانونية الدقيقة مع المصادر والصفحات",
    href: "/ai/legal-search",
    color: "bg-amber-50 text-amber-600",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

export default function AIPage() {
  return (
    <div>
      <h1 className="text-3xl text-primary-500 mb-8">المساعد الذكي</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiModules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="bg-white rounded-xl border border-secondary-200 p-8 hover:shadow-lg hover:border-primary-200 transition-all group"
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 ${mod.color}`}>
              {mod.icon}
            </div>
            <h2 className="text-xl text-primary-500 mb-3">{mod.title}</h2>
            <p className="text-secondary-500 leading-relaxed">{mod.description}</p>
            <div className="mt-5 text-primary-500 group-hover:translate-x-2 transition-transform">
              ابدأ ←
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
