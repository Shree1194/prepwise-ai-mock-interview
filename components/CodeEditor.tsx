"use client";

import { useRef } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { LANGUAGE_LABELS, type CodingLanguage } from "@/data/coding-problems";

loader.config({ paths: { vs: "/monaco/vs" } });

interface CodeEditorProps {
  language: CodingLanguage;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange: (lang: CodingLanguage) => void;
  disabled?: boolean;
}

const MONACO_LANGUAGE_MAP: Record<CodingLanguage, string> = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "python",
  javascript: "javascript",
};

export default function CodeEditor({
  language,
  value,
  onChange,
  onLanguageChange,
  disabled = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/10 bg-dark-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-200 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-light-400">Language:</span>
          <select
            aria-label="Programming language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as CodingLanguage)}
            disabled={disabled}
            className="text-xs bg-dark-300 text-light-100 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-primary-200/50 disabled:opacity-50"
          >
            {(Object.keys(LANGUAGE_LABELS) as CodingLanguage[]).map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_LABELS[lang]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language]}
          value={value}
          onChange={(val) => onChange(val ?? "")}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            readOnly: disabled,
            lineNumbers: "on",
            tabSize: language === "python" ? 4 : 2,
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            suggest: { showKeywords: true },
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
