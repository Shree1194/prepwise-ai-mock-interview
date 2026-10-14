// ─── Auth ─────────────────────────────────────────────────────────────────────

interface User {
  name: string;
  email: string;
  id: string;
  resumeId?: string;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  idToken: string;
}

// ─── Interview ────────────────────────────────────────────────────────────────

type InterviewMode =
  | "technical"
  | "hr"
  | "behavioral"
  | "situational"
  | "viva"
  | "rapid-fire"
  | "resume"
  | "job-description"
  | "coding"
  | "company-specific"
  | "mixed";

type DifficultyLevel =
  | "beginner"
  | "diploma"
  | "semester"
  | "placement"
  | "final-year"
  | "gate"
  | "psu"
  | "experienced";

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;

  // v3 extended fields
  mode?: InterviewMode;
  difficulty?: DifficultyLevel;
  subjectId?: string;
  companyId?: string;
  resumeId?: string;
  jobDescription?: string;
  subjectName?: string;
  companyName?: string;
  generationMode?: "ai" | "fallback" | "provided";
  generationWarning?: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

type HiringRecommendation =
  | "Strong Hire"
  | "Hire"
  | "Lean Hire"
  | "No Hire"
  | "Strong No Hire";

interface FeedbackLearningPathItem {
  priority: "high" | "medium" | "low";
  topic: string;
  resource: string;
}

interface FeedbackCategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface Feedback {
  id: string;
  interviewId: string;
  userId?: string;
  analysisStatus: "complete" | "failed";

  // AI-generated fields — present when analysisStatus === "complete"
  totalScore?: number;
  categoryScores?: FeedbackCategoryScore[];
  hiringProbability?: number;
  recruiterScore?: number;
  hiringRecommendation?: HiringRecommendation;
  strengths?: string[];
  areasForImprovement?: string[];
  learningPath?: FeedbackLearningPathItem[];
  nextTopicsToStudy?: string[];
  subjectInsight?: string;
  finalAssessment?: string;

  // Raw transcript preserved for analytics and retry
  transcript?: Array<{ role: string; content: string }>;
  createdAt: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

// ─── Resume ───────────────────────────────────────────────────────────────────

interface ResumeSkill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: string;
}

interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

interface ResumeData {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  rawText: string;

  // AI-extracted fields
  name?: string;
  email?: string;
  phone?: string;
  skills: ResumeSkill[];
  projects: ResumeProject[];
  education?: string[];
  experience?: string[];
  atsScore?: number;
  missingSkills?: string[];
  suggestedImprovements?: string[];

  createdAt: string;
}

// ─── Coding ───────────────────────────────────────────────────────────────────

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  subject: string;
  tags: string[];
  starterCode: Record<string, string>;
  testCases: Array<{ input: string; expectedOutput: string }>;
  hints: string[];
  timeLimit: number;
  memoryLimit: number;
}

interface CodingResult {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  code: string;
  passed: boolean;
  passedCases: number;
  totalCases: number;
  executionTime?: number;
  aiReview?: string;
  score?: number;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  averageScore: number;
  interviewCount: number;
  lastScore: number;
  trend: "improving" | "declining" | "stable";
}

interface AnalyticsSummary {
  userId: string;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  subjectPerformance: SubjectPerformance[];
  weakTopics: string[];
  strongTopics: string[];
  placementReadiness: number;
  lastUpdated: string;
}

// ─── UI Props ─────────────────────────────────────────────────────────────────

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  mode?: InterviewMode;
  difficulty?: DifficultyLevel;
  subjectName?: string;
  companyName?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  mode?: InterviewMode;
  subjectName?: string;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
