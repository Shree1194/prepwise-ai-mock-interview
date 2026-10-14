"use client";

import type { StreakData } from "@/lib/actions/analytics.action";

interface Props {
  streak: StreakData;
}

export default function StreakCard({ streak }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const last7: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7.push(d.toISOString().slice(0, 10));
  }
  const activeSet = new Set(streak.activeDates);
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-300 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{streak.currentStreak}</div>
          <div className="text-xs text-light-400 mt-0.5">Day Streak</div>
        </div>
        <div className="bg-dark-300 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{streak.longestStreak}</div>
          <div className="text-xs text-light-400 mt-0.5">Best Streak</div>
        </div>
        <div className="bg-dark-300 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{streak.totalSessions}</div>
          <div className="text-xs text-light-400 mt-0.5">Total Sessions</div>
        </div>
      </div>

      <div>
        <p className="text-xs text-light-400 mb-2">Last 7 days</p>
        <div className="flex gap-1.5">
          {last7.map((date) => {
            const active = activeSet.has(date);
            const dayLabel = dayLabels[new Date(date + "T00:00:00").getDay()];
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-md border ${
                  active ? "bg-indigo-500/60 border-indigo-500/40" : "bg-dark-300 border-white/5"
                }`} title={date} />
                <span className="text-[10px] text-light-400">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
