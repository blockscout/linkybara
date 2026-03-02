#!/usr/bin/env node
/**
 * Creates a zip of the extension for Chrome Web Store submission.
 * Runs build first, then zips only the files needed at runtime (no node_modules, tests, or dev files).
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Files and directories to include in the extension zip (paths relative to root)
const INCLUDED = [
  "manifest.json",
  "icons/16.png",
  "icons/48.png",
  "icons/128.png",
  "src/popup/popup.html",
  "src/popup/popup.js",
  "src/content/content.js",
  "src/config/explorerMapping.bundle.js",
];

function getVersion() {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

function ensureBundleExists() {
  const bundlePath = path.join(root, "src/config/explorerMapping.bundle.js");
  if (!fs.existsSync(bundlePath)) {
    console.error("Missing explorerMapping.bundle.js. Run npm run build first.");
    process.exit(1);
  }
}

function runBuild() {
  console.log("Running npm run build...");
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

function createZip(version) {
  const outDir = path.join(root, "dist");
  const zipName = `linkybara-${version}.zip`;
  const zipPath = path.join(outDir, zipName);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const files = INCLUDED.map((f) => path.join(root, f));
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error(`Missing required file: ${f}`);
      process.exit(1);
    }
  }

  // Use zip command (available on macOS and most Linux)
  const fileList = INCLUDED.join(" ");
  execSync(`cd "${root}" && zip -r "${zipPath}" ${fileList}`, {
    stdio: "inherit",
  });

  console.log(`\nCreated ${zipPath}`);
  return zipPath;
}

function main() {
  runBuild();
  ensureBundleExists();
  const version = getVersion();
  createZip(version);
}

main();
