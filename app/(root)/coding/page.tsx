import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import CodingPageClient from "./CodingPageClient";

const CodingPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Coding Interview</h1>
        <p className="text-light-100 text-lg max-w-2xl mx-auto">
          Solve engineering problems and review your approach. Remote execution is available only when a verified sandbox is configured.
        </p>
      </div>

      <CodingPageClient />
    </div>
  );
};

export default CodingPage;
