/**
 * Explorer URL mapping: source (any host) -> target (any host).
 * Each source host has a target host and a list of route mappings (source pattern -> target pattern).
 * Uses path-to-regexp for matching and compiling paths.
 */

const { match, compile } = require("path-to-regexp");

// --- Parameter patterns (for validating dynamic segments) ---
const PARAM_PATTERNS = {
  number: /^\d+$/,
  addressHash: /^0x[a-fA-F0-9]{40}$/,
  txHash: /^0x[a-fA-F0-9]{64}$/,
};

/** Convert config pattern "{param}" to path-to-regexp ":param" */
function toPathToRegexpPattern(pattern) {
  return pattern.replace(/\{(\w+)\}/g, ":$1");
}

const DEFAULT_ROUTES = [
  { source: "/block/{number}", target: "/block/{number}" },
  { source: "/tx/{txHash}", target: "/tx/{txHash}" },
  { source: "/address/{addressHash}", target: "/address/{addressHash}" },
  { source: "/token/{addressHash}", target: "/token/{addressHash}" },
  { source: "/charts", target: "/stats" },
];

/**
 * Host mappings: for each source host, target host and route list.
 * Source host is matched case-insensitively (exact or suffix).
 * Routes are tried in order; first match wins.
 */
// Order matters: more specific hosts (subdomains) must appear before parent (e.g. chain.explorer.com before explorer.com).
const HOST_MAPPINGS = [
  {
    sourceHost: "sepolia.etherscan.io",
    targetHost: "sepolia.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "optimistic.etherscan.io",
    targetHost: "explorer.optimism.io",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "mega.etherscan.io",
    targetHost: "megaeth.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "etherscan.io",
    targetHost: "eth.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "polygonscan.com",
    targetHost: "polygon.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "nova.arbiscan.io",
    targetHost: "arbitrum-nova.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "arbiscan.io",
    targetHost: "arbitrum.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "celoscan.io",
    targetHost: "celo.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "gnosisscan.io",
    targetHost: "gnosis.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
  {
    sourceHost: "basescan.org",
    targetHost: "base.blockscout.com",
    routes: DEFAULT_ROUTES,
  },
];

// --- Helpers ---

function getMappingForHost(sourceHostname) {
  const lower = sourceHostname.toLowerCase();
  for (const mapping of HOST_MAPPINGS) {
    const sh = mapping.sourceHost.toLowerCase();
    if (lower === sh || lower.endsWith("." + sh)) return mapping;
  }
  return null;
}

/** True if hostname is a configured source explorer (do not rewrite links when the user is on this host). */
function isSourceHost(hostname) {
  return getMappingForHost(hostname) !== null;
}

const TARGET_HOST_LIST = [...new Set(HOST_MAPPINGS.map((m) => m.targetHost.toLowerCase()))];

/** True if hostname is a configured target explorer or any subdomain of one (do not rewrite links when the user is on this host). */
function isTargetHost(hostname) {
  if (hostname == null) return false;
  const lower = hostname.toLowerCase();
  if(lower.endsWith(".blockscout.com")){
    return true;
  }
  return TARGET_HOST_LIST.some((t) => lower === t);
}

function validateParams(params) {
  for (const [key, value] of Object.entries(params)) {
    const re = PARAM_PATTERNS[key];
    if (re && !re.test(value)) return false;
  }
  return true;
}

/** Rewrite path using the given route list; return target path or null */
function rewritePath(pathname, routes) {
  const normalizedPath = "/" + (pathname || "").replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");

  for (const { source, target } of routes) {
    const sourcePattern = toPathToRegexpPattern(source);
    const matcher = match(sourcePattern, { decode: false });
    const result = matcher(normalizedPath);
    if (!result) continue;
    const params = result.params || {};
    if (!validateParams(params)) continue;
    // Static route (no params): target is literal
    if (Object.keys(params).length === 0) {
      return target.startsWith("/") ? target : "/" + target;
    }
    const targetPattern = toPathToRegexpPattern(target);
    const toPath = compile(targetPattern, { encode: false });
    return toPath(params);
  }

  return null;
}

/**
 * If urlString is a supported source explorer URL, returns the target URL; otherwise null.
 * Only the path (no query or fragment) is matched and rewritten; search and hash are preserved.
 */
function rewriteExplorerUrl(urlString) {
  try {
    const url = new URL(urlString);
    const mapping = getMappingForHost(url.hostname);
    if (!mapping) return null;

    const pathname = url.pathname || "/";
    const newPath = rewritePath(pathname, mapping.routes);
    if (newPath == null) return null;

    const targetUrl = new URL(newPath + (url.search || "") + (url.hash || ""), "https://" + mapping.targetHost);
    return targetUrl.href;
  } catch {
    return null;
  }
}

// Expose for content script (bundled script runs in IIFE)
if (typeof globalThis !== "undefined") {
  globalThis.rewriteExplorerUrl = rewriteExplorerUrl;
  globalThis.isSourceHost = isSourceHost;
  globalThis.isTargetHost = isTargetHost;
}
// Expose for Node (unit tests)
if (typeof module !== "undefined" && module.exports)
  module.exports = { rewriteExplorerUrl, isSourceHost, isTargetHost };
