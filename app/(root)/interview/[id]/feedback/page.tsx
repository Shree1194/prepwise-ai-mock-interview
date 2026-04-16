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

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const scoreColor =
    (feedback?.totalScore || 0) >= 80
      ? "text-success-100"
      : (feedback?.totalScore || 0) >= 60
      ? "text-yellow-400"
      : "text-destructive-100";

  const pdfData = feedback
    ? {
        userName: user?.name || "Candidate",
        date: dayjs(feedback.createdAt).format("MMMM D, YYYY h:mm A"),
        subject: interview.role,
        questions: interview.questions || [],
        totalScore: feedback.totalScore,
        categoryScores: feedback.categoryScores,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areasForImprovement,
        finalAssessment: feedback.finalAssessment,
      }
    : null;

  return (
    <section className="section-feedback">
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
      </div>

      {/* Score Cards Row */}
      <div className="flex flex-row justify-center">
        <div className="glass-card flex flex-row gap-8 px-8 py-5">
          {/* Overall Score */}
          <div className="flex flex-row gap-3 items-center">
            <div className={`text-4xl font-bold ${scoreColor}`}>
              {feedback?.totalScore ?? "—"}
            </div>
            <div>
              <p className="text-xs text-light-100">Overall Score</p>
              <p className="text-xs text-white font-semibold">/100</p>
            </div>
          </div>

          <div className="w-px bg-white/10" />

          {/* Date */}
          <div className="flex flex-row gap-2 items-center">
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

          {/* Questions count */}
          {interview.questions?.length && (
            <>
              <div className="w-px bg-white/10" />
              <div className="flex flex-row gap-2 items-center">
                <Image src="/star.svg" width={22} height={22} alt="star" />
                <div>
                  <p className="text-xs text-light-100">Questions</p>
                  <p className="text-xs text-white font-semibold">
                    {interview.questions.length} Asked
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
            const pct = category.score;
            const barColor =
              pct >= 80 ? "#10b981" : pct >= 60 ? "#6366f1" : "#ef4444";

            return (
              <div key={index} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-white text-sm">{category.name}</p>
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: barColor + "22",
                      color: barColor,
                    }}
                  >
                    {category.score}/100
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-dark-200 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${category.score}%`,
                      backgroundColor: barColor,
                    }}
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
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              ← Back to Dashboard
            </p>
          </Link>
        </Button>

        {pdfData && <DownloadPDFButton feedbackData={pdfData} />}

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
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
