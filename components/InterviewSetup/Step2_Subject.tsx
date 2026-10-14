"use client";

import { ETC_SUBJECTS, ETCSubjectData } from "@/data/subjects";

interface Step2SubjectProps {
  selected: string;
  onSelect: (subjectId: string) => void;
  mode: string;
}

const CATEGORY_ORDER = ["core", "applied", "software", "advanced"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  core: "Core E&TC",
  applied: "Applied Engineering",
  software: "Software & CS",
  advanced: "Advanced Topics",
};

export default function Step2Subject({ selected, onSelect, mode }: Step2SubjectProps) {
  const showMixed = mode === "mixed" || mode === "rapid-fire";

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = ETC_SUBJECTS.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<string, ETCSubjectData[]>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Select Subject</h2>
        <p className="text-light-100 text-sm">
          Choose the E&TC subject area for your interview
        </p>
      </div>

      {/* Mixed / All option */}
      {showMixed && (
        <button
          onClick={() => onSelect("mixed")}
          className={`p-4 rounded-xl border transition-all duration-200 text-left ${
            selected === "mixed"
              ? "border-pink-500/60 bg-pink-500/10"
              : "border-white/10 bg-dark-200 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔀</span>
            <div>
              <h3 className="font-bold text-white text-sm">All Subjects (Mixed)</h3>
              <p className="text-xs text-light-100">
                Random questions from all E&TC domains combined
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Subject groups */}
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-light-400 uppercase tracking-wider px-1">
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped[category].map((subject) => {
              const isSelected = selected === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => onSelect(subject.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                    isSelected
                      ? "border-indigo-500/60 bg-indigo-500/10"
                      : "border-white/10 bg-dark-200 hover:border-white/20 hover:bg-dark-300"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: subject.color + "88", backgroundColor: subject.color + "11" }
                      : {}
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{subject.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-sm mb-1"
                        style={{ color: isSelected ? subject.color : "white" }}
                      >
                        {subject.name}
                      </h4>
                      <p className="text-xs text-light-100 leading-relaxed line-clamp-2">
                        {subject.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subject.topics.slice(0, 2).map((t) => (
                          <span
                            key={t.name}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: subject.color + "22",
                              color: subject.color,
                            }}
                          >
                            {t.name}
                          </span>
                        ))}
                        {subject.topics.length > 2 && (
                          <span className="text-xs text-light-400">
                            +{subject.topics.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
