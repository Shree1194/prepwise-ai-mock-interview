"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryRadar } from "@/lib/actions/analytics.action";

interface Props {
  data: CategoryRadar[];
}

const SHORT_NAMES: Record<string, string> = {
  "Technical Knowledge": "Technical",
  "Subject Knowledge": "Subject",
  "Problem Solving": "Problem Solving",
  "Communication Skills": "Communication",
  "Confidence & Clarity": "Confidence",
  "Fluency & Grammar": "Fluency",
  "Conceptual Depth": "Depth",
  "Answer Relevance": "Relevance",
  "Practical Awareness": "Practical",
  "Overall Impression": "Overall",
};

export default function CategoryRadarChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-light-400 text-sm">
        Complete interviews to see category breakdown.
      </div>
    );
  }

  const formatted = data.map((d) => ({ ...d, name: SHORT_NAMES[d.category] ?? d.category }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={formatted}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="name" tick={{ fill: "#8c8c8c", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(val) => [`${val ?? 0}/100`, "Score"]}
        />
        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
