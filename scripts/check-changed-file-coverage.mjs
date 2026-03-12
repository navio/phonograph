#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const summaryPath = path.join(repoRoot, "coverage", "coverage-summary.json");
const threshold = Number(process.env.COVERAGE_THRESHOLD || "70");
const baseRef = process.env.COVERAGE_BASE_REF || "origin/master";

if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
  console.error(`Invalid COVERAGE_THRESHOLD: ${process.env.COVERAGE_THRESHOLD}`);
  process.exit(1);
}

if (!fs.existsSync(summaryPath)) {
  console.error(`Coverage summary not found at ${summaryPath}`);
  console.error("Run yarn test:coverage first.");
  process.exit(1);
}

const run = (command) =>
  execSync(command, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const getChangedFiles = () => {
  try {
    return run(`git diff --name-only --diff-filter=ACMR ${baseRef}...HEAD`);
  } catch (error) {
    const stderr = String(error?.stderr || "");
    if (/unknown revision|bad revision|ambiguous argument/i.test(stderr)) {
      console.error(`Unable to diff against base ref \"${baseRef}\".`);
      console.error("Ensure the ref exists locally (for example: git fetch origin <branch>).");
      process.exit(1);
    }

    if (!/no merge base/i.test(stderr)) {
      throw error;
    }

    console.warn(`No merge base found with ${baseRef}; falling back to direct diff.`);
    return run(`git diff --name-only --diff-filter=ACMR ${baseRef} HEAD`);
  }
};

const toRepoRelative = (filePath) => {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  const normalized = path.normalize(absolutePath);
  const relative = path.relative(repoRoot, normalized);
  if (relative.startsWith("..")) {
    return null;
  }

  return relative.split(path.sep).join("/");
};

const changedFiles = getChangedFiles()
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const changedSourceFiles = changedFiles
  .filter((filePath) => /^src\/.+\.(js|jsx|ts|tsx)$/.test(filePath))
  .filter((filePath) => !/(\.test|\.spec)\.(js|jsx|ts|tsx)$/.test(filePath));

if (changedSourceFiles.length === 0) {
  console.log("No changed source files to enforce coverage on.");
  process.exit(0);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const byRelativePath = new Map();

Object.entries(summary).forEach(([entryPath, metrics]) => {
  if (entryPath === "total") {
    return;
  }

  const relative = toRepoRelative(entryPath);
  if (relative) {
    byRelativePath.set(relative, metrics);
  }
});

const metricKeys = ["lines", "functions", "branches", "statements"];
const failures = [];

changedSourceFiles.forEach((filePath) => {
  const metrics = byRelativePath.get(filePath);
  if (!metrics) {
    failures.push({
      filePath,
      reason: "missing",
      details: "no coverage data found (file not executed by tests)",
    });
    return;
  }

  const belowThreshold = metricKeys.filter((key) => {
    const pct = Number(metrics?.[key]?.pct || 0);
    return pct < threshold;
  });

  if (belowThreshold.length > 0) {
    failures.push({
      filePath,
      reason: "below",
      details: belowThreshold
        .map((key) => `${key}=${Number(metrics[key].pct).toFixed(2)}%`)
        .join(", "),
    });
  }
});

if (failures.length > 0) {
  console.error(`Coverage gate failed. Minimum required per changed file: ${threshold}%.`);
  failures.forEach(({ filePath, details }) => {
    console.error(`- ${filePath}: ${details}`);
  });
  process.exit(1);
}

console.log(`Coverage gate passed for ${changedSourceFiles.length} changed source file(s).`);
