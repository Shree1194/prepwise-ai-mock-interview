"use client";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return <section className="workspace-panel" role="alert">
    <h1 className="text-2xl font-semibold">We couldn’t load this workspace</h1>
    <p className="my-4">Your saved work has not been changed. Check your connection and try again.</p>
    <button className="btn-primary" onClick={reset}>Try again</button>
  </section>;
}
