#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");
const cargoTomlPath = path.join(repoRoot, "src-tauri", "Cargo.toml");
const cargoLockPath = path.join(repoRoot, "src-tauri", "Cargo.lock");

const parseCargoPackageName = (cargoToml) => {
  const match = cargoToml.match(/^name\s*=\s*"([^"]+)"$/m);
  if (!match) {
    throw new Error("Unable to determine Cargo package name from src-tauri/Cargo.toml");
  }

  return match[1];
};

const syncCargoLockVersion = ({ cargoPackageName, version }) => {
  if (!fs.existsSync(cargoLockPath)) {
    return;
  }

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedPackageName = escapeRegex(cargoPackageName);
  const cargoLock = fs.readFileSync(cargoLockPath, "utf8");
  const packageVersionPattern = new RegExp(
    `(\\[\\[package\\]\\][\\r\\n]+name = \"${escapedPackageName}\"[\\r\\n]+version = \")[^\"]+(\")`,
    "m"
  );

  const updatedCargoLock = cargoLock.replace(packageVersionPattern, `$1${version}$2`);

  if (updatedCargoLock !== cargoLock) {
    fs.writeFileSync(cargoLockPath, updatedCargoLock);
  }
};

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(tauriConfigPath) || !fs.existsSync(cargoTomlPath)) {
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");

if (!packageJson.version || typeof packageJson.version !== "string") {
  throw new Error("package.json version is missing or invalid");
}

const version = packageJson.version;

tauriConfig.version = version;
fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);

const cargoPackageName = parseCargoPackageName(cargoToml);
const updatedCargoToml = cargoToml.replace(/^(version\s*=\s*").*(")$/m, `$1${version}$2`);

if (updatedCargoToml !== cargoToml) {
  fs.writeFileSync(cargoTomlPath, updatedCargoToml);
}

syncCargoLockVersion({ cargoPackageName, version });

process.stdout.write(`Desktop version synchronized to ${version}\n`);
