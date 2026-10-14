"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Step1Mode from "./Step1_Mode";
import Step2Subject from "./Step2_Subject";
import Step3Difficulty from "./Step3_Difficulty";
import Step4Confirm from "./Step4_Confirm";
import StepCompany from "./Step_Company";
import { getSubjectById, buildSubjectContextPrompt } from "@/data/subjects";
import { getModeById } from "@/data/interview-modes";
import { buildCompanyContextPrompt } from "@/data/companies";

interface InterviewSetupProps {
  userId: string;
  userName: string;
  initialSubject?: string;
}

type WizardStep = "mode" | "company" | "subject" | "difficulty" | "confirm";

export default function InterviewSetup({ userId, userName, initialSubject }: InterviewSetupProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [mode, setMode] = useState("technical");
  const [companyId, setCompanyId] = useState("");
  const [subjectId, setSubjectId] = useState(initialSubject && getSubjectById(initialSubject) ? initialSubject : "");
  const [difficulty, setDifficulty] = useState("placement");
  const [questionCount, setQuestionCount] = useState(7);
  const [jobContext, setJobContext] = useState("");

  // Compute the step sequence dynamically based on mode
  const steps: WizardStep[] = useMemo(() => {
    const base: WizardStep[] = ["mode"];
    if (mode === "company-specific") base.push("company");
    base.push("subject", "difficulty", "confirm");
    return base;
  }, [mode]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Step indicator labels
  const STEP_META: Record<WizardStep, { label: string; icon: string }> = {
    mode: { label: "Mode", icon: "⚙️" },
    company: { label: "Company", icon: "🏢" },
    subject: { label: "Subject", icon: "📚" },
    difficulty: { label: "Difficulty", icon: "🎯" },
    confirm: { label: "Start", icon: "🎙️" },
  };

  const canProceed = () => {
    switch (currentStep) {
      case "mode": return !!mode && (mode !== "job-description" || jobContext.trim().length >= 30);
      case "company": return !!companyId;
      case "subject": return !!subjectId;
      case "difficulty": return !!difficulty && questionCount > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    // When mode changes on step 0, reset dependent state
    if (currentStep === "mode") {
      setCompanyId("");
      if (!initialSubject) setSubjectId("");
    }
    setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleStart = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const subject = subjectId && subjectId !== "mixed" ? getSubjectById(subjectId) : null;
      const modeData = getModeById(mode);

      const role =
        subjectId === "mixed"
          ? "E&TC Mixed"
          : subject
          ? `E&TC - ${subject.name}`
          : "E&TC Engineer";

      const techstack = subject
        ? subject.topics.slice(0, 4).map((t) => t.name)
        : ["E&TC Engineering"];

      // Build enriched context for the AI question generator
      let jobDescription = jobContext;
      if (subjectId && subjectId !== "mixed" && subject) {
        jobDescription += buildSubjectContextPrompt(subjectId, difficulty);
      }
      if (companyId) {
        jobDescription += buildCompanyContextPrompt(companyId);
      }

      const payload = {
        role,
        level: difficulty,
        type: modeData?.availableFor[0] ?? "technical",
        amount: questionCount,
        userId,
        mode,
        difficulty,
        techstack,
        ...(subjectId && subjectId !== "mixed" && { subjectId }),
        ...(companyId && { companyId }),
        ...(jobDescription && { jobDescription }),
      };

      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(err.error ?? `Server error ${res.status}`);
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      const data = await res.json();
      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error("No interview ID returned from server");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to create interview. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {steps.map((stepId, i) => {
          const meta = STEP_META[stepId];
          const isDone = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          return (
            <div key={stepId} className="flex items-center gap-2">
              <button
                onClick={() => isDone && setCurrentStepIndex(i)}
                disabled={!isDone}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isCurrent
                    ? "bg-indigo-500 text-white"
                    : isDone
                    ? "bg-dark-200 text-success-100 hover:bg-dark-300 cursor-pointer"
                    : "bg-dark-200 text-light-400 cursor-default"
                }`}
              >
                <span>{isDone ? "✓" : meta.icon}</span>
                <span className="max-sm:hidden">{meta.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 h-0.5 transition-all duration-300 ${
                    isDone ? "bg-success-100" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === "mode" && (
          <Step1Mode selected={mode} onSelect={(m) => { if (m === "resume") router.push("/resume"); else setMode(m); }} />
        )}
        {currentStep === "company" && (
          <StepCompany selected={companyId} onSelect={setCompanyId} />
        )}
        {currentStep === "subject" && (
          <Step2Subject
            selected={subjectId}
            onSelect={setSubjectId}
            mode={mode}
          />
        )}
        {currentStep === "difficulty" && (
          <Step3Difficulty
            selectedDifficulty={difficulty}
            selectedCount={questionCount}
            onDifficultySelect={setDifficulty}
            onCountSelect={setQuestionCount}
          />
        )}
        {currentStep === "confirm" && (
          <Step4Confirm
            mode={mode}
            subjectId={subjectId}
            difficulty={difficulty}
            questionCount={questionCount}
            companyId={companyId}
            onStart={handleStart}
            loading={loading}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-destructive-100/10 border border-destructive-100/30 text-destructive-100 text-sm">
          {error}
        </div>
      )}

      {mode === "job-description" && currentStep === "mode" && <div className="my-6"><label htmlFor="job-context" className="block mb-2">Job description</label><textarea id="job-context" value={jobContext} onChange={event => setJobContext(event.target.value)} maxLength={2000} rows={6} className="w-full bg-dark-200 border border-white/20 rounded-md p-3" /><p className="text-sm text-light-400">Paste at least 30 characters from the role requirements. Avoid personal or confidential information.</p></div>}
      {/* Navigation */}
      {currentStep !== "confirm" && (
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
              currentStepIndex === 0
                ? "bg-dark-200 text-light-400 cursor-not-allowed"
                : "bg-dark-200 text-white hover:bg-dark-300 border border-white/10"
            }`}
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
              canProceed()
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                : "bg-dark-200 text-light-400 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-center text-xs text-light-400 mt-6">
        Signed in as <span className="text-white font-medium">{userName}</span>
      </p>
    </div>
  );
}
