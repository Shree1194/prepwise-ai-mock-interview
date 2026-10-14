import fs from "node:fs";
import { randomBytes } from "node:crypto";
import process from "node:process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function loadEnvFile(path = ".env.production") {
  if (!fs.existsSync(path)) return;

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function initFirebase() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: requireEnv("FIREBASE_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  return {
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
  };
}

async function runCheck(name, fn) {
  try {
    const detail = await fn();
    console.log(JSON.stringify({ ok: true, name, detail }));
    return true;
  } catch (error) {
    console.error(
      JSON.stringify({
        ok: false,
        name,
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return false;
  }
}

loadEnvFile(process.argv[2] || ".env.production");

if (process.env.VERIFY_ENVIRONMENT !== "staging") {
  throw new Error(
    "Set VERIFY_ENVIRONMENT=staging only for a staging Firebase project; production cloud verification is disabled by this script."
  );
}

if (process.env.VERIFY_ALLOW_CLOUD_MUTATIONS !== "true") {
  throw new Error(
    "Cloud verification writes temporary Firebase data. Set VERIFY_ALLOW_CLOUD_MUTATIONS=true only for an explicitly authorized staging project."
  );
}

if (!process.env.VERIFY_FIREBASE_PROJECT_ID) {
  throw new Error(
    "Set VERIFY_FIREBASE_PROJECT_ID to the exact Firebase project authorized for disposable verification."
  );
}

if (process.env.FIREBASE_PROJECT_ID !== process.env.VERIFY_FIREBASE_PROJECT_ID) {
  throw new Error(
    "FIREBASE_PROJECT_ID does not match VERIFY_FIREBASE_PROJECT_ID; refusing cloud writes."
  );
}

const id = `verify-${Date.now()}`;
const results = [];

const firebaseInitialised = await runCheck("firebase-admin-init", async () =>
  initFirebase()
);

function requireFirebaseInitialised() {
  if (!firebaseInitialised) {
    throw new Error("Firebase Admin initialisation failed.");
  }
}

results.push(firebaseInitialised);

results.push(
  await runCheck("firebase-auth-create-delete-user", async () => {
    requireFirebaseInitialised();
    const email = `${id}@example.com`;
    const password = randomBytes(24).toString("base64url");
    let uid;
    let uidPrefix;
    try {
      const user = await getAuth().createUser({
        email,
        password,
        displayName: "PrepWise disposable verification",
      });
      uid = user.uid;
      uidPrefix = user.uid.slice(0, 6);
    } finally {
      if (uid) await getAuth().deleteUser(uid);
    }
    return { uidPrefix };
  })
);

results.push(
  await runCheck("firestore-read-write-delete", async () => {
    requireFirebaseInitialised();
    const ref = getFirestore().collection("_health").doc(id);
    let found = false;
    try {
      await ref.set({ ok: true, createdAt: new Date().toISOString() });
      const snap = await ref.get();
      found = snap.exists;
    } finally {
      await ref.delete();
    }

    if (!found) {
      throw new Error("Health document was not readable after write.");
    }

    return { doc: ref.path };
  })
);

results.push(
  await runCheck("storage-write-delete", async () => {
    requireFirebaseInitialised();
    const bucket = getStorage().bucket();
    const file = bucket.file(`_health/${id}.txt`);
    let exists = false;
    try {
      await file.save("ok", { contentType: "text/plain" });
      [exists] = await file.exists();
    } finally {
      await file.delete({ ignoreNotFound: true });
    }

    if (!exists) {
      throw new Error("Health object was not readable after write.");
    }

    return { bucket: bucket.name };
  })
);

if (process.env.JUDGE0_API_BASE_URL) {
  results.push(
    await runCheck("configured-judge0-runtime", async () => {
      const baseUrl = process.env.JUDGE0_API_BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/v2/runtimes`, {
        headers: process.env.JUDGE0_API_KEY
          ? { "X-Auth-Token": process.env.JUDGE0_API_KEY }
          : {},
      });

      if (!response.ok) {
        throw new Error(`Configured Judge0 responded ${response.status}`);
      }

      const runtimes = await response.json();
      return { runtimes: Array.isArray(runtimes) ? runtimes.length : "unknown" };
    })
  );
} else {
  console.log(
    JSON.stringify({
      ok: null,
      name: "private-judge0-runtime",
      detail: "skipped; no private JUDGE0_API_BASE_URL configured",
    })
  );
}

if (process.env.APP_URL) {
  results.push(
    await runCheck("app-health-endpoint", async () => {
      const response = await fetch(
        `${process.env.APP_URL.replace(/\/$/, "")}/api/health?deep=1`,
        {
          headers: {
            "x-prepwise-internal-secret": requireEnv("INTERNAL_API_SECRET"),
          },
        }
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(JSON.stringify(body));
      }

      return body;
    })
  );
}

const failed = results.filter((ok) => !ok).length;

if (failed > 0) {
  console.error(`Production verification failed: ${failed} check(s) failed.`);
  process.exit(1);
}

console.log("Production verification passed.");
