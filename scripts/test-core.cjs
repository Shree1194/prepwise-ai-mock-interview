const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');

function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const localRequire = id => {
    if (id in mocks) return mocks[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const base = id.startsWith('@/') ? path.resolve(id.slice(2)) : path.resolve(path.dirname(filename), id);
      return load(fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'), mocks);
    }
    return require(id);
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: localRequire, process, Buffer, console, URL, Request, Response, setTimeout, clearTimeout, AbortSignal }, { filename });
  return module.exports;
}

const neverDb = { collection() { throw new Error('Database accessed before authorization'); } };
const authMock = user => ({ '@/lib/actions/auth.action': { getCurrentUser: async () => user }, '@/firebase/admin': { db: neverDb }, '@/lib/aiFallback': { generateObjectWithFallback: async () => { throw new Error('AI unavailable'); } } });

test('unauthenticated and foreign-user reads never reach database', async () => {
  for (const user of [null, { id: 'alice' }]) {
    const general = load('lib/actions/general.action.ts', authMock(user));
    assert.equal((await general.getInterviewsByUserId('bob')).length, 0);
    assert.equal((await general.getUserFeedbackHistory('bob')).length, 0);
    assert.equal(await general.getFeedbackByInterviewId({ interviewId: 'x', userId: 'bob' }), null);
    assert.equal((await general.createFeedback({ interviewId: 'x', userId: 'bob', transcript: [] })).success, false);
    const resume = load('lib/actions/resume.action.ts', authMock(user));
    assert.equal(await resume.getResumeByUserId('bob'), null);
    const analytics = load('lib/actions/analytics.action.ts', authMock(user));
    await assert.rejects(analytics.getAnalyticsSummary('bob'), /Unauthorized/);
  }
});

test('record reads and updates reject a different owner', async () => {
  let writes = 0;
  const mocks = authMock({ id: 'alice' });
  mocks['@/firebase/admin'] = { db: { collection: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => ({ userId: 'bob' }) }), set: async () => { writes++; }, delete: async () => { writes++; } }) }) } };
  const general = load('lib/actions/general.action.ts', mocks);
  assert.equal(await general.getInterviewById('private'), null);
  assert.equal((await general.createFeedback({ interviewId: 'private', userId: 'alice', transcript: [{ role: 'user', content: 'Answer' }] })).success, false);
  const resume = load('lib/actions/resume.action.ts', mocks);
  assert.equal(await resume.getResumeById('private'), null);
  assert.equal((await resume.deleteResume('private', 'alice')).success, false);
  assert.equal(writes, 0);
});

test('failed AI analysis preserves transcript without fabricated scores', async () => {
  let saved;
 let interviewUpdate;
  const mocks = authMock({ id: 'alice' });
 const interview = { userId: 'alice', role: 'Engineer', type: 'technical', level: 'placement', finalized: false };
 mocks['@/firebase/admin'] = { db: {
  collection: collection => ({ doc: id => ({ id: id || 'result', get: async () => ({ id: 'interview', exists: true, data: () => interview }) }) }),
  batch: () => ({ set: (ref, data) => { saved = data; }, update: (ref, data) => { interviewUpdate = data; }, commit: async () => {} }),
 } };
  const general = load('lib/actions/general.action.ts', mocks);
  const transcript = [{ role: 'user', content: 'A practical explanation.' }];
  const result = await general.createFeedback({ interviewId: 'interview', userId: 'alice', transcript });
  assert.equal(result.success, true);
  assert.equal(saved.analysisStatus, 'failed');
  assert.equal(saved.totalScore, undefined);
  assert.deepEqual(saved.transcript, transcript);
 assert.equal(interviewUpdate.finalized, true);
});

test('feedback completion rejects transcripts without a candidate answer and leaves interview in progress', async () => {
 let commits = 0;
 const mocks = authMock({ id: 'alice' });
 mocks['@/firebase/admin'] = { db: {
  collection: () => ({ doc: id => ({ id, get: async () => ({ exists: true, data: () => ({ userId: 'alice', role: 'Engineer', type: 'technical', level: 'placement', finalized: false }) }) }) }),
  batch: () => ({ set() {}, update() {}, commit: async () => { commits++; } }),
 } };
 const general = load('lib/actions/general.action.ts', mocks);
 const result = await general.createFeedback({ interviewId: 'interview', userId: 'alice', transcript: [{ role: 'assistant', content: 'Question?' }] });
 assert.equal(result.success, false);
 assert.equal(commits, 0);
});

test('interview setup creates an in-progress record for the authenticated owner', async () => {
 let savedInterview;
 const mocks = authMock({ id: 'alice' });
 mocks['next/server'] = { NextResponse: { json: (body, init) => Response.json(body, init) } };
 mocks['@/firebase/admin'] = { db: { collection: name => ({ add: async data => { if (name === 'interviews') savedInterview = data; return { id: 'created-interview' }; } }) } };
 mocks['@/lib/rateLimit'] = { rateLimit: () => ({ success: true }) };
 mocks['@/lib/security'] = { enforceSameOrigin: () => null };
 mocks['@/lib/actions/resume.action'] = { getResumeById: async () => null };
 const { POST } = load('app/api/vapi/generate/route.ts', mocks);
 const response = await POST(new Request('http://localhost:3000/api/vapi/generate', {
  method: 'POST',
  headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
  body: JSON.stringify({ role: 'Engineer', level: 'placement', techstack: ['Circuits'], type: 'technical', amount: 3, userId: 'forged-user', questions: ['One?', 'Two?', 'Three?'] }),
 }));
 assert.equal(response.status, 200);
 assert.equal((await response.json()).interviewId, 'created-interview');
 assert.equal(savedInterview.userId, 'alice');
 assert.equal(savedInterview.finalized, false);
});

test('interview and feedback schemas reject malformed provider output', () => {
  const { generatedQuestionsSchema, createInterviewSchema } = load('lib/schemas/interview.ts');
  assert.equal(generatedQuestionsSchema.safeParse({ questions: [] }).success, false);
  assert.equal(generatedQuestionsSchema.safeParse({ questions: [' ', 'a', 'b'] }).success, false);
  assert.equal(generatedQuestionsSchema.safeParse({ questions: ['a', 'b', 'c'] }).success, true);
  assert.equal(createInterviewSchema.safeParse({ role: 'Engineer', level: 'junior', techstack: ['C'], type: 'technical', amount: 3.5, userId: 'alice' }).success, false);
  const { feedbackSchema } = load('lib/schemas/feedback.ts');
  assert.equal(feedbackSchema.safeParse({ totalScore: 101 }).success, false);
});

test('PDF signature, safe filenames, and invalid request origins', () => {
  const security = load('lib/security.ts');
  assert.equal(security.hasPdfMagicNumber(Buffer.from('%PDF-1.7')), true);
  assert.equal(security.hasPdfMagicNumber(Buffer.from('<script>')), false);
  assert.equal(security.sanitiseFileName('../../resume.pdf').includes('/'), false);
  assert.equal(security.enforceSameOrigin(new Request('http://localhost:3000/api/test', { headers: { origin: 'https://evil.example' } })).status, 403);
  assert.equal(security.enforceSameOrigin(new Request('http://localhost:3000/api/test', { headers: { referer: 'not-a-url' } })).status, 403);
  assert.equal(security.enforceSameOrigin(new Request('http://localhost:3000/api/test', { headers: { origin: 'http://localhost:3000' } })), null);
});

test('every privileged POST rejects missing sessions before parsing or provider calls', async () => {
  for (const route of ['coding/execute', 'coding/review', 'resume/parse', 'vapi/generate']) {
    const { POST } = load(`app/api/${route}/route.ts`, authMock(null));
    const response = await POST(new Request('http://localhost:3000/api/' + route, { method: 'POST' }));
    assert.equal(response.status, 401, route);
  }
});

test('code execution fails closed when the private executor is not configured', async () => {
 const previousEnabled = process.env.CODE_EXECUTION_ENABLED;
 process.env.CODE_EXECUTION_ENABLED = 'true';
 let submissions = 0;
 try {
  const mocks = authMock({ id: 'alice' });
  mocks['@/lib/judge0'] = {
   isJudge0Configured: () => false,
   submitToJudge0: async () => { submissions++; throw new Error('must not submit'); },
   JUDGE0_LANGUAGE_IDS: { javascript: 102 },
   JUDGE0_STATUS: {},
  };
  const { POST } = load('app/api/coding/execute/route.ts', mocks);
  const response = await POST(new Request('http://localhost:3000/api/coding/execute', {
   method: 'POST',
   headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
   body: JSON.stringify({ language: 'javascript', code: 'console.log(1)' }),
  }));
  assert.equal(response.status, 503);
  assert.equal(submissions, 0);
 } finally {
  if (previousEnabled === undefined) delete process.env.CODE_EXECUTION_ENABLED;
  else process.env.CODE_EXECUTION_ENABLED = previousEnabled;
 }
});

test('Judge0 configuration requires an authenticated private HTTPS endpoint', async () => {
 const previousUrl = process.env.JUDGE0_API_BASE_URL;
 const previousKey = process.env.JUDGE0_API_KEY;
 const restore = (name, value) => value === undefined ? delete process.env[name] : process.env[name] = value;
 const judge0 = load('lib/judge0.ts', { '@/lib/logger': { logger: { warn() {}, error() {} } } });
 try {
  delete process.env.JUDGE0_API_BASE_URL;
  delete process.env.JUDGE0_API_KEY;
  assert.equal(judge0.isJudge0Configured(), false);
  process.env.JUDGE0_API_BASE_URL = 'https://ce.judge0.com';
  process.env.JUDGE0_API_KEY = 'test-only';
  assert.equal(judge0.isJudge0Configured(), false);
  process.env.JUDGE0_API_BASE_URL = 'http://judge0.internal';
  assert.equal(judge0.isJudge0Configured(), false);
  process.env.JUDGE0_API_BASE_URL = 'https://judge0.staging.internal';
  assert.equal(judge0.isJudge0Configured(), true);
 } finally {
  restore('JUDGE0_API_BASE_URL', previousUrl);
  restore('JUDGE0_API_KEY', previousKey);
 }
});

test('public health is read-only and deep production checks require the internal secret', async () => {
 let externalCalls = 0;
 let judge0Pings = 0;
 const mocks = {
  '@/firebase/admin': {
   auth: { listUsers: async () => { externalCalls++; } },
   db: { collection: () => { externalCalls++; return { limit: () => ({ get: async () => ({}) }) }; } },
   storage: { bucket: () => ({ file: () => ({ save: async () => { externalCalls++; }, delete: async () => { externalCalls++; } }) }) },
  },
  '@/ai/providers': { getConfiguredAIModels: () => [] },
  '@/lib/judge0': {
   isJudge0Configured: () => true,
   pingJudge0: async () => { judge0Pings++; return false; },
  },
 };
 const { GET } = load('app/api/health/route.ts', mocks);
 const health = await GET(new Request('https://prepwise.example/api/health'));
 assert.equal(health.status, 200);
 assert.deepEqual(await health.json(), { ok: true, service: 'prepwise', checks: { app: { ok: true } } });
 assert.equal(externalCalls, 0);

 const previousNodeEnv = process.env.NODE_ENV;
 const previousSecret = process.env.INTERNAL_API_SECRET;
 const previousExecutionEnabled = process.env.CODE_EXECUTION_ENABLED;
 process.env.NODE_ENV = 'production';
 process.env.INTERNAL_API_SECRET = 'health-test-secret';
 process.env.CODE_EXECUTION_ENABLED = 'false';
 try {
  const forbidden = await GET(new Request('https://prepwise.example/api/health?deep=1'));
  assert.equal(forbidden.status, 403);
  assert.equal(externalCalls, 0);
  const internal = await GET(new Request('https://prepwise.example/api/health?deep=1', {
   headers: { 'x-prepwise-internal-secret': 'health-test-secret' },
  }));
  assert.equal((await internal.json()).checks.codeExecution.detail, 'disabled by configuration');
  assert.equal(judge0Pings, 0);
 } finally {
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousSecret === undefined) delete process.env.INTERNAL_API_SECRET;
  else process.env.INTERNAL_API_SECRET = previousSecret;
  if (previousExecutionEnabled === undefined) delete process.env.CODE_EXECUTION_ENABLED;
  else process.env.CODE_EXECUTION_ENABLED = previousExecutionEnabled;
 }
});

test('resume interviews reject a resume that does not belong to the signed-in user', async () => {
 const mocks = authMock({ id: 'alice' });
 mocks['@/lib/actions/resume.action'] = { getResumeById: async () => null };
 const { POST } = load('app/api/vapi/generate/route.ts', mocks);
 const response = await POST(new Request('http://localhost:3000/api/vapi/generate', {
  method: 'POST',
  headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
  body: JSON.stringify({ role:'Resume interview', level:'placement', techstack:['C'], type:'mixed', amount:3, mode:'resume', resumeId:'belongs-to-bob', questions:['Question one?', 'Question two?', 'Question three?'] }),
 }));
 assert.equal(response.status, 404);
});

test('analytics distinguishes an empty history from a datastore failure', async () => {
 const mocks = authMock({ id: 'alice' });
 const query = { where() { return this; }, async get() { return { docs: [] }; } };
 mocks['@/firebase/admin'] = { db: { collection: () => query } };
 const analytics = load('lib/actions/analytics.action.ts', mocks);
 assert.equal((await analytics.getAnalyticsSummary('alice')).totalInterviews, 0);
 query.get = async () => { throw new Error('offline'); };
 await assert.rejects(analytics.getAnalyticsSummary('alice'), /Unable to load/);
});

test('PDF export creates a real multi-page PDF', () => {
 const { jsPDF } = require('jspdf');
 let output;
 let pages;
 function CapturedPDF(options) {
  const doc = new jsPDF(options);
  doc.save = () => { output = Buffer.from(doc.output('arraybuffer')); pages = doc.getNumberOfPages(); };
  return doc;
 }
 const { generatePDFReport } = load('lib/pdfGenerator.ts', { jspdf: CapturedPDF });
 generatePDFReport({ userName:'QA sample',date:'2026-10-14',subject:'Electronics',questions:Array.from({length:30},(_,i)=>`Practice question ${i+1}`),totalScore:70,categoryScores:[{name:'Technical Knowledge',score:70,comment:'Sample evidence for export testing.'}],strengths:['Sample strength'],areasForImprovement:['Sample improvement'],finalAssessment:'Test fixture; not a real assessment.' });
 assert.equal(output.subarray(0,5).toString(), '%PDF-');
 assert.ok(pages >= 2);
});

test('signup rejects a token belonging to a different account', async () => {
 const actions = load('lib/actions/auth.action.ts', {
  '@/firebase/admin': { db: neverDb, auth: { verifyIdToken: async () => ({ uid:'alice',email:'alice@example.com' }) } },
  'next/headers': {cookies:async()=>({})},
 });
 assert.equal((await actions.signUp({uid:'bob',email:'bob@example.com',name:'Bob',idToken:'test-token'})).success,false);
});
