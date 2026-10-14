"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CODING_PROBLEMS, type CodingProblem, type CodingLanguage } from "@/data/coding-problems";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  compilationError: string | null;
  executionTime: number | null;
  testResults?: TestResult[];
  passedCount: number;
  totalCount: number;
  unavailable?: boolean;
}

interface ReviewResult {
  overallScore: number;
  verdict: string;
  timeComplexity: string;
  spaceComplexity: string;
  correctness: { score: number; feedback: string };
  efficiency: { score: number; feedback: string };
  codeQuality: { score: number; feedback: string };
  strengths: string[];
  improvements: string[];
  optimalApproach: string;
  interviewTip: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10 border-green-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

const VERDICT_COLORS: Record<string, string> = {
  Excellent: "text-green-400",
  Good: "text-blue-400",
  "Needs Improvement": "text-yellow-400",
  Incorrect: "text-red-400",
};

function renderProblemDescription(description: string) {
  return description.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
    <p key={paragraphIndex}>
      {paragraph.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, partIndex) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={partIndex} className="rounded bg-dark-300 px-1 py-0.5 font-mono text-xs">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIndex} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  ));
}

export default function CodingInterview() {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [language, setLanguage] = useState<CodingLanguage>("python");
  const [code, setCode] = useState(CODING_PROBLEMS[0].starterCode.python);
  const [activeTab, setActiveTab] = useState<"problem" | "hints" | "review">("problem");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [shownHints, setShownHints] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);

  const handleProblemChange = useCallback((problem: CodingProblem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[language]);
    setRunResult(null);
    setReview(null);
    setShownHints(0);
    setActiveTab("problem");
  }, [language]);

  const handleLanguageChange = useCallback((lang: CodingLanguage) => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang]);
  }, [selectedProblem]);

  const runCode = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const stdin = useCustomInput
        ? customInput
        : selectedProblem.testCases.filter((tc) => !tc.isHidden).map((tc) => tc.input).join("\n");

      const res = await fetch("/api/coding/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRunResult({ stdout: "", stderr: data.error || "Unknown error", exitCode: 1, compilationError: null, executionTime: null, passedCount: 0, totalCount: 0, unavailable: res.status === 503 });
        return;
      }

      // Run test cases
      const visibleTests = selectedProblem.testCases.filter((tc) => !tc.isHidden);
      const testResults: TestResult[] = [];
      let passedCount = 0;

      const outputLines = data.stdout.trim().split("\n");
      visibleTests.forEach((tc, i) => {
        const actual = (outputLines[i] || "").trim();
        const expected = tc.expectedOutput.trim();
        const passed = actual === expected;
        if (passed) passedCount++;
        testResults.push({ input: tc.input, expected, actual, passed });
      });

      setRunResult({ ...data, testResults, passedCount, totalCount: visibleTests.length });
    } catch (e: any) {
      setRunResult({ stdout: "", stderr: e.message, exitCode: 1, compilationError: null, executionTime: null, passedCount: 0, totalCount: 0 });
    } finally {
      setIsRunning(false);
    }
  };

  const getAIReview = async () => {
    setIsReviewing(true);
    setReview(null);
    setReviewError("");
    setActiveTab("review");
    try {
      const res = await fetch("/api/coding/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          problemId: selectedProblem.id,
          testResults: runResult ? { passed: runResult.passedCount, total: runResult.totalCount, stdout: runResult.stdout, stderr: runResult.stderr } : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) setReview(data);
      else setReviewError(data.error || "AI review is unavailable right now. Please try again.");
    } catch {
      setReviewError("AI review could not connect. Check your connection and try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Problem selector */}
      <div className="coding-problem-options flex items-center gap-2 flex-wrap" aria-label="Choose a problem">
        {CODING_PROBLEMS.map((problem) => (
          <button
            key={problem.id}
            onClick={() => handleProblemChange(problem)}
                aria-pressed={selectedProblem.id === problem.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedProblem.id === problem.id
                ? "bg-primary-200/20 border-primary-200/40 text-primary-100"
                : "bg-dark-200 border-white/10 text-light-400 hover:text-light-100 hover:border-white/20"
            }`}
          >
            {problem.title}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLORS[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </button>
        ))}
      </div>
      <label className="coding-problem-select-label" htmlFor="coding-problem-select">Choose a problem</label>
      <select
        id="coding-problem-select"
        className="coding-problem-select"
        value={selectedProblem.id}
        onChange={(event) => {
          const problem = CODING_PROBLEMS.find((item) => item.id === event.target.value);
          if (problem) handleProblemChange(problem);
        }}
      >
        {CODING_PROBLEMS.map((problem) => (
          <option key={problem.id} value={problem.id}>{problem.title} · {problem.difficulty}</option>
        ))}
      </select>

      {/* Main layout */}
      <div className="coding-workbench grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Problem + Hints + Review */}
        <div className="coding-problem-panel flex flex-col bg-dark-200 rounded-xl border border-white/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(["problem", "hints", "review"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary-200 text-primary-100"
                    : "border-transparent text-light-400 hover:text-light-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="coding-problem-content flex-1 overflow-y-auto p-4">
            {activeTab === "problem" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-white">{selectedProblem.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[selectedProblem.difficulty]}`}>
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 italic mb-3">{selectedProblem.etcRelevance}</p>
                  <div className="coding-problem-description text-sm text-light-100 leading-relaxed">
                    {renderProblemDescription(selectedProblem.description)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-light-400 uppercase tracking-wider mb-2">Constraints</h3>
                  <ul className="space-y-1">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-light-100 font-mono bg-dark-300 px-3 py-1.5 rounded">{c}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-light-400 uppercase tracking-wider mb-2">Examples</h3>
                  <div className="space-y-2">
                    {selectedProblem.testCases.filter((tc) => !tc.isHidden).slice(0, 2).map((tc, i) => (
                      <div key={i} className="bg-dark-300 rounded-lg p-3 space-y-1">
                        <div className="text-xs"><span className="text-light-400">Input:</span> <code className="text-green-300">{tc.input}</code></div>
                        <div className="text-xs"><span className="text-light-400">Output:</span> <code className="text-blue-300">{tc.expectedOutput}</code></div>
                        {tc.explanation && <div className="text-xs text-light-400 italic">{tc.explanation}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hints" && (
              <div className="space-y-3">
                <p className="text-xs text-light-400">Reveal hints one at a time. Try to solve without them first!</p>
                {selectedProblem.hints.map((hint, i) => (
                  <div key={i}>
                    {i < shownHints ? (
                      <div className="bg-dark-300 border border-yellow-500/20 rounded-lg p-3">
                        <span className="text-xs font-semibold text-yellow-400">Hint {i + 1}</span>
                        <p className="text-sm text-light-100 mt-1">{hint}</p>
                      </div>
                    ) : (
                      i === shownHints && (
                        <button
                          onClick={() => setShownHints(i + 1)}
                          className="w-full py-2 text-xs text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/10 transition-colors"
                        >
                          Reveal Hint {i + 1}
                        </button>
                      )
                    )}
                  </div>
                ))}
                {shownHints >= selectedProblem.hints.length && (
                  <p className="text-xs text-light-400 text-center">All hints revealed.</p>
                )}
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-4">
                {isReviewing && (
                  <div role="status" className="flex flex-col items-center gap-3 py-8">
                    <div className="w-8 h-8 border-2 border-primary-200 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-light-400">Analyzing your solution...</p>
                  </div>
                )}
                {!isReviewing && !review && (
                  <div className="text-center py-8">
                    <p className="text-sm text-light-400 mb-4">Get feedback on your current solution. Remote execution is unavailable until a secure sandbox is verified.</p>
                    <button
                      onClick={getAIReview}
                      className="px-4 py-2 bg-primary-200/20 border border-primary-200/40 text-primary-100 rounded-full text-sm font-medium hover:bg-primary-200/30 transition-all"
                    >
                      Get AI Review
                    </button>
                  </div>
                )}
                {reviewError && <p role="alert" className="text-sm text-red-300">{reviewError}</p>}
                {review && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white">{review.overallScore}<span className="text-lg text-light-400">/100</span></div>
                        <div className={`text-sm font-semibold ${VERDICT_COLORS[review.verdict] || "text-light-100"}`}>{review.verdict}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-light-400">Time: <span className="text-light-100 font-mono">{review.timeComplexity}</span></div>
                        <div className="text-xs text-light-400">Space: <span className="text-light-100 font-mono">{review.spaceComplexity}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: "Correctness", ...review.correctness },
                        { label: "Efficiency", ...review.efficiency },
                        { label: "Quality", ...review.codeQuality },
                      ].map((cat) => (
                        <div key={cat.label} className="bg-dark-300 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-white">{cat.score}<span className="text-xs text-light-400">/10</span></div>
                          <div className="text-xs text-light-400">{cat.label}</div>
                          <p className="text-xs text-light-100 mt-1 text-left">{cat.feedback}</p>
                        </div>
                      ))}
                    </div>

                    {review.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-400 mb-1">Strengths</h4>
                        <ul className="space-y-1">{review.strengths.map((s, i) => <li key={i} className="text-xs text-light-100 flex gap-1.5"><span className="text-green-400">✓</span>{s}</li>)}</ul>
                      </div>
                    )}

                    {review.improvements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-yellow-400 mb-1">Improvements</h4>
                        <ul className="space-y-1">{review.improvements.map((s, i) => <li key={i} className="text-xs text-light-100 flex gap-1.5"><span className="text-yellow-400">→</span>{s}</li>)}</ul>
                      </div>
                    )}

                    <div className="bg-dark-300 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-blue-400 mb-1">Optimal Approach</h4>
                      <p className="text-xs text-light-100">{review.optimalApproach}</p>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-indigo-300 mb-1">Interview Tip</h4>
                      <p className="text-xs text-light-100">{review.interviewTip}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor + Output */}
        <div className="flex flex-col gap-3">
          {/* Editor */}
          <div className="coding-editor-frame">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              onLanguageChange={handleLanguageChange}
              disabled={isRunning}
            />
          </div>

          {/* Custom input toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-light-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomInput}
                onChange={(e) => setUseCustomInput(e.target.checked)}
                className="rounded"
              />
              Custom stdin
            </label>
            {useCustomInput && (
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter test input..."
                className="flex-1 text-xs bg-dark-300 text-light-100 border border-white/10 rounded px-2 py-1 font-mono focus:outline-none focus:border-primary-200/50"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex-1 py-2.5 bg-dark-200 border border-white/10 text-light-100 rounded-lg text-sm font-medium hover:bg-dark-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
              ) : "▶ Run Code"}
            </button>
            <button
              onClick={getAIReview}
              disabled={isReviewing || !code.trim()}
              className="flex-1 py-2.5 bg-primary-200/20 border border-primary-200/40 text-primary-100 rounded-lg text-sm font-medium hover:bg-primary-200/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReviewing ? "Reviewing..." : "AI Review"}
            </button>
          </div>

          {/* Output */}
          {runResult && (
            <div role={runResult.unavailable ? "status" : "region"} aria-label="Code execution result" className="coding-output bg-dark-200 rounded-xl border border-white/10 p-4 space-y-3">
              {runResult.unavailable ? (
                <>
                  <div>
                    <h2 className="text-sm font-semibold text-amber-200">Execution unavailable</h2>
                    <p className="text-sm text-light-100 mt-2">{runResult.stderr}</p>
                    <p className="text-xs text-light-400 mt-2">Your code remains in the editor. You can still request an AI review or test your solution locally.</p>
                  </div>
                </>
              ) : <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-light-400">Output</span>
                <div className="flex items-center gap-2">
                  {runResult.executionTime != null && (
                    <span className="text-xs text-light-400">{runResult.executionTime}ms</span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    runResult.passedCount === runResult.totalCount && runResult.totalCount > 0
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : "text-red-400 border-red-400/30 bg-red-400/10"
                  }`}>
                    {runResult.passedCount}/{runResult.totalCount} tests
                  </span>
                </div>
              </div>

              {runResult.compilationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                  <p className="text-xs font-semibold text-red-400 mb-1">Compilation Error</p>
                  <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{runResult.compilationError}</pre>
                </div>
              )}

              {runResult.testResults && runResult.testResults.map((tr, i) => (
                <div key={i} className={`rounded-lg p-2 border text-xs ${tr.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className={tr.passed ? "text-green-400" : "text-red-400"}>{tr.passed ? "✓" : "✗"}</span>
                    <span className="text-light-400">Test {i + 1}</span>
                  </div>
                  <div className="font-mono space-y-0.5">
                    <div><span className="text-light-400">in:</span> <span className="text-light-100">{tr.input}</span></div>
                    <div><span className="text-light-400">expected:</span> <span className="text-green-300">{tr.expected}</span></div>
                    {!tr.passed && <div><span className="text-light-400">got:</span> <span className="text-red-300">{tr.actual || "(empty)"}</span></div>}
                  </div>
                </div>
              ))}

              {runResult.stderr && !runResult.compilationError && (
                <div className="bg-red-500/10 rounded p-2">
                  <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{runResult.stderr}</pre>
                </div>
              )}

              {runResult.stdout && !runResult.testResults?.length && (
                <pre className="text-xs text-light-100 font-mono bg-dark-300 rounded p-2 whitespace-pre-wrap">{runResult.stdout}</pre>
              )}
              </>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
