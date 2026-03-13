#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const packageJsonPath = path.join(repoRoot, "package.json");
const packageJson = fs.existsSync(packageJsonPath) ? readJson(packageJsonPath) : {};
const scripts = packageJson.scripts || {};

const detectDesktopBuild = () => {
  const scriptCandidates = ["desktop:build:ci", "desktop:build", "tauri:build", "electron:build"];

  for (const scriptName of scriptCandidates) {
    if (typeof scripts[scriptName] === "string" && scripts[scriptName].trim().length > 0) {
      return {
        enabled: true,
        command: `yarn ${scriptName}`,
        reason: `Detected package script \"${scriptName}\"`,
      };
    }
  }

  const desktopPackagePath = path.join(repoRoot, "desktop", "package.json");
  if (fs.existsSync(desktopPackagePath)) {
    try {
      const desktopPackage = readJson(desktopPackagePath);
      if (typeof desktopPackage.scripts?.build === "string" && desktopPackage.scripts.build.trim().length > 0) {
        return {
          enabled: true,
          command: "yarn --cwd desktop build",
          reason: "Detected desktop/package.json with build script",
        };
      }

      return {
        enabled: false,
        command: "",
        reason: "desktop/package.json exists but no build script found",
      };
    } catch {
      return {
        enabled: false,
        command: "",
        reason: "desktop/package.json is unreadable or invalid JSON",
      };
    }
  }

  return {
    enabled: false,
    command: "",
    reason: "No desktop build scripts or desktop project detected",
  };
};

const detection = detectDesktopBuild();

const writeGithubOutput = (values) => {
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (!githubOutput) {
    return;
  }

  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value)}`);
  fs.appendFileSync(githubOutput, `${lines.join("\n")}\n`, "utf8");
};

if (args.has("--github-output")) {
  writeGithubOutput({
    desktop_enabled: detection.enabled,
    desktop_command: detection.command,
    desktop_reason: detection.reason,
  });
}

if (args.has("--detect")) {
  process.stdout.write(`${JSON.stringify(detection)}\n`);
}

if (args.has("--run")) {
  if (!detection.enabled) {
    console.log(`Desktop build skipped: ${detection.reason}`);
    process.exit(0);
  }

  console.log(`Running desktop build: ${detection.command}`);
  const result = spawnSync(detection.command, {
    cwd: repoRoot,
    env: process.env,
    shell: true,
    stdio: "inherit",
  });

  if (typeof result.status === "number") {
    process.exit(result.status);
  }

  process.exit(1);
}
