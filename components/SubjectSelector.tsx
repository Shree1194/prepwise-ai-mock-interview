"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { etcSubjects, ETCSubject, getQuestionsForSubject } from "@/constants/etcSubjects";

interface SubjectSelectorProps {
  userId: string;
  userName: string;
}

const SubjectSelector = ({ userId, userName }: SubjectSelectorProps) => {
  const router = useRouter();
  const [selected, setSelected] = useState<ETCSubject | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      const questions = getQuestionsForSubject(selected.id, questionCount);

      // Create interview via API route
      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "etc-interview",
          userId,
          role: `E&TC - ${selected.name}`,
          level: "final-year",
          techstack: [selected.id],
          amount: questionCount,
          questions,
        }),
      });

      const data = await res.json();

      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      } else {
        // Fallback: use generate flow
        router.push("/interview");
      }
    } catch (err) {
      console.error("Error creating interview:", err);
      router.push("/interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          Choose Your <span className="text-gradient">Subject</span>
        </h2>
        <p className="text-light-100 text-lg">
          Select an E&TC subject to start your AI mock interview
        </p>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {etcSubjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelected(subject)}
            className={`subject-card group text-left transition-all duration-300 ${
              selected?.id === subject.id ? "selected" : ""
            }`}
            style={
              {
                "--subject-color": subject.color,
              } as React.CSSProperties
            }
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{subject.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base mb-1">
                  {subject.name}
                </h3>
                <p className="text-xs text-light-100 mb-3">
                  {subject.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {subject.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: subject.color + "22",
                        color: subject.color,
                        border: `1px solid ${subject.color}44`,
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                  {subject.topics.length > 3 && (
                    <span className="text-xs text-light-400">
                      +{subject.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Question Count Selector */}
      {selected && (
        <div className="glass-card p-6 mb-6 animate-fadeIn">
          <h3 className="text-white font-semibold mb-4">
            Number of Questions
          </h3>
          <div className="flex gap-3">
            {[5, 7, 10].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                  questionCount === count
                    ? "bg-primary-200 text-dark-100"
                    : "bg-dark-200 text-light-100 hover:bg-dark-300 border border-white/10"
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
          <p className="text-light-100 text-sm mt-3">
            Selected:{" "}
            <span className="text-white font-semibold">{selected.name}</span> •{" "}
            {questionCount} questions • ~{Math.ceil(questionCount * 2)} minutes
          </p>
        </div>
      )}

      {/* Start Button */}
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!selected || loading}
          className={`relative px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
            selected && !loading
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              : "bg-dark-200 text-light-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up interview...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🎙️ Start Interview
              {selected && <span className="text-sm opacity-75">- {selected.name}</span>}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubjectSelector;
