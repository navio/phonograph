const result = Bun.spawnSync([
  "bunx",
  "vite",
  "build",
  "--mode",
  "desktop",
]);

if (result.exitCode !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.exitCode || 1);
}
