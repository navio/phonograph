#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");
const cargoTomlPath = path.join(repoRoot, "src-tauri", "Cargo.toml");

if (
  !fs.existsSync(packageJsonPath) ||
  (!fs.existsSync(tauriConfigPath) && !fs.existsSync(cargoTomlPath))
) {
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
if (!packageJson.version || typeof packageJson.version !== "string") {
  throw new Error("package.json version is missing or invalid");
}

if (fs.existsSync(tauriConfigPath)) {
  const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
  tauriConfig.version = packageJson.version;
  fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + "\n");
}

if (fs.existsSync(cargoTomlPath)) {
  const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
  const packageBlockPattern = /(\[package\][\s\S]*?^version\s*=\s*").*("\s*$)/m;

  if (packageBlockPattern.test(cargoToml)) {
    const updatedCargoToml = cargoToml.replace(
      packageBlockPattern,
      `$1${packageJson.version}$2`,
    );
    fs.writeFileSync(cargoTomlPath, updatedCargoToml);
  }
}

process.stdout.write(packageJson.version);
