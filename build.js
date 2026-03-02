const esbuild = require("esbuild");
const path = require("path");

const entry = path.join(__dirname, "src", "config", "explorerMapping.js");
const outfile = path.join(__dirname, "src", "config", "explorerMapping.bundle.js");

esbuild
  .build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    platform: "browser",
    outfile,
    logLevel: "info",
  })
  .catch(() => process.exit(1));
