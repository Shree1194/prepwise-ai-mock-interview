import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  console.log("Testing Gemini interaction...");
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", { structuredOutputs: false }) as any,
      schema: z.object({ success: z.boolean() }),
      prompt: "Reply with success true",
    });
    console.log("Success!", object);
  } catch (err: any) {
    console.error("Gemini failed:", err.message);
  }
}

test();
