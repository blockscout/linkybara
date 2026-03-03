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

async function animateCapybara(disabled) {
  const image1 = document.getElementById("capybara-footer-image-1");
  const image2 = document.getElementById("capybara-footer-image-2");
  const imageStop = document.getElementById("capybara-footer-image-stop");
  const text = document.getElementById("capybara-footer-text");

  if(disabled){
    image1.style.display = "none";
    image2.style.display = "none";
    imageStop.style.display = "block";
    text.style.display = "none";
  } else {
    image1.style.display = "block";
    image2.style.display = "block";
    imageStop.style.display = "none";
    text.style.display = "block";
  }
}

async function refresh() {
  const host = await getCurrentHostname();
  const disabled = await getDisabledSites();
  const isDisabled = host && disabled.includes(host);

  const toggle = document.getElementById("toggle-site");

  if (host) {
    toggle.checked = !isDisabled;
    toggle.disabled = false;
    animateCapybara(isDisabled);
  } else {
    toggle.checked = false;
    toggle.disabled = true;
    animateCapybara(true);
  }
}

document.getElementById("toggle-site").addEventListener("change", async () => {
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
