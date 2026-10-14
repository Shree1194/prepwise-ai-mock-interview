"use client";

import dynamic from "next/dynamic";

const CodingInterview = dynamic(
  () => import("@/components/CodingInterview"),
  {
    ssr: false,
    loading: () => (
      <div role="status" aria-live="polite" className="flex min-h-64 items-center justify-center text-light-400 text-sm">
        Preparing code editor...
      </div>
    ),
  }
);

export default function CodingPageClient() {
  return <CodingInterview />;
}
