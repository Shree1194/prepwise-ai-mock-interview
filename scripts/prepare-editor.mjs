import fs from "node:fs";

// Serve the installed version from our own origin; no third-party script CSP exceptions.
fs.mkdirSync("public/monaco", { recursive: true });
fs.cpSync("node_modules/monaco-editor/min/vs", "public/monaco/vs", { recursive: true });
console.log("Local Monaco assets prepared.");
