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
  const image1 = document.getElementById("snippet-image-1");
  const image2 = document.getElementById("snippet-image-2");
  const imageStop = document.getElementById("snippet-image-stop");
  const grass = document.getElementById("snippet-grass-container");
  const snippet = document.querySelector(".snippet");

  if(disabled){
    image1.style.display = "none";
    image2.style.display = "none";
    imageStop.style.display = "block";
    grass.style.display = "none";
    snippet.classList.remove("active");
  } else {
    image1.style.display = "block";
    image2.style.display = "block";
    imageStop.style.display = "none";
    grass.style.display = "block";
    snippet.classList.add("active");
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
