import { auth, db } from "../firebase/admin";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFirebase() {
  console.log("Testing Firebase Admin Database connection...");
  try {
    const user = await auth.getUserByEmail("aadeshkapadnis@gmail.com");
    console.log("Successfully found user:", user?.uid);
  } catch (err: any) {
    if (err.message === "Mocked Auth") {
      console.error("Firebase is using the MOCK. Initialization must have failed.");
    } else {
      console.error("Firebase auth error:", err.message);
    }
  }

  try {
    const testSnapshot = await db.collection("users").limit(1).get();
    console.log("Successfully connected to Firestore! Docs found:", testSnapshot.docs.length);
  } catch (err: any) {
    console.error("Firestore error:", err.message);
  }
}

testFirebase();
