"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { SubjectPerformance } from "@/lib/actions/analytics.action";

interface Props {
  data: SubjectPerformance[];
}

function getBarColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#6366f1";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function SubjectPerformanceChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-light-400 text-sm">
        No subject-specific data yet.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    name: d.subjectName.length > 14 ? d.subjectName.slice(0, 13) + "…" : d.subjectName,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8c8c8c", fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#c0c0c0", fontSize: 11 }} width={58} />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
          formatter={(val, _name, props: any) => [
            `${val ?? 0}/100 (${props.payload.count} session${props.payload.count !== 1 ? "s" : ""})`,
            "Avg Score",
          ]}
        />
        <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.avgScore)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
