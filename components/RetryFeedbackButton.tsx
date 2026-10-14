"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retryFeedbackAnalysis } from "@/lib/actions/general.action";

export default function RetryFeedbackButton({ interviewId, feedbackId }: { interviewId: string; feedbackId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await retryFeedbackAnalysis(interviewId, feedbackId);
      if (!result.success) throw new Error("Analysis could not be retried.");
      router.refresh();
    } catch {
      setError("Analysis could not be retried. Check your connection and AI provider configuration, then try again.");
    } finally {
      setPending(false);
    }
  };

  return <div className="flex flex-col items-center gap-2">
    <button className="btn-primary" onClick={retry} disabled={pending}>
      {pending ? "Retrying analysis…" : "Retry AI analysis"}
    </button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}
