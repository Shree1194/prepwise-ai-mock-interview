import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import SubjectSelector from "@/components/SubjectSelector";

const SelectInterviewPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">
          E&TC Mock Interview
        </h1>
        <p className="text-light-100 text-lg max-w-2xl mx-auto">
          Practice with an AI interviewer specialized in Electronics &amp; Telecommunication engineering topics
        </p>
      </div>

      <SubjectSelector userId={user.id} userName={user.name} />
    </div>
  );
};

export default SelectInterviewPage;
