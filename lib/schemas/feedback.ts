import { z } from "zod";

// Ordered list — used in the feedback prompt and UI rendering
export const FEEDBACK_CATEGORIES = [
  "Technical Knowledge",
  "Subject Knowledge",
  "Problem Solving",
  "Communication Skills",
  "Confidence & Clarity",
  "Fluency & Grammar",
  "Conceptual Depth",
  "Answer Relevance",
  "Practical Awareness",
  "Overall Impression",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const hiringRecommendationSchema = z.enum([
  "Strong Hire",
  "Hire",
  "Lean Hire",
  "No Hire",
  "Strong No Hire",
]);

export const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),

  categoryScores: z.array(
    z.object({
      name: z.enum(FEEDBACK_CATEGORIES),
      score: z.number().min(0).max(100),
      comment: z.string().min(1).max(3000),
    })
  ).length(10).refine(categories => new Set(categories.map(category => category.name)).size === 10, "Each category must appear exactly once"),

  hiringProbability: z.number().min(0).max(100),
  recruiterScore: z.number().min(0).max(100),
  hiringRecommendation: hiringRecommendationSchema,

  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),

  learningPath: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      topic: z.string(),
      resource: z.string(),
    })
  ),

  nextTopicsToStudy: z.array(z.string()),

  subjectInsight: z.string(),
  finalAssessment: z.string(),
});

export type FeedbackObject = z.infer<typeof feedbackSchema>;
