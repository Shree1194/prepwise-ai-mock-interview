import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";


const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/");

  return (
    <div className="auth-layout">
      <section className="auth-intro" aria-labelledby="auth-heading">
        <p className="eyebrow">PREPWISE / E&TC WORKSPACE</p>
        <h1 id="auth-heading">Know your subject.<br />Find your words.</h1>
        <p>A focused place to rehearse engineering interviews, work through coding problems, and turn feedback into your next practice session.</p>
        <ol className="auth-steps"><li><span>01</span> Choose a subject and difficulty</li><li><span>02</span> Practise answering out loud</li><li><span>03</span> Review the evidence. Try again.</li></ol>
        <p className="auth-note">Built for Electronics & Telecommunication preparation.</p>
      </section>
      <main className="auth-form-region">{children}</main>
    </div>
  );
};

export default AuthLayout;
