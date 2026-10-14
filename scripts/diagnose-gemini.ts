/** Compatibility entry point for the current, safe Gemini smoke check. */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
await import("./test-live-ai.mjs");
