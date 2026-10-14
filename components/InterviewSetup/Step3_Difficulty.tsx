"use client";

import { DIFFICULTIES } from "@/data/difficulties";

interface Step3DifficultyProps {
  selectedDifficulty: string;
  selectedCount: number;
  onDifficultySelect: (id: string) => void;
  onCountSelect: (count: number) => void;
}

const QUESTION_COUNTS = [5, 7, 10, 15];

export default function Step3Difficulty({
  selectedDifficulty,
  selectedCount,
  onDifficultySelect,
  onCountSelect,
}: Step3DifficultyProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Set Difficulty & Length</h2>
        <p className="text-light-100 text-sm">
          Choose the difficulty level and how many questions you want
        </p>
      </div>

      {/* Difficulty grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DIFFICULTIES.map((diff) => {
          const isSelected = selectedDifficulty === diff.id;
          return (
            <button
              key={diff.id}
              onClick={() => onDifficultySelect(diff.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-opacity-60 bg-opacity-10"
                  : "border-white/10 bg-dark-200 hover:border-white/20 hover:bg-dark-300"
              }`}
              style={
                isSelected
                  ? {
                      borderColor: diff.color + "88",
                      backgroundColor: diff.color + "11",
                    }
                  : {}
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{diff.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold text-sm"
                      style={{ color: isSelected ? diff.color : "white" }}
                    >
                      {diff.label}
                    </h3>
                  </div>
                  <p className="text-xs text-light-100 leading-relaxed mb-1">
                    {diff.description}
                  </p>
                  <p className="text-xs text-light-400">{diff.targetAudience}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Question count */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">Number of Questions</h3>
        <div className="flex gap-3 flex-wrap">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => onCountSelect(count)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
                selectedCount === count
                  ? "bg-primary-200 text-dark-100"
                  : "bg-dark-200 text-light-100 hover:bg-dark-300 border border-white/10"
              }`}
            >
              {count} Questions
            </button>
          ))}
        </div>
        <p className="text-light-100 text-xs mt-3">
          Estimated duration: ~{Math.ceil(selectedCount * 2)}–{Math.ceil(selectedCount * 3)} minutes
        </p>
      </div>
    </div>
  );
}
