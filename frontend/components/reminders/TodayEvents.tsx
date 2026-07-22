"use client";

import { ReminderEvent } from "@/types";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  RENDEZ_VOUS: "موعد",
  AUDIENCE: "جلسة",
  TACHE: "مهمة",
  ECHEANCE: "إجراء",
};

export default function TodayEvents({
  events = [],
  onNewEvent,
}: {
  events?: ReminderEvent[];
  onNewEvent?: () => void;
}) {
  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#0E2F6B]">أحداث اليوم</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-sm text-[#0F3D91] font-bold">
            {events.length}
          </span>
        </div>
        {onNewEvent && (
          <button
            onClick={onNewEvent}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F3D91] text-white rounded-xl text-sm font-bold hover:bg-[#1E5BDB] transition-all duration-250 cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5" />
            حدث جديد
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-[#D1D9E6] mx-auto mb-3" />
          <p className="text-base text-[#6B7280]">لا توجد أحداث اليوم</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 bg-[#EAF2FF]/50 rounded-card-sm hover:bg-[#EAF2FF] transition-all duration-250 group cursor-default"
            >
              <div className="w-1 h-12 rounded-full bg-[#0F3D91] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[#0E2F6B]">{event.title}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  {event.time && `${event.time} — `}
                  {event.client && `${event.client.prenom} ${event.client.nom}`}
                  {event.lieu && ` — ${event.lieu}`}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white text-sm font-semibold text-[#0F3D91] shadow-sm shrink-0">
                {typeLabels[event.type] || event.type}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/audiences"
        className="block text-center text-base font-bold text-[#0F3D91] mt-4 pt-4 border-t border-border hover:text-[#1E5BDB] transition-colors"
      >
        عرض جميع الأحداث
      </Link>
    </div>
  );
}
