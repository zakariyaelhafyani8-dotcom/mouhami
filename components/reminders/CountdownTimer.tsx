"use client";

import { useState, useEffect } from "react";
import { ReminderEvent } from "@/types";
import { Clock } from "lucide-react";

const typeLabels: Record<string, string> = {
  RENDEZ_VOUS: "موعد",
  AUDIENCE: "جلسة",
  TACHE: "مهمة",
  ECHEANCE: "إجراء",
};

function getTargetDate(event: ReminderEvent): Date {
  const d = new Date(event.date);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

function getTimeRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: diff };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

export default function CountdownTimer({
  event,
}: {
  event: ReminderEvent | null;
}) {
  const [remaining, setRemaining] = useState<{
    days: number; hours: number; minutes: number; seconds: number; total: number;
  } | null>(null);

  useEffect(() => {
    if (!event) { setRemaining(null); return; }
    const target = getTargetDate(event);
    const tick = () => setRemaining(getTimeRemaining(target));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [event]);

  if (!event || !remaining) {
    return (
      <div className="bg-white rounded-card shadow-card p-6 text-center">
        <Clock className="w-12 h-12 text-[#D1D9E6] mx-auto mb-3" />
        <p className="text-base text-[#6B7280]">لا توجد تذكيرات حالياً.</p>
      </div>
    );
  }

  const units = [
    { label: "أيام", value: remaining.days },
    { label: "ساعات", value: remaining.hours },
    { label: "دقائق", value: remaining.minutes },
    { label: "ثواني", value: remaining.seconds },
  ];

  return (
    <div className="bg-[#FFF6EC] border-2 border-[#FF9F1C]/20 rounded-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
          <Clock className="w-6 h-6 text-[#FF9F1C]" />
        </div>
        <div>
          <p className="text-sm text-[#6B7280] font-semibold">التذكير القادم</p>
          <p className="text-lg font-bold text-[#0E2F6B]">{event.title}</p>
        </div>
        <div className="mr-auto">
          <span className="px-3 py-1 rounded-full bg-white text-sm font-bold text-[#FF9F1C] shadow-sm">
            {typeLabels[event.type] || event.type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        {units.map((unit) => (
          <div key={unit.label} className="bg-white rounded-card-sm py-4 shadow-sm">
            <p className="text-3xl font-bold text-[#FF9F1C] tabular-nums leading-none">
              {String(unit.value).padStart(2, "0")}
            </p>
            <p className="text-sm text-[#6B7280] mt-1.5 font-semibold">{unit.label}</p>
          </div>
        ))}
      </div>

      {event.client && (
        <div className="mt-4 pt-4 border-t border-[#FF9F1C]/10 text-center">
          <span className="text-sm text-[#6B7280]">
            {event.client.prenom} {event.client.nom}
            {event.lieu && ` — ${event.lieu}`}
          </span>
        </div>
      )}
    </div>
  );
}
