"use client";

import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeAnalysis from "@/components/ResumeAnalysis";

interface ResumePageClientProps {
  userId: string;
  initialResume: ResumeData | null;
}

export default function ResumePageClient({
  userId,
  initialResume,
}: ResumePageClientProps) {
  const [resume, setResume] = useState<ResumeData | null>(initialResume);

  const handleUploadSuccess = (data: any) => {
    setResume({ ...data, userId } as ResumeData);
  };

  const handleReupload = () => {
    setResume(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {resume ? (
        <div className="flex flex-col gap-4">
          {/* Re-upload option */}
          <div className="flex justify-end">
            <button
              onClick={handleReupload}
              className="text-sm text-light-100 hover:text-white flex items-center gap-1 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all"
            >
              📤 Upload different resume
            </button>
          </div>
          <ResumeAnalysis resume={resume} />
        </div>
      ) : (
        <ResumeUpload userId={userId} onSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}
