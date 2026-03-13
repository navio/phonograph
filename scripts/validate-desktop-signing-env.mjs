#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hasDesktopConfig = fs.existsSync(path.join(root, "src-tauri", "tauri.conf.json"));

if (!hasDesktopConfig) {
  process.stdout.write("Desktop workspace not found, skipping signing validation.\n");
  process.exit(0);
}

const isCi = process.env.CI === "true";
const isReleaseRef = process.env.GITHUB_REF_TYPE === "tag";
const shouldEnforce = process.argv.includes("--force") || (isCi && isReleaseRef);

if (!shouldEnforce) {
  process.stdout.write("Skipping desktop signing environment validation.\n");
  process.exit(0);
}

const missing = [];

const requireEnv = (name) => {
  if (!process.env[name]) {
    missing.push(name);
  }
};

const platform = process.platform;
if (platform === "darwin") {
  requireEnv("APPLE_CERTIFICATE");
  requireEnv("APPLE_CERTIFICATE_PASSWORD");
  requireEnv("APPLE_SIGNING_IDENTITY");
  requireEnv("APPLE_API_ISSUER");
  requireEnv("APPLE_API_KEY");
  requireEnv("APPLE_API_KEY_PATH");
}

if (platform === "win32") {
  requireEnv("TAURI_WINDOWS_CERTIFICATE");
  requireEnv("TAURI_WINDOWS_CERTIFICATE_PASSWORD");
}

if (missing.length > 0) {
  console.error("Missing required desktop signing environment variables:");
  for (const variableName of missing) {
    console.error(`- ${variableName}`);
  }
  process.exit(1);
}

process.stdout.write("Desktop signing environment validation passed.\n");
