#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(tauriConfigPath)) {
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

if (!packageJson.version || typeof packageJson.version !== "string") {
  throw new Error("package.json version is missing or invalid");
}

tauriConfig.version = packageJson.version;
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + "\n");

process.stdout.write(packageJson.version);
