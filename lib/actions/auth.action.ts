"use server";

import { auth, db } from "@/firebase/admin";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function setSessionCookie(idToken: string) {
  const claims = await auth.verifyIdToken(idToken, true);
  if (Date.now() / 1000 - claims.auth_time > 300) throw new Error("Please sign in again");
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  if (!sessionCookie) {
    throw new Error(
      "createSessionCookie returned an empty string. " +
        "Firebase Admin SDK is not initialised; check required env vars."
    );
  }

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email, idToken } = params;

  try {
    const claims = await auth.verifyIdToken(idToken, true);
    if (claims.uid !== uid || claims.email !== email || !name.trim() || name.length > 100) return { success: false, message: "Invalid account details" };
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    logger.error("User profile creation failed", error);

    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const claims = await auth.verifyIdToken(idToken, true);
    if (claims.email !== email) return { success: false, message: "Invalid account details" };
    const userRecord = await auth.getUser(claims.uid);

    if (!userRecord) {
      logger.error("Firebase Admin returned no user during sign-in");
      return {
        success: false,
        message: "Authentication service unavailable. Check Firebase Admin env vars.",
      };
    }

    const userProfile = await db.collection("users").doc(userRecord.uid).get();
    if (!userProfile.exists) {
      logger.warn("User profile missing during sign-in; creating profile");
      await db.collection("users").doc(userRecord.uid).set({
        name: userRecord.displayName || "User",
        email: userRecord.email,
        createdAt: new Date().toISOString(),
      });
    }

    await setSessionCookie(idToken);

    return { success: true };
  } catch (error: any) {
    logger.error("Sign-in failed", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error: any) {
    logger.warn("Session verification failed", {
      errorMessage: error?.message ?? String(error),
    });
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
