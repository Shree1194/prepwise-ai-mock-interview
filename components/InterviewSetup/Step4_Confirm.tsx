"use client";

import { getModeById } from "@/data/interview-modes";
import { getSubjectById } from "@/data/subjects";
import { getDifficultyById } from "@/data/difficulties";

interface Step4ConfirmProps {
  mode: string;
  subjectId: string;
  difficulty: string;
  questionCount: number;
  companyId?: string;
  onStart: () => void;
  loading: boolean;
}

export default function Step4Confirm({
  mode,
  subjectId,
  difficulty,
  questionCount,
  companyId,
  onStart,
  loading,
}: Step4ConfirmProps) {
  const modeData = getModeById(mode);
  const subjectData = getSubjectById(subjectId === "mixed" ? "" : subjectId);
  const diffData = getDifficultyById(difficulty);

  const rows = [
    { label: "Interview Mode", value: modeData?.label ?? mode, icon: modeData?.icon ?? "⚙️" },
    {
      label: "Subject",
      value: subjectId === "mixed" ? "All Subjects (Mixed)" : (subjectData?.name ?? subjectId),
      icon: subjectId === "mixed" ? "🔀" : (subjectData?.icon ?? "📚"),
    },
    { label: "Difficulty Level", value: diffData?.label ?? difficulty, icon: diffData?.icon ?? "🎯" },
    { label: "Questions", value: `${questionCount} questions`, icon: "❓" },
    {
      label: "Estimated Time",
      value: `${Math.ceil(questionCount * 2)}–${Math.ceil(questionCount * 3)} minutes`,
      icon: "⏱️",
    },
    ...(companyId
      ? [
          {
            label: "Target Company",
            value: companyId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            icon: "🏢",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Ready to Start</h2>
        <p className="text-light-100 text-sm">
          Review your interview configuration before beginning
        </p>
      </div>

      {/* Summary card */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider text-light-400">
          Interview Summary
        </h3>
        <div className="divide-y divide-white/5">
          {rows.map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-light-100 text-sm">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-5 border border-indigo-500/20">
        <h3 className="text-primary-100 font-semibold text-sm mb-3">💡 Tips for Success</h3>
        <ul className="space-y-2 text-light-100 text-xs">
          <li className="flex gap-2"><span className="text-success-100">✓</span> Speak clearly and at a natural pace — the AI understands natural speech</li>
          <li className="flex gap-2"><span className="text-success-100">✓</span> It's okay to take a moment to think before answering</li>
          <li className="flex gap-2"><span className="text-success-100">✓</span> Give structured answers — state your point, then explain with examples</li>
          <li className="flex gap-2"><span className="text-success-100">✓</span> You can end the interview early with the End button if needed</li>
        </ul>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={loading}
        className={`relative py-4 px-12 rounded-full font-bold text-lg transition-all duration-300 ${
          loading
            ? "bg-dark-200 text-light-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Setting up your interview...
          </span>
        ) : (
          "🎙️ Start Interview"
        )}
      </button>
    </div>
  );
}
