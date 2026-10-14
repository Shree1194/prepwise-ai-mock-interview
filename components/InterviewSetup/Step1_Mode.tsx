"use client";

import { INTERVIEW_MODES } from "@/data/interview-modes";

interface Step1ModeProps {
  selected: string;
  onSelect: (mode: string) => void;
}

export default function Step1Mode({ selected, onSelect }: Step1ModeProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Choose Interview Mode</h2>
        <p className="text-light-100 text-sm">Select the type of interview you want to practice</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INTERVIEW_MODES.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              aria-pressed={isSelected}
              className={`text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? "border-indigo-500/60 bg-indigo-500/10"
                  : "border-white/10 bg-dark-200 hover:border-white/20 hover:bg-dark-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{mode.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm">{mode.label}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: mode.color + "22",
                        color: mode.color,
                        border: `1px solid ${mode.color}44`,
                      }}
                    >
                      {mode.estimatedDuration}
                    </span>
                  </div>
                  <p className="text-xs text-light-100 leading-relaxed">{mode.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
