#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const bumpType = (process.argv[2] || "patch").toLowerCase();
if (!new Set(["patch", "minor", "major"]).has(bumpType)) {
  console.error(`Unsupported bump type: ${bumpType} (use patch|minor|major)`);
  process.exit(1);
}

const repoRoot = process.cwd();

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");

const bump = (version, type) => {
  const [maj, min, pat, ...rest] = String(version).split(".");
  const major = Number(maj);
  const minor = Number(min);
  const patch = Number(pat);
  if (![major, minor, patch].every((n) => Number.isFinite(n))) {
    throw new Error(`Invalid semver: ${version}`);
  }

  if (rest.length > 0) {
    throw new Error(`Pre-release/build metadata not supported: ${version}`);
  }

  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

const pkgPath = path.join(repoRoot, "package.json");
const pkg = readJson(pkgPath);
const current = pkg.version;
const next = bump(current, bumpType);

pkg.version = next;
writeJson(pkgPath, pkg);

const lockPath = path.join(repoRoot, "package-lock.json");
if (fs.existsSync(lockPath)) {
  try {
    const lock = readJson(lockPath);
    lock.version = next;
    if (lock.packages?.[""]) {
      lock.packages[""].version = next;
    }
    writeJson(lockPath, lock);
  } catch (e) {
    // Ignore lockfile updates if it's malformed/out of date.
  }
}

process.stdout.write(next);

const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");
if (fs.existsSync(tauriConfigPath)) {
  try {
    const tauriConfig = readJson(tauriConfigPath);
    tauriConfig.version = next;
    fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + "\n");
  } catch (e) {
    // Ignore tauri config updates if the file is malformed.
  }
}

const tauriCargoTomlPath = path.join(repoRoot, "src-tauri", "Cargo.toml");
if (fs.existsSync(tauriCargoTomlPath)) {
  try {
    const cargoToml = fs.readFileSync(tauriCargoTomlPath, "utf8");
    const updatedCargoToml = cargoToml.replace(/(\[package\][\s\S]*?\nversion\s*=\s*")([^"]+)(")/, `$1${next}$3`);

    if (updatedCargoToml !== cargoToml) {
      fs.writeFileSync(tauriCargoTomlPath, updatedCargoToml);
    }
  } catch (e) {
    // Ignore Cargo.toml updates if the file is malformed.
  }
}
