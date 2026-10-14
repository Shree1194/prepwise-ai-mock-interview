# Phase 2 design evidence — 15 October 2026

## Direction

Keep PrepWise's established dark engineering-workspace identity and restrained mint accent. Make interview practice, coding practice, resume refinement, and progress feel like connected work areas. Prioritize clear task state, readable content, keyboard access, and a usable narrow-screen flow over ornamental redesign. Do not imply that a live interview, AI analysis, or code execution succeeded when its external service is unavailable.

## Browser findings and decisions

- The coding workspace's desktop problem/editor split was retained. At phone widths, the problem is selected through a labeled native control and its panel has a bounded height, keeping the editor and output controls reachable without an oversized problem scroll. Problem switching was exercised in the browser; the starter code and statement changed together.
- The editor now has a concise loading status. The 503 executor state is communicated as unavailable with next steps, rather than a failed test count that could be mistaken for a code result. AI review errors are visible in the page.
- Problem statements now render emphasis and inline code without injecting HTML. This keeps the statement readable while treating its content as data.
- Sign-up's conditionally rendered name field caused server/client-generated form IDs to differ. It now uses the same controlled form primitives as the other fields; a fresh sign-up render produced no hydration error.
- Other reviewed states: overview and subject links, empty progress history, interview setup, an existing interview session, pending feedback, and resume upload. The real QA account was used only for read-only viewing; no resume was uploaded and no live voice interview was started.

## External evidence

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — reflow, keyboard focus visibility, focus order, and target size inform responsive and keyboard behavior. **Confidence: high; normative accessibility standard.**
- [web.dev: Accessibility of forms](https://web.dev/learn/forms/accessibility) — explicit labels and associated validation feedback inform the auth form. **Confidence: high; implementation guidance from the web.dev team.**
- [Nielsen Norman Group: Visibility of system status](https://www.nngroup.com/articles/visibility-system-status/) — clear, timely status language informs the executor's unavailable message and editor loading state. **Confidence: medium-high; established usability guidance.**
- [HackerRank Interviews overview](https://support.hackerrank.com/articles/9059560249-introduction-to-hackerrank-interviews) and [CodeSignal practice content](https://support.codesignal.com/hc/en-us/articles/12984563824279-Practice-Content-Overview) — problem context, editor, and output/testing are familiar coding-practice concepts. These informed workflow structure, not visual copying. **Confidence: medium; vendor product documentation.**

## Captures

Responsive route captures and coding before/after states are in this folder. `phase2-coding-after-1440.png`, `phase2-coding-after-768.png`, and `phase2-coding-after-375.png` show the updated workspace. `phase2-coding-disabled-375.png` records the disabled executor state. `phase2-signin-*` and `phase2-signup-*` show public auth at desktop and phone widths. Existing `phase2-{overview,progress,interview-setup,interview-session,interview-feedback,resume}-*` files record the authenticated route review at desktop, tablet, and phone sizes.

## Limits

Browser checks used a local authenticated QA session and local development server. They establish UI state and layout, not live Vapi, production Firebase Storage, AI-provider reliability, or isolated remote execution. Those service blockers remain in [DEPLOYMENT.md](../../DEPLOYMENT.md).
