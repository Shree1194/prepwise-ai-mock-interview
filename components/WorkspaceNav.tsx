"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [["/", "Overview"], ["/interview/select", "Interview"], ["/coding", "Coding"], ["/resume", "Resume"], ["/dashboard", "Progress"]];

export default function WorkspaceNav() {
  const pathname = usePathname();
  return <nav aria-label="Workspace" className="workspace-nav">{links.map(([href, label]) => (
    <Link key={href} href={href} aria-current={pathname === href || (href === "/interview/select" && pathname.startsWith("/interview")) ? "page" : undefined}>{label}</Link>
  ))}</nav>;
}
