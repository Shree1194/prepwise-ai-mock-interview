import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, signOut } from "@/lib/actions/auth.action";
import WorkspaceNav from "@/components/WorkspaceNav";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="workspace-header">
        <Link href="/" className="workspace-brand"><Image src="/logo.svg" alt="" width={32} height={32} /><span>PrepWise<small>ENGINEERING PRACTICE</small></span></Link>
        <form action={handleSignOut}><button className="nav-signout" type="submit">Sign out</button></form>
      </header>
      <WorkspaceNav />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="workspace-footer">Practice with intention. AI feedback is a study aid, not a hiring decision.</footer>
    </div>
  );
};

export default Layout;
