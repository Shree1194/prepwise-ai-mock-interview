"use client";

import { useState, useRef, useCallback } from "react";

interface ResumeUploadProps {
  userId: string;
  onSuccess: (data: any) => void;
}

export default function ResumeUpload({ userId, onSuccess }: ResumeUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setError(null);
      setUploading(true);
      setProgress("Extracting text from PDF...");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        setProgress("Analyzing with AI...");

        const res = await fetch("/api/resume/parse", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error ?? "Upload failed");
        }

        const data = await res.json();
        onSuccess(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to analyze resume. Please try again.");
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [userId, onSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-label="Upload a resume PDF, maximum 5 megabytes"
        aria-disabled={uploading}
        onKeyDown={(event) => { if (!uploading && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-white/20 hover:border-indigo-400/50 hover:bg-dark-200"
        } ${uploading ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-light-100 text-sm">{progress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">📄</div>
            <div>
              <p className="text-white font-semibold mb-1">
                Drop your resume PDF here
              </p>
              <p className="text-light-100 text-sm">
                or click to browse files (PDF only, max 5MB)
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI will extract skills, projects, and score your resume
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive-100/10 border border-destructive-100/30 text-destructive-100 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}
