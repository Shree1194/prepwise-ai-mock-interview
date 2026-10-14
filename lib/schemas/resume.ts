import { z } from "zod";

export const resumeSkillSchema = z.object({
  name: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.string(),
});

export const resumeProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

export const parsedResumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(resumeSkillSchema),
  projects: z.array(resumeProjectSchema),
  education: z.array(z.string()),
  experience: z.array(z.string()),
  atsScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  suggestedImprovements: z.array(z.string()),
  summary: z.string(),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;

export const jdMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  readinessLevel: z.enum(["not-ready", "partially-ready", "ready", "overqualified"]),
  gapAnalysis: z.string(),
  recommendations: z.array(z.string()),
  estimatedPreparationTime: z.string(),
});

export type JDMatch = z.infer<typeof jdMatchSchema>;
