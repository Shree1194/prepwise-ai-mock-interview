import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DownloadPDFButton from "@/components/DownloadPDFButton";
import RetryFeedbackButton from "@/components/RetryFeedbackButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#6366f1";
  return "#ef4444";
}

function scoreLabel(score: number) {
  if (score >= 75) return "text-success-100";
  if (score >= 50) return "text-yellow-400";
  return "text-destructive-100";
}

function priorityStyle(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return { bg: "rgba(239,68,68,.15)", text: "#ef4444", label: "HIGH" };
    case "medium":
      return { bg: "rgba(245,158,11,.15)", text: "#f59e0b", label: "MED" };
    default:
      return { bg: "rgba(99,102,241,.15)", text: "#6366f1", label: "LOW" };
  }
}

function hiringRecommendationStyle(rec: string) {
  switch (rec) {
    case "Strong Hire":
      return { bg: "rgba(16,185,129,.15)", text: "#10b981", border: "#10b98144" };
    case "Hire":
      return { bg: "rgba(99,102,241,.15)", text: "#6366f1", border: "#6366f144" };
    case "Lean Hire":
      return { bg: "rgba(245,158,11,.15)", text: "#f59e0b", border: "#f59e0b44" };
    case "No Hire":
      return { bg: "rgba(239,68,68,.15)", text: "#ef4444", border: "#ef444444" };
    default:
      return { bg: "rgba(239,68,68,.2)", text: "#ef4444", border: "#ef444444" };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // ── Analysis failed state ────────────────────────────────────────────────
  if (!feedback) {
    return (
      <section className="section-feedback">
        <p className="text-sm text-light-400">AI practice assessment based on this transcript. Scores and hiring labels are estimates, not validated predictions of hiring outcomes.</p>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40">
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
              Feedback Pending
            </span>
          </div>
          <h1 className="text-4xl font-semibold">No Feedback Found</h1>
          <p className="text-light-100 max-w-md">
            This interview does not have a saved AI analysis yet. Complete the
            voice interview to generate dynamic scores and recommendations.
          </p>
        </div>

        <div className="buttons">
          <Button asChild className="btn-secondary flex-1">
            <Link href="/" className="flex w-full justify-center">
              <p className="text-sm font-semibold text-primary-200 text-center">
                Back to Dashboard
              </p>
            </Link>
          </Button>
          <Button asChild className="btn-primary flex-1">
            <Link href={`/interview/${id}`} className="flex w-full justify-center">
              <p className="text-sm font-semibold text-black text-center">
                Start Interview
              </p>
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  if (feedback?.analysisStatus === "failed") {
    return (
      <section className="section-feedback">
        <p className="text-sm text-light-400">AI practice assessment based on this transcript. Scores and hiring labels are estimates, not validated predictions of hiring outcomes.</p>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40">
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
              Analysis Unavailable
            </span>
          </div>
          <h1 className="text-4xl font-semibold">Interview Complete</h1>
          <p className="text-light-100 max-w-md">
            Your interview was recorded successfully, but the AI analysis could
            not be completed — likely a Gemini API rate limit or missing API key.
            Your transcript is saved. You can retry the AI analysis without repeating the interview.
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 max-w-lg mx-auto w-full">
          <h3 className="text-white font-semibold">What you can do</h3>
          <ul className="space-y-3 text-light-100 text-sm">
            <li className="flex gap-2">
              <span className="text-yellow-400 mt-0.5">→</span>
              Check that{" "}
              <code className="text-indigo-300">GOOGLE_GENERATIVE_AI_API_KEY</code>{" "}
              is set correctly in <code className="text-indigo-300">.env.local</code>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 mt-0.5">→</span>
              Retake the interview — your new attempt will trigger a fresh analysis
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 mt-0.5">→</span>
              Transcript ID{" "}
              <code className="text-indigo-300 break-all">{feedback.id}</code>{" "}
              is preserved in Firestore for a retry endpoint
            </li>
          </ul>
        </div>

        <RetryFeedbackButton interviewId={id} feedbackId={feedback.id} />

        <div className="buttons">
          <Button asChild className="btn-secondary flex-1">
            <Link href="/" className="flex w-full justify-center">
              <p className="text-sm font-semibold text-primary-200 text-center">
                ← Back to Dashboard
              </p>
            </Link>
          </Button>
          <Button asChild className="btn-primary flex-1">
            <Link href={`/interview/${id}`} className="flex w-full justify-center">
              <p className="text-sm font-semibold text-black text-center">
                🔄 Retake Interview
              </p>
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  // ── Normal feedback state ────────────────────────────────────────────────
  const total = feedback?.totalScore ?? 0;
  const hiringProb = feedback?.hiringProbability ?? 0;
  const recruiterScore = feedback?.recruiterScore ?? 0;
  const hiringRec = feedback?.hiringRecommendation ?? "No Hire";
  const recStyle = hiringRecommendationStyle(hiringRec);

  const pdfData = feedback
    ? {
        userName: user?.name || "Candidate",
        date: dayjs(feedback.createdAt).format("MMMM D, YYYY h:mm A"),
        subject: interview.role,
        questions: interview.questions || [],
        totalScore: total,
        categoryScores: feedback.categoryScores ?? [],
        strengths: feedback.strengths ?? [],
        areasForImprovement: feedback.areasForImprovement ?? [],
        finalAssessment: feedback.finalAssessment ?? "",
      }
    : null;

  return (
    <section className="section-feedback">
        <p className="text-sm text-light-400">AI practice assessment based on this transcript. Scores and hiring labels are estimates, not validated predictions of hiring outcomes.</p>
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/40">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Interview Complete 🎉
          </span>
        </div>
        <h1 className="text-4xl font-semibold">
          Feedback —{" "}
          <span className="capitalize text-primary-100">{interview.role}</span>
        </h1>
        <p className="text-light-100 text-sm">
          {interview.level} · {interview.type}
          {interview.subjectName && ` · ${interview.subjectName}`}
          {interview.companyName && ` · ${interview.companyName}`}
        </p>
      </div>

      {/* Score Cards Row */}
      <div className="flex flex-row justify-center flex-wrap gap-4">
        <div className="glass-card flex flex-row gap-3 items-center px-8 py-5">
          <div className={`text-4xl font-bold ${scoreLabel(total)}`}>{total}</div>
          <div>
            <p className="text-xs text-light-100">Overall Score</p>
            <p className="text-xs text-white font-semibold">/100</p>
          </div>
        </div>

        <div className="glass-card flex flex-row gap-3 items-center px-8 py-5">
          <div className={`text-4xl font-bold ${scoreLabel(hiringProb)}`}>
            {hiringProb}%
          </div>
          <div>
            <p className="text-xs text-light-100">Hiring Probability</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: recStyle.bg,
                color: recStyle.text,
                border: `1px solid ${recStyle.border}`,
              }}
            >
              {hiringRec}
            </span>
          </div>
        </div>

        <div className="glass-card flex flex-row gap-3 items-center px-8 py-5">
          <div className={`text-4xl font-bold ${scoreLabel(recruiterScore)}`}>
            {recruiterScore}
          </div>
          <div>
            <p className="text-xs text-light-100">Recruiter Score</p>
            <p className="text-xs text-white font-semibold">/100</p>
          </div>
        </div>

        <div className="glass-card flex flex-row gap-2 items-center px-8 py-5">
          <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
          <div>
            <p className="text-xs text-light-100">Date</p>
            <p className="text-xs text-white font-semibold">
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Gauge Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-white">Hiring Probability</span>
            <span className={scoreLabel(hiringProb) + " font-bold"}>{hiringProb}%</span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-1000"
              style={{
                width: `${hiringProb}%`,
                background: `linear-gradient(90deg, ${scoreColor(hiringProb)}, ${scoreColor(hiringProb)}aa)`,
              }}
            />
          </div>
          <p className="text-xs text-light-100">
            {hiringProb >= 70
              ? "Strong signal — hiring managers would likely move this candidate forward."
              : hiringProb >= 50
              ? "Mixed signal — promising but gaps exist. Preparation and re-interview recommended."
              : "Below bar for this level. Focused preparation and retry would strengthen the candidacy."}
          </p>
        </div>

        <div className="glass-card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-white">Recruiter Recommendation</span>
            <span className={scoreLabel(recruiterScore) + " font-bold"}>{recruiterScore}/100</span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-1000"
              style={{
                width: `${recruiterScore}%`,
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
              }}
            />
          </div>
          <p className="text-xs text-light-100">
            {recruiterScore >= 75
              ? "Recruiter would confidently advance this profile."
              : recruiterScore >= 50
              ? "Recruiter sees potential. Addressing improvement areas would make this profile competitive."
              : "Profile needs significant strengthening before a recruiter would recommend advancement."}
          </p>
        </div>
      </div>

      {/* Subject Insight */}
      {feedback?.subjectInsight && (
        <div className="glass-card p-6 border border-indigo-500/20">
          <h3 className="text-primary-100 mb-3">⚡ E&TC Subject Insight</h3>
          <p className="text-light-100 leading-relaxed">{feedback.subjectInsight}</p>
        </div>
      )}

      {/* Final Assessment */}
      <div className="glass-card p-6">
        <h3 className="text-white mb-3">📋 Final Assessment</h3>
        <p className="text-light-100 leading-relaxed">{feedback?.finalAssessment}</p>
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Performance Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedback?.categoryScores?.map((category, index) => {
            const color = scoreColor(category.score);
            return (
              <div key={index} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-white text-sm">{category.name}</p>
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: color + "22", color }}
                  >
                    {category.score}/100
                  </span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${category.score}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-light-100 text-xs leading-relaxed">
                  {category.comment}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths */}
      <div className="flex flex-col gap-3">
        <h3 className="text-success-100">✅ Strengths</h3>
        <div className="glass-card p-5">
          <ul className="space-y-2">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-light-100">
                <span className="text-success-100 mt-0.5 flex-shrink-0">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="flex flex-col gap-3">
        <h3 className="text-yellow-400">🎯 Areas for Improvement</h3>
        <div className="glass-card p-5">
          <ul className="space-y-2">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-light-100">
                <span className="text-yellow-400 mt-0.5 flex-shrink-0">→</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Topics to Study */}
      {feedback?.nextTopicsToStudy && feedback.nextTopicsToStudy.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-cyan-400">📚 Next Topics to Study</h3>
          <div className="glass-card p-5">
            <div className="flex flex-wrap gap-2">
              {feedback.nextTopicsToStudy.map((topic, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "rgba(6,182,212,0.15)",
                    color: "#22d3ee",
                    border: "1px solid rgba(6,182,212,0.3)",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learning Path */}
      {feedback?.learningPath && feedback.learningPath.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-primary-100">🚀 Recommended Learning Path</h3>
          <div className="flex flex-col gap-3">
            {feedback.learningPath.map((item, index) => {
              const style = priorityStyle(item.priority);
              return (
                <div key={index} className="glass-card p-4 flex items-start gap-4">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 mt-0.5 uppercase tracking-wide"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {style.label}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-white text-sm font-semibold">{item.topic}</p>
                    <p className="text-light-100 text-xs">{item.resource}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Questions Asked */}
      {interview.questions && interview.questions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3>❓ Questions Asked</h3>
          <div className="glass-card p-5">
            <ol className="space-y-3">
              {interview.questions.map((q, i) => (
                <li key={i} className="flex items-start gap-3 text-light-100 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-200/20 text-primary-200 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="buttons">
        <Button asChild className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              ← Back to Dashboard
            </p>
          </Link>
        </Button>

        {pdfData && <DownloadPDFButton feedbackData={pdfData} />}

        <Button asChild className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              🔄 Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
