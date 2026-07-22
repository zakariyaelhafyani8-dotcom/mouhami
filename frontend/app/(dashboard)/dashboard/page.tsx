"use client";

import { useState, useCallback } from "react";
import { Search, X, Users, FolderOpen, Calendar, FileWarning, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";
import { useReminders } from "@/hooks/useReminders";
import { getStoredUser } from "@/lib/auth";
import { apiService } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import CountdownTimer from "@/components/reminders/CountdownTimer";
import TodayEvents from "@/components/reminders/TodayEvents";
import NotificationPopup from "@/components/reminders/NotificationPopup";
import CreateReminderModal from "@/components/reminders/CreateReminderModal";
import { formatDateShort, formatCaseStatus } from "@/lib/utils";
import { SearchResult } from "@/types";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const {
    nextEvent,
    todayEvents,
    pendingReminders,
    dismissReminder,
    createEvent,
  } = useReminders();
  const user = getStoredUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchPerformed(true);
    const res = await apiService.get<SearchResult>(`/search?q=${encodeURIComponent(q)}`);
    if (res.success && res.data) {
      setSearchResults(res.data);
    }
    setSearchLoading(false);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchPerformed(false);
  }, []);

  if (loading || !data) {
    if (error) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-base text-red-500 font-semibold">{error}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin w-12 h-12 border-2 border-[#0F3D91] border-t-transparent rounded-full" />
      </div>
    );
  }

  const caseColumns = [
    {
      key: "reference",
      label: "المرجع",
      render: (value: string, row: any) => (
        <Link
          href={`/cases/${row.id}`}
          className="text-[#0F3D91] hover:text-[#1E5BDB] font-bold transition-colors"
        >
          {value}
        </Link>
      ),
    },
    {
      key: "client",
      label: "العميل",
      render: (value: any) => (
        <span className="font-bold">{value.prenom} {value.nom}</span>
      ),
    },
    {
      key: "type",
      label: "النوع",
    },
    {
      key: "etat",
      label: "الحالة",
      render: (value: string) => <Badge text={formatCaseStatus(value)} />,
    },
    {
      key: "dateCreation",
      label: "التاريخ",
      render: (value: string) => (
        <span className="text-[#6B7280]">{formatDateShort(value)}</span>
      ),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-[1500px] mx-auto"
    >
      {/* ====== Hero Banner ====== */}
      <motion.div variants={item}>
        <div className="relative h-[190px] rounded-[25px] bg-gradient-to-br from-[#0F3D91] via-[#0F3D91] to-[#1E5BDB] overflow-hidden shadow-hero">
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3)_0%,transparent_50%),radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0F3D91]/40" />
          <div className="relative z-10 h-full flex items-center justify-between px-10">
            <div className="flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عميل أو ملف أو مستند..."
                  className="w-full pr-14 pl-5 h-[68px] bg-white/15 backdrop-blur-md border border-white/20 rounded-[50px] text-lg text-white placeholder-white/50 shadow-lg focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
                />
              </form>
            </div>
            <div className="text-left mr-8 shrink-0">
              <h1 className="text-2xl font-bold text-white mb-1">
                مرحباً، {user?.prenom} {user?.nom}
              </h1>
              <p className="text-base text-white/70">نظرة عامة على نشاط المكتب</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ====== Search Results ====== */}
      {searchPerformed && (
        <motion.div variants={item}>
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0E2F6B]">
                {searchLoading ? "جاري البحث..." : `نتائج البحث عن "${searchResults?.query}" (${searchResults?.totalResults || 0})`}
              </h2>
              <button onClick={clearSearch} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
                إلغاء البحث
              </button>
            </div>

            {searchLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#0F3D91] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults?.clients && searchResults.clients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">العملاء ({searchResults.clients.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.clients.map((c) => (
                        <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#EAF2FF]/30 transition-colors">
                          <div>
                            <p className="text-base font-bold text-[#0E2F6B]">{c.prenom} {c.nom}</p>
                            <p className="text-sm text-[#6B7280]">{c.cin} | {c.telephone}</p>
                          </div>
                          <span className="text-sm text-[#6B7280]">{c.ville || "—"}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.cases && searchResults.cases.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">الملفات ({searchResults.cases.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.cases.map((c: any) => (
                        <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#EAF2FF]/30 transition-colors">
                          <div>
                            <p className="text-base font-bold text-[#0E2F6B]">{c.reference} — {c.client?.prenom} {c.client?.nom}</p>
                            <p className="text-sm text-[#6B7280]">{c.type} | {c.tribunal || "—"}</p>
                          </div>
                          <Badge text={formatCaseStatus(c.etat)} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.documents && searchResults.documents.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">المستندات ({searchResults.documents.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.documents.map((d) => (
                        <div key={d.id} className="px-5 py-4">
                          <p className="text-base font-bold text-[#0E2F6B]">{d.nom}</p>
                          <p className="text-sm text-[#6B7280]">{d.description || "—"} | {d.cas?.reference || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults?.caseTypes && searchResults.caseTypes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#6B7280] mb-2 uppercase tracking-wider">أنواع القضايا ({searchResults.caseTypes.length})</h3>
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {searchResults.caseTypes.map((ct) => (
                        <div key={ct.id} className="px-5 py-4">
                          <p className="text-base font-bold text-[#0E2F6B]">{ct.nameAr}</p>
                          <p className="text-sm text-[#6B7280]">{ct.description || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!searchResults?.clients?.length && !searchResults?.cases?.length && !searchResults?.documents?.length && !searchResults?.caseTypes?.length) && (
                  <div className="py-12 text-center">
                    <p className="text-base text-[#6B7280]">لا توجد نتائج مطابقة</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ====== Dashboard Content ====== */}
      {!searchPerformed && (<>
        {/* ====== Stats Cards ====== */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <StatCard
            title="العملاء"
            value={data.stats.clients}
            icon={<Users className="w-7 h-7" strokeWidth={2} />}
          />
          <StatCard
            title="الملفات"
            value={data.stats.cases}
            icon={<FolderOpen className="w-7 h-7" strokeWidth={2} />}
          />
          <StatCard
            title="الجلسات القادمة"
            value={data.stats.hearings}
            icon={<Calendar className="w-7 h-7" strokeWidth={2} />}
          />
          <StatCard
            title="مستندات ناقصة"
            value={data.stats.documentsPending}
            icon={<FileWarning className="w-7 h-7" strokeWidth={2} />}
          />
        </motion.div>

        {/* ====== Upcoming Hearings ====== */}
        {data.upcomingHearings.length > 0 && (
          <motion.div variants={item}>
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-[#0E2F6B]">الجلسات القادمة</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-sm text-[#0F3D91] font-bold">
                  {data.upcomingHearings.length} جلسة
                </span>
              </div>
              <div className="space-y-2.5">
                {data.upcomingHearings.map((hearing) => (
                  <div
                    key={hearing.id}
                    className="flex items-center justify-between p-4 bg-[#EAF2FF]/50 rounded-card-sm hover:bg-[#EAF2FF] transition-all duration-250 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-12 rounded-full bg-[#0F3D91] shrink-0" />
                      <div>
                        <p className="text-base font-bold text-[#0E2F6B]">
                          {hearing.cas?.reference} — {hearing.cas?.client?.prenom}{" "}
                          {hearing.cas?.client?.nom}
                        </p>
                        <p className="text-sm text-[#6B7280] mt-0.5">
                          {hearing.tribunal} | {hearing.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-base font-bold text-[#0F3D91]">
                        {formatDateShort(hearing.date)}
                      </p>
                      {hearing.heure && (
                        <p className="text-sm text-[#6B7280]">{hearing.heure}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ====== Events + Countdown ====== */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5"
        >
          <div className="lg:col-span-3">
            <TodayEvents
              events={todayEvents}
              onNewEvent={() => setShowCreateModal(true)}
            />
          </div>
          <div className="lg:col-span-2">
            <CountdownTimer event={nextEvent} />
          </div>
        </motion.div>

        {/* ====== Recent Cases Table ====== */}
        <motion.div variants={item}>
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0E2F6B]">آخر الملفات</h2>
              <Link
                href="/cases"
                className="inline-flex items-center gap-1.5 text-base font-bold text-[#0F3D91] hover:text-[#1E5BDB] transition-colors"
              >
                عرض جميع الملفات
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
            <DataTable
              columns={caseColumns}
              data={data.recentCases}
              emptyMessage="لا توجد ملفات لعرضها"
            />
          </div>
        </motion.div>
      </>)}

      {/* ====== Notification Popup ====== */}
      <NotificationPopup
        reminders={pendingReminders}
        onDismiss={dismissReminder}
      />

      {/* ====== Create Reminder Modal ====== */}
      <CreateReminderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createEvent}
      />
    </motion.div>
  );
}
