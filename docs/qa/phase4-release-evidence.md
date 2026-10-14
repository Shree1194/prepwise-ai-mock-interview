# Phase 4 release candidate evidence — 15 October 2026

This is a release-candidate verification of the current working tree. It is not a production deployment or a claim that external user journeys are complete.

## Feature status

| Feature | Status | Evidence and remaining work |
|---|---|---|
| Sign-up and sign-in UI | Verified with local browser rendering | Sign-in rendered at desktop and 390 px; sign-up rendered at 390 px. Inputs had accessible names and no browser errors or warnings (one React DevTools informational message). This phase did not submit credentials or create a cloud account. |
| Firebase Authentication provider | Verified live in prior recorded checks | Auth create/delete was previously verified. Session persistence and sign-out as a full browser journey were not re-run in this phase; use an authorized staging account. |
| Interview question setup and persisted history | Implemented but unverified end to end | Prior local authenticated UI review and mocked ownership tests exist. Firebase Auth/Firestore CRUD was previously verified, but index deployment was denied; create, reopen, and foreign-owner denial should be rechecked in staging after indexes are enabled. |
| Vapi voice interview | Blocked by external configuration | No live call, microphone grant, transcript, termination, or save flow was exercised. Verify the scoped web token, workflow/provider permissions, and browser microphone setup in staging. |
| Gemini provider | Verified live, synthetic smoke only | `npm run test:ai` previously completed one structured-output request using a fixed synthetic prompt. This is not proof that interview feedback or resume analysis completes. |
| Complete AI feedback | Implemented but unverified | Local tests verify failure preservation and no fabricated scores. The end-to-end voice transcript → live feedback → Firestore save → history reopen journey needs staging verification. |
| Resume parse and analysis | Implemented but unverified | Validation and owner isolation are tested locally. No PDF was uploaded in this phase. Use a synthetic/approved PDF and a staging Firebase project to verify parsing, save/reopen, deletion, and cross-user denial. |
| PDF report generation | Verified with synthetic fixture | The test suite creates and validates a multi-page PDF. Browser download using a real saved feedback record was not tested in this phase. |
| Coding workspace and problem selection | Verified with local UI evidence | Responsive screenshots and prior browser review are in `docs/qa`; sign-in and sign-up were rechecked at mobile width in this phase. AI review with a live provider was not re-run. |
| Arbitrary code execution | Intentionally disabled for security | The API remains 503 while disabled and now also fails closed when the private HTTPS executor URL/key are absent or the configured host is public Judge0 CE. Tests verify no submission occurs without valid configuration. No private sandbox was available for isolation testing. |
| Firebase Storage writes | Blocked by external configuration | Prior staging/cloud verification failed. No cloud write was repeated here. Confirm the exact bucket and service-account IAM, then run the guarded staging verifier. |
| Firestore indexes/rules deployment | Blocked by external permissions | Prior index deployment was denied. Use an authorized staging project administrator and the exact explicit-project deployment command in `DEPLOYMENT.md`. |

## Checks run in this phase

- `npm test`: 13/13 passed, including two new fail-closed executor configuration tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: passed, zero production dependency vulnerabilities.
- Full `npm audit`: four high-severity development dependency findings remain through `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`; npm's suggested fix is a major-version plugin downgrade.
- Production build: the workspace's installed Next.js file `node_modules/next/dist/server/lib/incremental-cache/tags-manifest.external.js` was reported by Windows as corrupted/unreadable, so the in-place build could not run. A temporary source copy (excluding credentials, `.git`, `node_modules`, and prior build outputs) was installed with the lockfile and built successfully using ephemeral placeholder Firebase values and a newly generated non-production key. Next compiled successfully, validated types, collected page data, generated 17/17 static pages, and completed trace collection. No cloud calls were made by this build.
- Browser: local sign-in at desktop and 390 px and sign-up at 390 px rendered; current screenshots are `phase4-signin-desktop.png`, `phase4-signin-mobile.png`, and `phase4-signup-mobile.png`. Horizontal overflow difference was zero at sign-in desktop and mobile. Console contained no errors/warnings; React DevTools and Fast Refresh logged informational messages. This phase did not submit auth forms or visit authenticated flows in the browser.
- `git diff --check`: run after edits; line-ending warnings are expected for existing mixed-CRLF files.

## Required owner actions before a live demonstration

1. Choose an authorized staging Firebase project, confirm its project ID, enable email/password auth, and provision the correct Admin IAM and Storage bucket access.
2. Have a Firebase administrator deploy `firestore.indexes.json`, `firestore.rules`, and `storage.rules` to that explicit staging project, then confirm all indexes are enabled.
3. Configure the Vapi workflow and scoped browser token; test microphone allow/deny, call completion, transcript capture, feedback save, and history reopen.
4. Run a synthetic/approved resume through parse, analysis, save, reopen, delete, and another-user denial.
5. Keep code execution disabled. If a runner is later provisioned, independently verify private network isolation, API authentication, quotas, resource limits, timeout behavior, and rate limiting. Replace the current process-local limiter with a shared production limiter before enabling it.
6. Recheck the four dev-only dependency advisories after a compatible Next 15 ESLint dependency fix is available.

Prior responsive screenshots and detailed design review are in [Phase 2 QA evidence](./phase2-design-evidence.md). Cloud integration evidence and guarded staging commands are in [Integration readiness](../INTEGRATION_READINESS.md).
