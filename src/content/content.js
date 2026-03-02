const STORAGE_KEY = "disabledSites";

function processLink(link) {
  const href = link.getAttribute("href");
  if (!href || typeof href !== "string") return;
  const trimmed = href.trim();
  if (!trimmed) return;
  const rewritten = typeof rewriteExplorerUrl !== "undefined" ? rewriteExplorerUrl(trimmed) : null;
  if (rewritten && rewritten !== link.href) {
    link.href = rewritten;
  }
}

function scanAndReplace(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('a[href^="http"]').forEach(processLink);
}

function runWhenReady() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    const disabled = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
    const hostname = document.location.hostname;
    if (disabled.includes(hostname)) return;

    scanAndReplace(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "A" && node.href) processLink(node);
              scanAndReplace(node);
            }
          });
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runWhenReady);
} else {
  runWhenReady();
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) return;
  const disabled = Array.isArray(changes[STORAGE_KEY].newValue) ? changes[STORAGE_KEY].newValue : [];
  const hostname = document.location.hostname;
  if (disabled.includes(hostname)) return;
  scanAndReplace(document.body);
});
