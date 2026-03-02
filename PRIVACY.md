# Linkybara – Privacy Policy

**Last updated:** March 2026

Linkybara is a Chrome extension that rewrites block explorer links on web pages to point to Blockscout. This policy describes what data the extension uses and where it is stored.

## Data we store

Linkybara stores **one piece of data**:

- **Disabled sites list** – The list of website hostnames (e.g. `example.com`) where you have chosen to disable link rewriting. This is saved in Chrome’s built-in **sync storage** so it can follow you across devices if you are signed into Chrome.

Nothing else is stored. We do not store your browsing history, full URLs, addresses, transaction hashes, or any other personal or identifying information.

## Data we do not collect

- We do **not** send any data to our servers or to any third party. Linkybara has no backend or analytics.
- We do **not** collect, transmit, or analyze your browsing history.
- We do **not** use cookies or other tracking for advertising or profiling.
- Link rewriting is done entirely in your browser. Only the hostname of the page you are on and the list of disabled hostnames are used locally to decide whether to rewrite links on that page.

## How data is used

- **In the popup:** When you open the extension popup, we read the hostname of the current tab only to show “Disable on this site” / “Enable on this site” and to manage your disabled-sites list. This stays in your browser.
- **On web pages:** The content script runs on pages to rewrite links. It reads the page’s hostname and your disabled-sites list from Chrome storage to decide whether to rewrite; no data is sent elsewhere.

## Your control

- You can remove individual sites from the disabled list in the popup at any time.
- Uninstalling the extension removes all data stored by Linkybara (Chrome deletes the extension’s storage on uninstall).

## Contact

This extension is developed by Blockscout. The source code is available at [github.com/blockscout/linkybara](https://github.com/blockscout/linkybara). For questions about this privacy policy, please open an issue there.
