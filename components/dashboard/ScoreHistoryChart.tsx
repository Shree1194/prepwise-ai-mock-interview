"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ScoreHistory } from "@/lib/actions/analytics.action";

interface Props {
  data: ScoreHistory[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-light-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value}/100</p>
      {payload[0].payload.mode && <p className="text-light-400">{payload[0].payload.mode}</p>}
    </div>
  );
};

export default function ScoreHistoryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-light-400 text-sm">
        No interview history yet. Complete your first interview to see trends.
      </div>
    );
  }

  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="label" tick={{ fill: "#8c8c8c", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#8c8c8c", fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={70} stroke="rgba(99,102,241,0.4)" strokeDasharray="4 4" label={{ value: "Target", fill: "#6366f1", fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: "#6366f1", r: 3 }}
          activeDot={{ r: 5, fill: "#818cf8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
