# PrepWise Production Deployment Guide

This guide covers the production infrastructure required before PrepWise can be treated as deployable.

## Architecture and request flow

```mermaid
flowchart LR
  Browser -->|ID token exchange, then HttpOnly session cookie| App[Next.js actions and API routes]
  Browser -->|public scoped browser token| Vapi[Vapi voice workflow]
  App -->|verify user and owner| Firebase[Firebase Admin]
  Firebase --> Firestore[(Firestore)]
  App -->|bounded structured generation| AI[Gemini / optional provider fallback]
  App -->|private authenticated endpoint only| Runner[Judge0 sandbox; disabled by default]
```

For voice interviews, generated prompts are returned to the browser, Vapi handles the voice session, and the browser submits the captured transcript to the authenticated feedback action. Resume uploads are size/type checked and parsed by the app server; extracted text and analysis are stored in Firestore. The original PDF is not stored in Firebase Storage by the current flow. Admin SDK calls bypass Firestore rules, so ownership checks in server actions are part of the security boundary.

## Required Services

- Firebase Authentication with email/password provider enabled.
- Cloud Firestore in production mode.
- Firebase Storage bucket.
- At least one AI provider API key (Gemini is the configured default); OpenAI/Anthropic fallback keys are optional.
- Vapi public web token and workflow ID when enabling live voice interviews.
- Vercel or Docker-capable host for the Next.js app.

Code execution is disabled by default. Keep it disabled until a private, isolated Judge0 deployment is configured and reviewed. The app has no public endpoint fallback and requires an explicit authenticated HTTPS endpoint.

## Local setup

Use Node.js 22 or newer and npm. Install the locked dependencies, create `.env.local` from `.env.example`, and fill the Firebase client/Admin values plus at least one AI provider key before exercising authenticated or AI-backed routes:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Firebase email/password auth and Firestore must be configured for sign-in and interview history. The optional browser editor assets are prepared by the `predev`/`prebuild` scripts. Never put server credentials in `NEXT_PUBLIC_*` values. Keep `CODE_EXECUTION_ENABLED=false` until the private executor checks below pass.

## Environment

Create `.env.production` from `.env.production.example` and fill every required value.

Required app values:

```env
NODE_ENV=production
APP_URL=https://your-production-domain.example
NEXT_PUBLIC_BASE_URL=https://your-production-domain.example
INTERNAL_API_SECRET=<long-random-secret>
LOG_REQUESTS=false
LOG_LEVEL=info
```

Required Firebase client values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Required Firebase Admin values:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=
```

At least one AI provider key is required. Gemini is the configured default; OpenAI and Anthropic keys are optional fallback providers. Voice values are required only for live Vapi interviews:

```env
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_PROVIDER_ORDER=gemini,openai,claude
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-haiku-latest
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=
```

Optional code execution values (leave disabled until the executor is verified):

```env
CODE_EXECUTION_ENABLED=false
JUDGE0_API_BASE_URL=https://your-private-judge0.example
JUDGE0_API_KEY=
```

## Firebase Setup

1. Enable Firebase Authentication email/password sign-in.
2. Create Cloud Firestore.
3. Create Firebase Storage.
4. Create a service account key with Admin SDK access.
5. Add the Admin SDK values to `.env.production`.
6. After confirming the target project and administrator authorization, deploy rules and indexes to the explicit project:

```bash
firebase deploy --only firestore:indexes,firestore:rules,storage --project your-project-id
```

The repository includes:

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `firebase.json`

## Code execution setup

The application integrates with Judge0's submission API, not Piston. It requires an explicit HTTPS `JUDGE0_API_BASE_URL` and `JUDGE0_API_KEY`, and rejects the known public `ce.judge0.com` host. User-submitted code is untrusted; keep `CODE_EXECUTION_ENABLED=false` until the configured service has independently verified isolation, quotas, and network restrictions.

Local production smoke test:

```bash
docker compose up --build
```

The compose file runs:

- `prepwise` on port `3000`

For hosted environments, configure the private service's HTTPS URL and API key. The app checks that both are present and refuses the known public CE host; this does not prove that an endpoint is private or isolated. Independently verify its network boundary, authentication, resource limits, and quotas before enabling execution.

## Vercel Deployment

1. Create a Vercel project from this repository.
2. Add every value from `.env.production.example` to Vercel environment variables.
3. Keep `CODE_EXECUTION_ENABLED=false` unless a private Judge0 executor is verified.
4. Deploy with:

```bash
vercel --prod
```

`vercel.json` configures the Next.js framework, install/build commands, region, and API route durations.

## Docker Deployment

Build and run the standalone Next.js image:

```bash
docker build -t prepwise .
docker run --env-file .env.production -p 3000:3000 prepwise
```

Run the app locally with Docker Compose:

```bash
docker compose up --build
```

To validate the compose file before creating real secrets:

```bash
PREPWISE_ENV_FILE=.env.production.example docker compose config
```

## Verification

Run static checks:

```bash
npm run typecheck
npm run lint
npm run build
```

Run production dependency checks:

```bash
npm run verify:production -- .env.staging
```

This command makes temporary Auth, Firestore, and Storage writes. It refuses to run unless `VERIFY_ALLOW_CLOUD_MUTATIONS=true` is set and `VERIFY_FIREBASE_PROJECT_ID` exactly matches the Firebase project ID in the provided env file. Use only an explicitly authorized staging project. Judge0 reachability is checked only when a private `JUDGE0_API_BASE_URL` is configured; the script never probes public Judge0 CE by default. See [Integration readiness](docs/INTEGRATION_READINESS.md) for the guarded staging command and cleanup behavior.

This checks:

- Firebase Auth create/delete user.
- Firestore write/read/delete.
- Storage write/delete.
- Judge0 runtime availability.
- `/api/health` when `APP_URL` is configured.

Start the production app:

```bash
npm start
```

## Recruiter demonstration checklist

Use a staging project and synthetic/demo data. Confirm the account is disposable, verify the host and Firebase project before signing in, and do not use a real candidate resume without consent.

- Show sign-in, protected navigation, session persistence, and sign-out.
- Create an interview and show its questions. Start a live Vapi call only after confirming provider setup and granting microphone permission; otherwise explain that this integration is configured but unverified.
- If the call completes, end it, inspect the transcript and feedback status, reopen the saved session from history, and download its report.
- Upload only a synthetic or approved resume, then show parse results, saved analysis, and owner-only access.
- Open a coding problem, demonstrate editor/problem selection and AI review, then show that execution remains unavailable until the private sandbox is verified.
- Distinguish live results from local tests, mocks, and saved screenshots. Never claim complete workflows based on configuration presence or a health response.

Then verify the full user workflows manually:

- Sign up, login, logout, session persistence, protected routes.
- Interview setup and interview creation.
- Vapi voice interview connection, microphone, transcript, and end flow.
- Gemini/OpenAI/Claude fallback feedback generation and PDF download.
- Resume PDF upload, parsing, ATS score, skill extraction, Firestore save.
- Monaco coding editor and AI review. Code execution returns 503 while disabled.
- Dashboard charts, analytics, Firestore reads, empty states.

## Health and Logging

`GET /api/health` is a read-only liveness check. `GET /api/health?deep=1` checks Firebase Auth, Firestore, Storage, Judge0 reachability, and AI provider configuration. Deep checks use privileged Firebase operations and a temporary Storage object, so production requires `INTERNAL_API_SECRET` in the `x-prepwise-internal-secret` header. The deep dependency checks run concurrently with bounded timeouts. Do not expose this secret to a public monitoring probe. See [Integration readiness](docs/INTEGRATION_READINESS.md).

Request logging is controlled by:

```env
LOG_REQUESTS=true
LOG_LEVEL=info
```

Every response receives an `x-request-id` header. API handlers use structured server logging for provider fallback and service health failures.

## Security Controls

Configured controls include:

- Strict Firestore and Storage rules.
- CSP and secure headers in `next.config.ts`.
- Same-origin checks for mutating API routes.
- In-memory per-process per-route rate limits. These are not distributed across serverless instances; code execution must remain disabled until production uses a shared limiter as well as the reviewed private sandbox.
- Zod input validation.
- PDF type, size, and file signature validation.
- Prompt-injection resistant system prompts for resume, interview, and feedback generation.
- Code execution remains disabled until a private Judge0 endpoint is verified; request timeout and resource limits are configured in the API payload.

## Current deployment blockers

- Storage write/delete verification failed in the available Firebase environment; verify bucket IAM, bucket name, and service account permissions.
- Firestore index deployment was denied by current credentials. Deploy `firestore.indexes.json` and security rules using an authorized Firebase project administrator.
- No private Judge0 endpoint was configured or verified. Execution now fails closed without an explicit HTTPS endpoint and API key and rejects the known public CE host. The current rate limiter is process-local, so keep execution disabled until the sandbox is independently reviewed and production rate limiting is shared across instances.
- Live Vapi calls, AI-backed feedback, and resume parsing were not verified end to end in this phase. Local Vapi and Gemini variable names are configured, but Vapi credentials/workflow/microphone access remain unverified. Google's previous `gemini-2.0-flash` model shut down on 1 June 2026; the code now uses `gemini-3.8-flash`. The synthetic live smoke test authenticated to Google's model catalog and successfully generated structured output after earlier transient HTTP 503 responses. Verify quotas and the complete feedback/resume workflows in staging before treating those flows as production-ready.
- `npm audit` still reports four high-severity dev-tool advisories in the Next 15 ESLint plugin's pinned `fast-glob` dependency tree.

The current audit's four findings are `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` (high severity, development-only). The installed tree is `@next/eslint-plugin-next@15.5.28` → `fast-glob@3.3.3` → `micromatch@4.0.8` → `braces@3.0.3`; the registry still offers `braces@3.0.3`, within the advisory range. npm offers only a downgrade to plugin 14.2.35 as a fix, which is a major-version change, so no incompatible downgrade was applied. Recheck `npm audit` when a compatible upstream dependency fix is released. Production-only audit (`npm audit --omit=dev`) is clean in this environment.

Phase 3's recorded local production build, unit/security tests, typecheck, lint, and responsive browser review passed on 15 October 2026. In Phase 4, 13 unit/security tests, typecheck, lint, and the production-only audit passed. The workspace's installed Next.js incremental-cache file is unreadable by Windows, so its in-place build failed; a clean temporary source copy with a lockfile install and synthetic Firebase build configuration completed the production build. Neither build evidence clears the external-service blockers above. See the [Phase 2 design evidence and captures](docs/qa/phase2-design-evidence.md) and [Phase 4 release evidence](docs/qa/phase4-release-evidence.md).

See [Integration readiness](docs/INTEGRATION_READINESS.md) for exact environment variable names, service permissions, per-integration verification status, and owner-run staging commands. Do not deploy Firebase indexes/rules or run cloud verification without confirming the target project and authorization.
