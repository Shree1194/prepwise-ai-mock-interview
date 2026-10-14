import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import InterviewSetup from "@/components/InterviewSetup";

const SelectInterviewPage = async ({ searchParams }: { searchParams: Promise<{ subject?: string }> }) => {
  const { subject } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">
          E&TC Mock Interview
        </h1>
        <p className="text-light-100 text-lg max-w-2xl mx-auto">
          Configure your AI interview session — choose your mode, subject, and difficulty
        </p>
      </div>

      <InterviewSetup userId={user.id} userName={user.name} initialSubject={subject} />
    </div>
  );
};

export default SelectInterviewPage;
