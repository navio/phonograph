#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));

const defaultDirectories = [
  "src-tauri/target/release/bundle",
  "dist-desktop",
  "desktop/dist",
  "release",
  "desktop/release",
  "out",
  "desktop/out",
];

const artifactNamePatterns = [
  /\.app$/i,
  /\.appx$/i,
  /\.appimage$/i,
  /\.deb$/i,
  /\.dmg$/i,
  /\.exe$/i,
  /\.msi$/i,
  /\.msix$/i,
  /\.pkg$/i,
  /\.rpm$/i,
  /\.snap$/i,
  /\.tar$/i,
  /\.tar\.gz$/i,
  /\.zip$/i,
  /\.7z$/i,
];

const extraDirectories = (process.env.DESKTOP_ARTIFACT_DIRS || "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const artifactDirectories = [...new Set([...defaultDirectories, ...extraDirectories])];

const isArtifact = (targetPath, stats) => {
  const baseName = path.basename(targetPath);
  if (stats.isDirectory()) {
    return artifactNamePatterns.some((pattern) => pattern.test(baseName));
  }

  if (stats.isFile()) {
    return artifactNamePatterns.some((pattern) => pattern.test(baseName));
  }

  return false;
};

const walkDirectory = (relativeDirectory, foundArtifacts) => {
  const absoluteDirectory = path.join(repoRoot, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) {
    return;
  }

  const stack = [absoluteDirectory];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const stats = fs.lstatSync(absolutePath);
      if (isArtifact(absolutePath, stats)) {
        foundArtifacts.add(path.relative(repoRoot, absolutePath).split(path.sep).join("/"));
        continue;
      }

      if (entry.isDirectory()) {
        stack.push(absolutePath);
      }
    }
  }
};

const foundArtifacts = new Set();
for (const relativeDirectory of artifactDirectories) {
  walkDirectory(relativeDirectory, foundArtifacts);
}

const sortedArtifacts = [...foundArtifacts].sort((first, second) => first.localeCompare(second));

if (sortedArtifacts.length === 0) {
  console.error("No desktop release artifacts found.");
  console.error(`Searched directories: ${artifactDirectories.join(", ")}`);
  process.exit(1);
}

if (args.has("--github-output")) {
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (!githubOutput) {
    console.error("GITHUB_OUTPUT is not set.");
    process.exit(1);
  }

  const outputLines = ["paths<<EOF", ...sortedArtifacts, "EOF", `count=${sortedArtifacts.length}`];
  fs.appendFileSync(githubOutput, `${outputLines.join("\n")}\n`, "utf8");
}

if (args.has("--json")) {
  process.stdout.write(`${JSON.stringify(sortedArtifacts)}\n`);
} else {
  process.stdout.write(`${sortedArtifacts.join("\n")}\n`);
}
