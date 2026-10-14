// ─── Difficulty Level Definitions ─────────────────────────────────────────────

export interface DifficultyDefinition {
  id: string;
  label: string;
  description: string;
  targetAudience: string;
  questionStyle: string;
  estimatedLevel: string;
  color: string;
  icon: string;
}

export const DIFFICULTIES: DifficultyDefinition[] = [
  {
    id: "beginner",
    label: "Beginner",
    description: "Basic conceptual questions, definitions, and fundamental theory",
    targetAudience: "First/second year students, absolute beginners",
    questionStyle: "Definition-based, true/false, fill-in-the-blank style explanations",
    estimatedLevel: "School → 1st Year Engineering",
    color: "#10b981",
    icon: "🌱",
  },
  {
    id: "diploma",
    label: "Diploma",
    description: "Fundamental theory, basic circuit analysis, lab-level understanding",
    targetAudience: "Diploma holders, polytechnic students",
    questionStyle: "Theory with basic numerical, circuit identification",
    estimatedLevel: "Polytechnic / Diploma Level",
    color: "#06b6d4",
    icon: "📘",
  },
  {
    id: "semester",
    label: "Semester Exam",
    description: "University exam level — theory, derivations, moderate numericals",
    targetAudience: "3rd/4th semester engineering students",
    questionStyle: "Derivations, moderate analysis, typical exam questions",
    estimatedLevel: "3rd – 5th Semester BE/B.Tech",
    color: "#6366f1",
    icon: "📝",
  },
  {
    id: "placement",
    label: "Placement Ready",
    description: "Balanced mix of theory, application, and problem-solving for campus placements",
    targetAudience: "Final year students preparing for campus recruitment",
    questionStyle: "HR + Technical mix, applied concepts, company interview style",
    estimatedLevel: "Final Year BE/B.Tech Placement",
    color: "#f59e0b",
    icon: "🎯",
  },
  {
    id: "final-year",
    label: "Final Year",
    description: "Advanced concepts, project-based questions, viva-level depth",
    targetAudience: "Final year students with projects, internship experience",
    questionStyle: "Deep technical, project discussion, design trade-offs",
    estimatedLevel: "Final Year / Project Viva",
    color: "#8b5cf6",
    icon: "🎓",
  },
  {
    id: "gate",
    label: "GATE",
    description: "GATE exam level — analytical, numerical, and deep conceptual",
    targetAudience: "GATE aspirants preparing for PSU/M.Tech admissions",
    questionStyle: "Multiple-correct, numerical answer type, concept trap questions",
    estimatedLevel: "GATE 2025/2026",
    color: "#ef4444",
    icon: "🔴",
  },
  {
    id: "psu",
    label: "PSU Interview",
    description: "Public Sector Undertaking interview — rigorous theory, standards, operations",
    targetAudience: "Candidates appearing for ISRO, DRDO, BEL, BHEL, ONGC, NTPC etc.",
    questionStyle: "Comprehensive theory, industry standards, real-world applications",
    estimatedLevel: "PSU / Government Job Interview",
    color: "#dc2626",
    icon: "🏛️",
  },
  {
    id: "experienced",
    label: "Experienced Engineer",
    description: "Senior-level: architecture decisions, design trade-offs, complex debugging",
    targetAudience: "2+ years working professionals switching or growing in E&TC domain",
    questionStyle: "System design, architecture, lessons learned, production challenges",
    estimatedLevel: "2–10 Years Professional Experience",
    color: "#475569",
    icon: "👨‍💼",
  },
];

export function getDifficultyById(id: string): DifficultyDefinition | undefined {
  return DIFFICULTIES.find((d) => d.id === id);
}

export function getDifficultyLabel(id: string): string {
  return getDifficultyById(id)?.label ?? id;
}
