import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return true;
}

const explicitEnvFile = process.env.PREPWISE_ENV_FILE;
const envFile =
  explicitEnvFile ||
  (fs.existsSync(".env.production") ? ".env.production" : ".env.local");

loadEnvFile(envFile);

const buildDir = process.env.PREPWISE_BUILD_DIR || ".next";
const standalone = path.resolve(buildDir, "standalone");
// Next standalone output does not copy static assets automatically.
fs.cpSync("public", path.join(standalone, "public"), { recursive: true });
fs.cpSync(path.join(buildDir, "static"), path.join(standalone, buildDir, "static"), { recursive: true });
await import(pathToFileURL(path.join(standalone, "server.js")).href);
