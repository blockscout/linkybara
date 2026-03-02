const STORAGE_KEY = "disabledSites";

async function getDisabledSites() {
  const r = await chrome.storage.sync.get([STORAGE_KEY]);
  return Array.isArray(r[STORAGE_KEY]) ? r[STORAGE_KEY] : [];
}

async function setDisabledSites(list) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: list });
}

async function addDisabledSite(hostname) {
  const list = await getDisabledSites();
  if (list.includes(hostname)) return list;
  const next = [...list, hostname];
  await setDisabledSites(next);
  return next;
}

async function removeDisabledSite(hostname) {
  const list = await getDisabledSites();
  const next = list.filter((h) => h !== hostname);
  await setDisabledSites(next);
  return next;
}
