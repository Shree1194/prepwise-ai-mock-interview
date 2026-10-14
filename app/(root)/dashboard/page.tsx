import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAnalyticsSummary } from "@/lib/actions/analytics.action";
import ScoreHistoryChart from "@/components/dashboard/ScoreHistoryChart";
import CategoryRadarChart from "@/components/dashboard/CategoryRadarChart";
import StreakCard from "@/components/dashboard/StreakCard";
import SubjectPerformanceChart from "@/components/dashboard/SubjectPerformanceChart";

const HIRING_COLORS: Record<string, string> = {
  "Strong Hire": "text-green-400 bg-green-400/10 border-green-400/20",
  Hire: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Lean Hire": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "No Hire": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Strong No Hire": "text-red-400 bg-red-400/10 border-red-400/20",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const analyticsOrNull = await getAnalyticsSummary(user.id);
  const analytics = analyticsOrNull!;
  const hasData = (analyticsOrNull?.totalInterviews ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Analytics Dashboard</h1>
        <p className="text-light-100 text-lg max-w-2xl mx-auto">
          Track your preparation progress, identify weak areas, and measure interview readiness
        </p>
      </div>

      {!hasData && (
        <div className="text-center py-16 bg-dark-200 rounded-2xl border border-white/10">
          <p className="text-5xl mb-4">📊</p>
          <h2 className="text-xl font-bold text-white mb-2">No data yet</h2>
          <p className="text-light-400 mb-6">Complete your first mock interview to see analytics here.</p>
          <Link
            href="/interview/select"
            className="px-6 py-3 bg-primary-200/20 border border-primary-200/40 text-primary-100 rounded-full font-semibold hover:bg-primary-200/30 transition-all"
          >
            Start Interview
          </Link>
        </div>
      )}

      {hasData && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Interviews", value: analytics.totalInterviews, unit: "", color: "text-white" },
              { label: "Avg Score", value: analytics.avgOverallScore, unit: "/100", color: analytics.avgOverallScore >= 70 ? "text-green-400" : analytics.avgOverallScore >= 50 ? "text-yellow-400" : "text-red-400" },
              { label: "Best Score", value: analytics.bestScore, unit: "/100", color: "text-blue-400" },
              { label: "Recent Trend", value: analytics.recentImprovement >= 0 ? `+${analytics.recentImprovement}` : analytics.recentImprovement, unit: " pts", color: analytics.recentImprovement >= 0 ? "text-green-400" : "text-red-400" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-dark-200 rounded-xl border border-white/10 p-4 text-center">
                <div className={`text-3xl font-bold ${kpi.color}`}>
                  {kpi.value}<span className="text-sm text-light-400">{kpi.unit}</span>
                </div>
                <div className="text-xs text-light-400 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Score history + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Score History</h3>
              <ScoreHistoryChart data={analytics.scoreHistory} />
            </div>
            <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Category Breakdown</h3>
              <CategoryRadarChart data={analytics.categoryAverages} />
            </div>
          </div>

          {/* Streak + Subject Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Practice Streak</h3>
              <StreakCard streak={analytics.streak} />
            </div>
            <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Subject Performance</h3>
              <SubjectPerformanceChart data={analytics.subjectPerformance} />
            </div>
          </div>

          {/* Hiring distribution + Weak topics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.keys(analytics.hiringDistribution).length > 0 && (
              <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Hiring Recommendation History</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.hiringDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([rec, count]) => (
                      <div key={rec} className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${HIRING_COLORS[rec] ?? "text-light-100 bg-dark-300 border-white/10"}`}>
                          {rec}
                        </span>
                        <div className="flex items-center gap-2 flex-1 ml-3">
                          <div className="flex-1 h-1.5 bg-dark-300 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500/60 rounded-full"
                              style={{ width: `${(count / analytics.totalInterviews) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-light-400 w-8 text-right">{count}×</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {analytics.weakTopics.length > 0 && (
              <div className="bg-dark-200 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Areas to Improve</h3>
                <div className="space-y-2">
                  {analytics.weakTopics.map((wt) => (
                    <div key={wt.topic} className="flex items-center justify-between bg-dark-300 rounded-lg px-3 py-2">
                      <span className="text-xs text-light-100">{wt.topic}</span>
                      <span className={`text-xs font-bold ${wt.avgScore < 40 ? "text-red-400" : "text-yellow-400"}`}>
                        {wt.avgScore}/100
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-light-400 mt-3">Focus on these categories in your next practice session.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
