import { z } from "zod";

export const INTERVIEW_MODES = [
  "technical",
  "hr",
  "behavioral",
  "situational",
  "viva",
  "rapid-fire",
  "resume",
  "job-description",
  "coding",
  "company-specific",
  "mixed",
] as const;

export const DIFFICULTY_LEVELS = [
  "beginner",
  "diploma",
  "semester",
  "placement",
  "final-year",
  "gate",
  "psu",
  "experienced",
] as const;

export type InterviewMode = (typeof INTERVIEW_MODES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const createInterviewSchema = z.object({
  role: z.string().min(1).max(120),
  level: z.string().min(1).max(80),
  techstack: z.array(z.string().min(1).max(80)).min(1).max(12),
  type: z.string().min(1).max(80),
  amount: z.number().int().min(3).max(20),
  userId: z.string().min(1).max(128),

  // Extended fields for PrepWise v3
  mode: z.enum(INTERVIEW_MODES).optional().default("technical"),
  difficulty: z.enum(DIFFICULTY_LEVELS).optional().default("placement"),
  subjectId: z.string().max(80).optional(),
  companyId: z.string().max(80).optional(),
  resumeId: z.string().max(128).optional(),
  jobDescription: z.string().max(4000).optional(),

  // Pre-generated questions (E&TC subject flow)
  questions: z.array(z.string().trim().min(1).max(300)).min(3).max(20).optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;

export const generatedQuestionsSchema = z.object({
  questions: z.array(z.string().trim().min(1).max(1000)).min(3).max(20),
});
