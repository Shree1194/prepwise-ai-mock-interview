import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "" || value.includes("leave blank")) {
    throw new Error(`Missing required Firebase Admin env var: ${name}`);
  }
  return value;
}

function normalisePrivateKey(value: string): string {
  let privateKey = value;
  try {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = JSON.parse(privateKey);
    }
  } catch {
    // Fall through to PEM validation below.
  }

  privateKey = privateKey.replace(/\\n/g, "\n");
  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
    !privateKey.includes("-----BEGIN RSA PRIVATE KEY-----")
  ) {
    throw new Error("FIREBASE_PRIVATE_KEY is not a valid PEM private key.");
  }

  return privateKey;
}

function initFirebaseAdmin() {
  const projectId = requiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = normalisePrivateKey(requiredEnv("FIREBASE_PRIVATE_KEY"));
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      ...(storageBucket && { storageBucket }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
    storage: getStorage(),
  };
}

export const { auth, db, storage } = initFirebaseAdmin();
