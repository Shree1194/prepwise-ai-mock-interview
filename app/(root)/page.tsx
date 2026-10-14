import Link from "next/link";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import { etcSubjects } from "@/constants/etcSubjects";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const interviews = await getInterviewsByUserId(user.id);
  return <div className="workspace-stack">
    <section className="practice-heading">
      <div><p className="eyebrow">YOUR PRACTICE WORKSPACE</p><h1>Make your next answer stronger.</h1><p>Welcome back, {user.name}. Choose one area to work on today.</p></div>
      <Link href="/interview/select" className="workspace-primary">Start an interview <span aria-hidden="true">&#8599;</span></Link>
    </section>
    <section className="practice-grid" aria-label="Practice activities">
      <Link href="/interview/select" className="activity-feature"><span className="eyebrow">01 / SPEAK</span><h2>Interview practice</h2><p>Rehearse technical explanations and behavioral answers at your own level.</p><span className="activity-action">Choose your session &#8594;</span></Link>
      <div className="activity-secondary"><Link href="/coding"><span className="eyebrow">02 / SOLVE</span><h2>Coding lab</h2><p>Work through engineering problems and review your approach.</p></Link><Link href="/resume"><span className="eyebrow">03 / REFINE</span><h2>Resume review</h2><p>Find gaps between your experience and a job description.</p></Link></div>
    </section>
    <section aria-labelledby="history-heading"><div className="section-heading"><div><p className="eyebrow">KEEP BUILDING</p><h2 id="history-heading">Your interview history</h2></div><Link href="/dashboard">View progress &#8594;</Link></div>
      {interviews?.length ? <div className="interviews-section">{interviews.map(interview => <InterviewCard key={interview.id} userId={user.id} interviewId={interview.id} role={interview.role} type={interview.type} techstack={interview.techstack} createdAt={interview.createdAt} />)}</div> : <div className="workspace-panel empty-state"><h3>Your first session starts here</h3><p>Completed feedback and saved interviews will appear in this workspace. Start with a subject you know, then tackle the gaps.</p><Link href="/interview/select">Set up your first interview &#8594;</Link></div>}
    </section>
    <section id="subjects"><div className="section-heading"><div><p className="eyebrow">FOCUS YOUR PREPARATION</p><h2>Explore E&TC subjects</h2></div></div><div className="subject-links">{etcSubjects.filter(s => s.id !== "mixed").map(subject => <Link key={subject.id} href={`/interview/select?subject=${subject.id}`}><span>{subject.name}</span><span aria-hidden="true">&#8599;</span></Link>)}</div></section>
  </div>;
}
