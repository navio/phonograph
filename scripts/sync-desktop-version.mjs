#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const tauriConfigPath = path.join(root, "src-tauri", "tauri.conf.json");
const cargoTomlPath = path.join(root, "src-tauri", "Cargo.toml");

if (!fs.existsSync(tauriConfigPath) || !fs.existsSync(cargoTomlPath)) {
  process.stdout.write("Desktop workspace not found, skipping version sync.\n");
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

if (!version || typeof version !== "string") {
  throw new Error("package.json version is missing or invalid");
}

const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
if (tauriConfig.version !== version) {
  tauriConfig.version = version;
  fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);
}

const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
const updatedCargoToml = cargoToml.replace(/^(version\s*=\s*").*(")$/m, `$1${version}$2`);

if (updatedCargoToml !== cargoToml) {
  fs.writeFileSync(cargoTomlPath, updatedCargoToml);
}

process.stdout.write(`Desktop version synchronized to ${version}\n`);
