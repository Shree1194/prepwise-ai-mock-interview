"use server";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

export interface ScoreHistory {
  date: string;
  score: number;
  interviewId: string;
  mode?: string;
  difficulty?: string;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  avgScore: number;
  count: number;
}

export interface CategoryRadar {
  category: string;
  score: number;
}

export interface WeakTopic {
  topic: string;
  category: string;
  avgScore: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  activeDates: string[];
}

export interface AnalyticsSummary {
  totalInterviews: number;
  avgOverallScore: number;
  bestScore: number;
  recentImprovement: number;
  hiringDistribution: Record<string, number>;
  scoreHistory: ScoreHistory[];
  categoryAverages: CategoryRadar[];
  subjectPerformance: SubjectPerformance[];
  weakTopics: WeakTopic[];
  streak: StreakData;
}

function toDateString(ts: any): string {
  if (!ts) return "";
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts.toDate) return ts.toDate().toISOString().slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  return "";
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized");

  try {
    const feedbackSnap = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .where("analysisStatus", "==", "complete")
      .get();

    const feedbacks = feedbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Feedback)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (feedbacks.length === 0) {
      return { totalInterviews: 0, avgOverallScore: 0, bestScore: 0, recentImprovement: 0, hiringDistribution: {}, scoreHistory: [], categoryAverages: [], subjectPerformance: [], weakTopics: [], streak: { currentStreak: 0, longestStreak: 0, totalSessions: 0, activeDates: [] } };
    }

    const totalInterviews = feedbacks.length;
    const scores = feedbacks.map((f: any) => f.totalScore ?? 0);
    const avgOverallScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);

    // Recent improvement: compare last 3 vs previous 3
    const recent = scores.slice(0, 3);
    const previous = scores.slice(3, 6);
    const recentAvg = recent.length ? recent.reduce((a: number, b: number) => a + b, 0) / recent.length : avgOverallScore;
    const prevAvg = previous.length ? previous.reduce((a: number, b: number) => a + b, 0) / previous.length : recentAvg;
    const recentImprovement = Math.round(recentAvg - prevAvg);

    // Score history
    const scoreHistory: ScoreHistory[] = feedbacks.slice(0, 20).reverse().map((f: any) => ({
      date: toDateString(f.createdAt),
      score: f.totalScore ?? 0,
      interviewId: f.interviewId ?? "",
      mode: f.mode,
      difficulty: f.difficulty,
    }));

    // Hiring distribution
    const hiringDistribution: Record<string, number> = {};
    feedbacks.forEach((f: any) => {
      const rec = f.hiringRecommendation ?? "Unknown";
      hiringDistribution[rec] = (hiringDistribution[rec] ?? 0) + 1;
    });

    // Category averages from categoryScores
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    feedbacks.forEach((f: any) => {
      if (f.categoryScores && Array.isArray(f.categoryScores)) {
        f.categoryScores.forEach((cs: any) => {
          if (!categoryTotals[cs.name]) categoryTotals[cs.name] = { sum: 0, count: 0 };
          categoryTotals[cs.name].sum += cs.score;
          categoryTotals[cs.name].count += 1;
        });
      }
    });
    const categoryAverages: CategoryRadar[] = Object.entries(categoryTotals).map(([category, { sum, count }]) => ({
      category,
      score: Math.round(sum / count),
    }));

    // Subject performance
    const subjectMap: Record<string, { sum: number; count: number; name: string }> = {};
    feedbacks.forEach((f: any) => {
      if (f.subjectId) {
        if (!subjectMap[f.subjectId]) subjectMap[f.subjectId] = { sum: 0, count: 0, name: f.subjectName ?? f.subjectId };
        subjectMap[f.subjectId].sum += f.totalScore ?? 0;
        subjectMap[f.subjectId].count += 1;
      }
    });
    const subjectPerformance: SubjectPerformance[] = Object.entries(subjectMap).map(([subjectId, { sum, count, name }]) => ({
      subjectId,
      subjectName: name,
      avgScore: Math.round(sum / count),
      count,
    })).sort((a, b) => a.avgScore - b.avgScore);

    // Weak topics: lowest scoring categories
    const weakTopics: WeakTopic[] = categoryAverages
      .filter((c) => c.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((c) => ({ topic: c.category, category: c.category, avgScore: c.score }));

    // Streak
    const activeDates = [...new Set(feedbacks.map((f: any) => toDateString(f.createdAt)).filter(Boolean))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const dateSet = new Set(activeDates);
    const streakCursor = new Date(today);
    while (dateSet.has(streakCursor.toISOString().slice(0, 10))) {
      currentStreak++;
      streakCursor.setDate(streakCursor.getDate() - 1);
    }
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) { streak = 1; }
      else {
        const prev = new Date(activeDates[i - 1]);
        const curr = new Date(activeDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        streak = diff === 1 ? streak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    return {
      totalInterviews,
      avgOverallScore,
      bestScore,
      recentImprovement,
      hiringDistribution,
      scoreHistory,
      categoryAverages,
      subjectPerformance,
      weakTopics,
      streak: { currentStreak, longestStreak, totalSessions: totalInterviews, activeDates },
    };
  } catch {
    console.error("[PrepWise] Analytics unavailable");
    throw new Error("Unable to load your practice history. Please try again.");
  }
}
