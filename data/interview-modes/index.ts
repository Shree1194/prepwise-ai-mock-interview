// ─── Interview Mode Definitions ────────────────────────────────────────────────

export interface InterviewModeDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  vapiSystemPromptAddition: string;
  questionInstructions: string;
  estimatedDuration: string;
  availableFor: ("technical" | "hr" | "mixed")[];
}

export const INTERVIEW_MODES: InterviewModeDefinition[] = [
  {
    id: "technical",
    label: "Technical",
    description: "Deep technical questions on E&TC concepts, circuits, and engineering theory",
    icon: "⚙️",
    color: "#6366f1",
    estimatedDuration: "15–30 min",
    availableFor: ["technical"],
    vapiSystemPromptAddition:
      "Focus exclusively on technical accuracy. Ask for definitions, derivations, circuit analysis, and problem-solving. Follow up on incomplete answers. Challenge the candidate with deeper sub-questions.",
    questionInstructions:
      "Generate rigorous technical questions covering theory, derivations, circuit analysis, and practical applications.",
  },
  {
    id: "hr",
    label: "HR Round",
    description: "Motivation, career goals, strengths, weaknesses, and cultural fit",
    icon: "🤝",
    color: "#10b981",
    estimatedDuration: "10–20 min",
    availableFor: ["hr"],
    vapiSystemPromptAddition:
      "Focus on soft skills, motivation, and culture fit. Ask about career goals, strengths and weaknesses, team experience, and why the candidate chose E&TC. Be warm and conversational.",
    questionInstructions:
      "Generate HR and behavioral questions about motivation, career plans, strengths/weaknesses, teamwork, communication, and goal setting for an E&TC engineering candidate.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "STAR-format questions: Situation, Task, Action, Result from your experience",
    icon: "🎭",
    color: "#f59e0b",
    estimatedDuration: "15–25 min",
    availableFor: ["mixed"],
    vapiSystemPromptAddition:
      "Use STAR format for all questions. Ask about specific past situations from the candidate's academic projects, internships, or lab experience. Probe for their specific role, actions taken, and results achieved.",
    questionInstructions:
      "Generate behavioral STAR-format questions relevant to engineering students: project challenges, team conflicts, technical problem-solving experiences, failures and learnings.",
  },
  {
    id: "situational",
    label: "Situational",
    description: "Hypothetical engineering scenarios: how would you handle this situation?",
    icon: "🧭",
    color: "#8b5cf6",
    estimatedDuration: "15–25 min",
    availableFor: ["mixed"],
    vapiSystemPromptAddition:
      "Present hypothetical engineering scenarios and ask the candidate how they would approach them. Focus on their reasoning process, not just the answer. Use follow-ups like 'What if the constraint changed to X?'",
    questionInstructions:
      "Generate situational questions presenting realistic E&TC engineering scenarios: circuit troubleshooting, system design trade-offs, project management under constraints, choosing between technologies.",
  },
  {
    id: "viva",
    label: "Viva / Oral",
    description: "Academic viva style: define, derive, explain your project and decisions",
    icon: "🎓",
    color: "#06b6d4",
    estimatedDuration: "10–20 min",
    availableFor: ["technical"],
    vapiSystemPromptAddition:
      "Conduct an academic viva examination. Ask for definitions, derivations, and explanations of concepts. Ask 'Why?' and 'How?' follow-ups. Challenge assumptions. Focus on depth of understanding.",
    questionInstructions:
      "Generate viva-style questions: ask for precise definitions, mathematical derivations, explain working principles, draw circuit diagrams verbally, and state advantages/disadvantages of techniques.",
  },
  {
    id: "rapid-fire",
    label: "Rapid Fire",
    description: "Quick concept checks — 30 seconds per answer, tests breadth of knowledge",
    icon: "⚡",
    color: "#ef4444",
    estimatedDuration: "5–10 min",
    availableFor: ["technical", "mixed"],
    vapiSystemPromptAddition:
      "Ask short, direct questions that require 1-2 sentence answers. Move quickly between questions. Do not give the candidate time to elaborate. Cover as many topics as possible.",
    questionInstructions:
      "Generate rapid-fire questions: short fact-check questions requiring one-sentence answers. Cover a broad range of E&TC topics. No complex derivations — just quick recall and conceptual clarity.",
  },
  {
    id: "resume",
    label: "Resume Based",
    description: "Questions generated from your uploaded resume — your projects and skills",
    icon: "📄",
    color: "#14b8a6",
    estimatedDuration: "20–30 min",
    availableFor: ["mixed"],
    vapiSystemPromptAddition:
      "Questions are based on the candidate's resume. Ask about specific projects, technologies listed, and their roles. Probe for depth in claimed skills. Ask 'Walk me through this project' style questions.",
    questionInstructions:
      "Generate resume-based questions from the provided skills and project information. Ask about specific technologies, project decisions, challenges faced, and outcomes achieved.",
  },
  {
    id: "job-description",
    label: "Job Description",
    description: "Targeted to a specific JD — questions matching the role requirements",
    icon: "📋",
    color: "#f97316",
    estimatedDuration: "20–30 min",
    availableFor: ["technical", "mixed"],
    vapiSystemPromptAddition:
      "Questions are based on the job description provided. Focus on skills and requirements listed in the JD. Test whether the candidate meets the role requirements.",
    questionInstructions:
      "Generate interview questions that directly target the skills, tools, and responsibilities listed in the job description. Ensure coverage of all critical requirements.",
  },
  {
    id: "company-specific",
    label: "Company Specific",
    description: "Interview style and questions tailored to a specific company's culture",
    icon: "🏢",
    color: "#dc2626",
    estimatedDuration: "20–40 min",
    availableFor: ["technical", "hr", "mixed"],
    vapiSystemPromptAddition:
      "Conduct this interview in the style of the specified company. Adjust difficulty, question types, and focus areas to match the company's known interview pattern.",
    questionInstructions:
      "Generate interview questions matching the specified company's interview style. Consider the company's domain, products, and known interview patterns for E&TC roles.",
  },
  {
    id: "mixed",
    label: "Mixed",
    description: "A balanced combination of technical, HR, and behavioral questions",
    icon: "🔀",
    color: "#ec4899",
    estimatedDuration: "20–35 min",
    availableFor: ["technical", "hr", "mixed"],
    vapiSystemPromptAddition:
      "Cover a mix of technical, behavioral, and HR questions. Balance depth with breadth. Start with easier questions and gradually increase difficulty.",
    questionInstructions:
      "Generate a balanced mix of technical E&TC questions (60%), behavioral questions (25%), and HR questions (15%).",
  },
];

export function getModeById(id: string): InterviewModeDefinition | undefined {
  return INTERVIEW_MODES.find((m) => m.id === id);
}

export function getModeLabel(id: string): string {
  return getModeById(id)?.label ?? id;
}
