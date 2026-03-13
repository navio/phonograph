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

const parseCargoPackageName = (cargoToml) => {
  const match = cargoToml.match(/^name\s*=\s*"([^"]+)"$/m);
  if (!match) {
    throw new Error("Unable to determine Cargo package name from src-tauri/Cargo.toml");
  }

  return match[1];
};

const syncCargoLockVersion = ({ cargoLockPath, cargoPackageName, version }) => {
  if (!fs.existsSync(cargoLockPath)) {
    return;
  }

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedPackageName = escapeRegex(cargoPackageName);
  const cargoLock = fs.readFileSync(cargoLockPath, "utf8");
  const packageVersionPattern = new RegExp(
    `(\\[\\[package\\]\\][\\r\\n]+name = "${escapedPackageName}"[\\r\\n]+version = ")[^"]+(")`,
    "m"
  );

  const updatedCargoLock = cargoLock.replace(packageVersionPattern, `$1${version}$2`);

  if (updatedCargoLock !== cargoLock) {
    fs.writeFileSync(cargoLockPath, updatedCargoLock);
  }
};

const syncDesktopVersion = (version) => {
  const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");
  const cargoTomlPath = path.join(repoRoot, "src-tauri", "Cargo.toml");
  const cargoLockPath = path.join(repoRoot, "src-tauri", "Cargo.lock");

  if (!fs.existsSync(tauriConfigPath) || !fs.existsSync(cargoTomlPath)) {
    return;
  }

  const tauriConfig = readJson(tauriConfigPath);
  if (tauriConfig.version !== version) {
    tauriConfig.version = version;
    writeJson(tauriConfigPath, tauriConfig);
  }

  const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
  const cargoPackageName = parseCargoPackageName(cargoToml);
  const updatedCargoToml = cargoToml.replace(/^(version\s*=\s*").*(")$/m, `$1${version}$2`);

  if (updatedCargoToml !== cargoToml) {
    fs.writeFileSync(cargoTomlPath, updatedCargoToml);
  }

  syncCargoLockVersion({ cargoLockPath, cargoPackageName, version });
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

syncDesktopVersion(next);

process.stdout.write(next);
