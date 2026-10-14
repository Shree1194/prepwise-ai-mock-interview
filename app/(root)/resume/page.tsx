import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getResumeByUserId } from "@/lib/actions/resume.action";
import ResumePageClient from "./ResumePageClient";

const ResumePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const existingResume = await getResumeByUserId(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Resume review</h1>
        <p className="text-light-100 text-lg max-w-2xl mx-auto">
          Review your experience and compare it with a job description. AI scores are estimates, not predictions of an ATS or hiring decision.
        </p>
      </div>
      <ResumePageClient userId={user.id} initialResume={existingResume} />
    </div>
  );
};

export default ResumePage;
