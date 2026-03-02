const STORAGE_KEY = "disabledSites";

async function getDisabledSites() {
  const r = await chrome.storage.sync.get([STORAGE_KEY]);
  return Array.isArray(r[STORAGE_KEY]) ? r[STORAGE_KEY] : [];
}

async function setDisabledSites(list) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: list });
}

async function getCurrentHostname() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return new URL(tab.url).hostname;
  } catch {
    return null;
  }
}

function renderDisabledList(hosts) {
  const el = document.getElementById("disabled-sites-list");
  if (!hosts.length) {
    el.innerHTML = '<p class="empty-msg">No sites disabled.</p>';
    return;
  }
  el.innerHTML = hosts
    .map(
      (host) =>
        `<div class="disabled-item">
          <span>${escapeHtml(host)}</span>
          <button data-host="${escapeAttr(host)}">Remove</button>
        </div>`
    )
    .join("");
  el.querySelectorAll("button[data-host]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const host = btn.getAttribute("data-host");
      const list = await getDisabledSites();
      await setDisabledSites(list.filter((h) => h !== host));
      refresh();
    });
  });
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function escapeAttr(s) {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function refresh() {
  const host = await getCurrentHostname();
  const disabled = await getDisabledSites();
  const isDisabled = host && disabled.includes(host);

  const toggle = document.getElementById("toggle-site");
  const status = document.getElementById("status");

  if (host) {
    toggle.textContent = isDisabled ? "Enable on this site" : "Disable on this site";
    toggle.classList.toggle("primary", !isDisabled);
    status.textContent = isDisabled ? "Disabled here" : "Active here";
  } else {
    toggle.disabled = true;
    status.textContent = "Cannot read this tab";
  }

  renderDisabledList(disabled);
}

document.getElementById("toggle-site").addEventListener("click", async () => {
  const host = await getCurrentHostname();
  if (!host) return;
  const list = await getDisabledSites();
  const isDisabled = list.includes(host);
  if (isDisabled) {
    await setDisabledSites(list.filter((h) => h !== host));
  } else {
    await setDisabledSites([...list, host]);
  }
  refresh();
});

refresh();
