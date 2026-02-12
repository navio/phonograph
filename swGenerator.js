const path = require('path');
const fs = require('fs');

const DIST_DIR = path.join(__dirname, 'dist');
const SW_FILE = path.join(DIST_DIR, 'service-worker.js');

const walkFiles = async (dir) => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full)));
      continue;
    }
    if (entry.isFile()) {
      files.push(full);
    }
  }

  return files;
};

const toUrlPath = (filePath) => {
  const rel = path.relative(DIST_DIR, filePath).split(path.sep).join('/');
  return `/${rel}`;
};

const buildPrecacheList = async () => {
  const diskFiles = await walkFiles(DIST_DIR);
  const urls = diskFiles
    .map(toUrlPath)
    .filter((u) => u !== '/service-worker.js')
    .sort();

  // App shell routes are handled by the service worker via /index.html,
  // but keeping '/' explicitly helps first-load correctness.
  const base = ['/', '/index.html'];
  const set = new Set([...base, ...urls]);
  return Array.from(set);
};

buildPrecacheList()
  .then((precacheUrls) => {
    return fs.promises.readFile(SW_FILE, 'utf8').then((data) => {
      const next = data.replace(
        /addAll\(\[[\s\S]*?\]\)/,
        `addAll(${JSON.stringify(precacheUrls)})`
      );
      return fs.promises.writeFile(SW_FILE, next);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
