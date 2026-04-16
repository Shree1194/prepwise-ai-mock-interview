import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import { etcSubjects } from "@/constants/etcSubjects";

async function Home() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;
  const totalInterviews = userInterviews?.length || 0;

  return (
    <>
      {/* Hero CTA Section */}
      <section className="relative card-cta overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="flex flex-col gap-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/40 w-fit">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              🎓 E&TC Final Year
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            Ace Your <span className="text-gradient-purple">E&TC Interview</span> with AI-Powered Practice
          </h2>

          <p className="text-lg text-light-100">
            Get interview-ready with AI voice simulations, real-time feedback, and personalized analysis — built exclusively for Electronics & Telecommunication students.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/interview/select">🎙️ Start Interview Now</Link>
            </Button>
            <Button asChild className="btn-secondary max-sm:w-full">
              <Link href="#subjects">Browse Subjects</Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mt-2">
            <div>
              <p className="text-2xl font-bold text-white">{totalInterviews}</p>
              <p className="text-xs text-light-100">Interviews Done</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">{etcSubjects.length - 1}</p>
              <p className="text-xs text-light-100">Subjects Available</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="text-xs text-light-100">Powered Analysis</p>
            </div>
          </div>
        </div>

        <Image
          src="/robot.png"
          alt="AI Interviewer"
          width={380}
          height={380}
          className="max-sm:hidden relative z-10 drop-shadow-2xl"
        />
      </section>

      {/* E&TC Subjects Section */}
      <section id="subjects" className="flex flex-col gap-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2>E&TC Subjects</h2>
            <p className="text-light-100 mt-1">Choose your focus area for targeted practice</p>
          </div>
          <Button asChild className="btn-primary">
            <Link href="/interview/select">Start Interview →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {etcSubjects.filter(s => s.id !== "mixed").map((subject) => (
            <Link
              key={subject.id}
              href={`/interview/select?subject=${subject.id}`}
              className="glass-card p-4 text-center hover:scale-105 transition-all duration-300 group cursor-pointer"
              style={{ borderColor: subject.color + "33" }}
            >
              <div className="text-3xl mb-2">{subject.icon}</div>
              <p className="text-xs font-semibold text-white group-hover:text-primary-100 transition-colors">
                {subject.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* User's Past Interviews */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="glass-card p-8 w-full text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-white mb-2">No interviews yet!</h3>
              <p className="text-light-100 mb-4">Start your first E&TC mock interview to track your progress</p>
              <Button asChild className="btn-primary">
                <Link href="/interview/select">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Available Community Interviews */}
      {hasUpcomingInterviews && (
        <section className="flex flex-col gap-6 mt-8">
          <h2>Community Interviews</h2>

          <div className="interviews-section">
            {allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Home;
