import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import NeuralBackground from "@/components/NeuralBackground";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <NeuralBackground />

      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.svg" alt="E&TC MockMate Logo" width={38} height={32} />
          <div>
            <h2 className="text-primary-100 group-hover:text-white transition-colors leading-tight">
              PrepWise
            </h2>
            <p className="text-xs text-light-400 leading-tight -mt-1">E&TC Edition</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-success-100 animate-pulse" />
            <span className="text-xs text-indigo-300 font-medium">AI Ready</span>
          </div>
          <Link
            href="/interview/select"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-primary-200/20 border border-primary-200/30 text-primary-100 hover:bg-primary-200/30 transition-all duration-200"
          >
            New Interview
          </Link>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
