"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { matchResumeWithJD, generateResumeInterviewQuestions } from "@/lib/actions/resume.action";

interface ResumeAnalysisProps {
  resume: ResumeData;
}

const SKILL_LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "rgba(99,102,241,.15)", text: "#6366f1" },
  intermediate: { bg: "rgba(245,158,11,.15)", text: "#f59e0b" },
  advanced: { bg: "rgba(16,185,129,.15)", text: "#10b981" },
  expert: { bg: "rgba(168,85,247,.15)", text: "#a855f7" },
};

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number) {
  if (score >= 80) return "text-success-100";
  if (score >= 60) return "text-yellow-400";
  return "text-destructive-100";
}

export default function ResumeAnalysis({ resume }: ResumeAnalysisProps) {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [jdMatch, setJdMatch] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [resumeQuestions, setResumeQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "jd" | "questions">("overview");
  const [actionError, setActionError] = useState("");
  const [startingInterview, setStartingInterview] = useState(false);

  const handleJDMatch = async () => {
    if (!jdText.trim()) return;
    setMatchLoading(true);
    setActionError("");
    try {
      const result = await matchResumeWithJD({ resumeId: resume.id, jobDescription: jdText });
      if (result.success) setJdMatch(result.match);
      else setActionError(result.error ?? "Resume analysis unavailable.");
    } catch {
      setActionError("Resume analysis unavailable. Please try again.");
    } finally { setMatchLoading(false); }
  };

  const handleGenerateQuestions = async () => {
    setQuestionsLoading(true);
    setActionError("");
    try {
      const result = await generateResumeInterviewQuestions({ resumeId: resume.id, count: 7 });
      if (result.success && result.questions) setResumeQuestions(result.questions);
      else setActionError(result.error ?? "Questions unavailable.");
    } catch {
      setActionError("Questions unavailable. Please try again.");
    } finally { setQuestionsLoading(false); }
  };

  const handleStartResumeInterview = async () => {
    setStartingInterview(true);
    setActionError("");
    try {
    let questions = resumeQuestions;
    if (!questions.length) {
      const generated = await generateResumeInterviewQuestions({ resumeId: resume.id, count: 7 });
      if (!generated.success || !generated.questions?.length) throw new Error(generated.error ?? "Questions unavailable.");
      questions = generated.questions;
    }
    const res = await fetch("/api/vapi/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: `Resume Interview — ${resume.name ?? "Candidate"}`,
        level: "placement",
        techstack: resume.skills?.slice(0, 5).map((s) => s.name) ?? ["E&TC"],
        type: "mixed",
        amount: questions.length || 7,
        userId: resume.userId,
        mode: "resume",
        difficulty: "placement",
        resumeId: resume.id,
        questions,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.interviewId) throw new Error(data.error ?? "Interview could not be created.");
    router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Interview could not be started. Please try again.");
    } finally { setStartingInterview(false); }
  };

  const atsScore = resume.atsScore ?? 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{resume.name ?? "Resume"}</h2>
          {resume.email && <p className="text-light-100 text-sm">{resume.email}</p>}
          <p className="text-xs text-light-400 mt-1">{resume.fileName}</p>
        </div>
        <div className="flex items-center gap-6">
          {/* ATS Score */}
          <div className="text-center">
            <p className={`text-3xl font-bold ${scoreLabel(atsScore)}`}>{atsScore}</p>
            <p className="text-xs text-light-100">ATS Score</p>
            <div className="w-16 bg-dark-200 rounded-full h-1.5 mt-1">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${atsScore}%`, backgroundColor: scoreColor(atsScore) }}
              />
            </div>
          </div>
          <button
            onClick={handleStartResumeInterview}
            className="btn-primary px-4 py-2 rounded-full text-sm font-bold"
          >
            {startingInterview ? "Preparing interview�" : "Start Resume Interview"}
          </button>
        </div>
      </div>

      {actionError && <p role="alert" aria-live="polite" className="text-red-300 text-sm">{actionError}</p>}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(["overview", "jd", "questions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize rounded-t-lg transition-all ${
              activeTab === tab
                ? "bg-dark-200 text-white border-b-2 border-indigo-500"
                : "text-light-100 hover:text-white"
            }`}
          >
            {tab === "jd" ? "JD Match" : tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Summary */}
          {resume.skills && (
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">💡 AI Analysis Summary</h3>
              <p className="text-light-100 text-sm leading-relaxed">{(resume as any).summary}</p>
            </div>
          )}

          {/* Skills by category */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">🛠️ Skills ({resume.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, i) => {
                  const style = SKILL_LEVEL_COLOR[skill.level] ?? SKILL_LEVEL_COLOR.beginner;
                  return (
                    <span
                      key={i}
                      className="text-sm px-3 py-1.5 rounded-full font-medium"
                      style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.text}44` }}
                      title={`${skill.category} — ${skill.level}`}
                    >
                      {skill.name}
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 flex-wrap">
                {Object.entries(SKILL_LEVEL_COLOR).map(([level, style]) => (
                  <span key={level} className="flex items-center gap-1.5 text-xs text-light-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.text }} />
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">🚀 Projects ({resume.projects.length})</h3>
              <div className="flex flex-col gap-4">
                {resume.projects.map((project, i) => (
                  <div key={i} className="border-l-2 border-indigo-500/40 pl-4">
                    <h4 className="text-white font-semibold text-sm">{project.name}</h4>
                    <p className="text-light-100 text-xs mt-1 mb-2 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded bg-dark-300 text-light-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {resume.missingSkills && resume.missingSkills.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-yellow-400 font-semibold mb-3">⚠️ Missing Skills for E&TC Placement</h3>
              <div className="flex flex-wrap gap-2">
                {resume.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(245,158,11,.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.3)" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {resume.suggestedImprovements && resume.suggestedImprovements.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-primary-100 font-semibold mb-3">📝 Resume Improvement Suggestions</h3>
              <ul className="space-y-2">
                {resume.suggestedImprovements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-light-100 text-sm">
                    <span className="text-primary-100 mt-0.5 flex-shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* JD Match tab */}
      {activeTab === "jd" && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-3">Paste Job Description</h3>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              className="w-full bg-dark-200 text-light-100 text-sm rounded-xl p-4 border border-white/10 focus:border-indigo-500/50 outline-none resize-none placeholder:text-light-400"
            />
            <button
              onClick={handleJDMatch}
              disabled={!jdText.trim() || matchLoading}
              className={`mt-3 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                jdText.trim() && !matchLoading
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105"
                  : "bg-dark-200 text-light-400 cursor-not-allowed"
              }`}
            >
              {matchLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                "Analyze Match"
              )}
            </button>
          </div>

          {jdMatch && (
            <div className="flex flex-col gap-4">
              {/* Match score */}
              <div className="glass-card p-5 flex items-center gap-6">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${scoreLabel(jdMatch.matchScore)}`}>
                    {jdMatch.matchScore}%
                  </p>
                  <p className="text-xs text-light-100 mt-1">Match Score</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-light-100 mb-1">
                    <span>Readiness</span>
                    <span
                      className="font-semibold capitalize"
                      style={{ color: scoreColor(jdMatch.matchScore) }}
                    >
                      {jdMatch.readinessLevel?.replace("-", " ")}
                    </span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${jdMatch.matchScore}%`,
                        backgroundColor: scoreColor(jdMatch.matchScore),
                      }}
                    />
                  </div>
                  <p className="text-xs text-light-400 mt-2">
                    Estimated prep time: {jdMatch.estimatedPreparationTime}
                  </p>
                </div>
              </div>

              {/* Gap analysis */}
              <div className="glass-card p-5">
                <h4 className="text-white font-semibold mb-2">Gap Analysis</h4>
                <p className="text-light-100 text-sm leading-relaxed">{jdMatch.gapAnalysis}</p>
              </div>

              {/* Matched / Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h4 className="text-success-100 font-semibold mb-3">✅ Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jdMatch.matchedSkills?.map((skill: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-success-100/10 text-success-100 border border-success-100/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-5">
                  <h4 className="text-yellow-400 font-semibold mb-3">⚠️ Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jdMatch.missingSkills?.map((skill: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card p-5">
                <h4 className="text-primary-100 font-semibold mb-3">🚀 Recommendations</h4>
                <ul className="space-y-2">
                  {jdMatch.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-light-100 text-sm">
                      <span className="text-primary-100 flex-shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions tab */}
      {activeTab === "questions" && (
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <p className="text-light-100 text-sm mb-4">
              Generate interview questions specifically tailored to your resume. These questions will probe your actual projects, skills, and experience.
            </p>
            <button
              onClick={handleGenerateQuestions}
              disabled={questionsLoading}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                !questionsLoading
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105"
                  : "bg-dark-200 text-light-400 cursor-not-allowed"
              }`}
            >
              {questionsLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Resume Questions"
              )}
            </button>
          </div>

          {resumeQuestions.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Your Resume Interview Questions</h3>
                <button
                  onClick={handleStartResumeInterview}
                  className="text-xs px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold"
                >
                  🎙️ Practice Now
                </button>
              </div>
              <ol className="space-y-3">
                {resumeQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-3 text-light-100 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-200/20 text-primary-200 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
