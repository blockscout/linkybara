# Blockscout Link Replacer

Chrome extension that rewrites blockchain explorer links to Blockscout explorers links on any webpage. You configure source → target host and path patterns; for example (with the default config):

- `https://etherscan.io/address/0x...` → `https://eth.blockscout.com/address/0x...`
- `https://sepolia.etherscan.io/tx/0x...` → `https://sepolia.blockscout.com/tx/0x...`

The extension is **enabled by default on all pages**. You can disable it for specific sites via the popup (click the extension icon).

## Installation (development)

1. Run **`npm install`** and **`npm run build`** (builds the explorer mapping bundle that includes [path-to-regexp](https://github.com/pillarjs/path-to-regexp)).
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder (`blockscout_chrome_extension`).
5. The extension icon will appear in the toolbar.

## Usage

- **Automatic**: On any page, links to configured source explorers are rewritten to their target explorers when the page loads and when new links are added (e.g. in SPAs).
- **Disable on a site**: Click the extension icon, then click **Disable on this site**. The current tab’s hostname is added to the disabled list and links are no longer rewritten on that site. Click **Enable on this site** to remove it from the list.
- **Disabled sites list**: The popup shows all hostnames where the extension is disabled; use **Remove** to re-enable rewriting on that site.

## Configuration

Explorer mapping is defined in **`src/config/explorerMapping.js`**. After editing it, run **`npm run build`** so the content script loads the updated bundle.

- **HOST_MAPPINGS**: For each source host, define **targetHost** and a **routes** array of `{ source, target }` path patterns. Source host is matched exactly or as a suffix (e.g. `explorer.com` matches `chain.explorer.com`); list more specific hosts first.
- **Route patterns**: Use placeholders `{number}`, `{addressHash}`, `{txHash}` for dynamic segments (validated: digits; 0x+40 hex; 0x+64 hex). Static paths (e.g. `/charts` → `/stats`) have no placeholders.
- **path-to-regexp** is used for matching and compiling paths; see **`src/config/examples.md`** for the full config shape and examples.

## Tests

Run **`npm test`** to execute unit tests for the explorer mapping (`src/config/explorerMapping.test.js`). Uses Node’s built-in test runner.

## Icons

Placeholder icons are in `icons/` (16.png, 48.png, 128.png). Replace them with your own assets if desired.

## Permissions

- **storage**: Saves the list of sites where the extension is disabled (synced across devices if signed in to Chrome).
- **activeTab**: Used by the popup to read the current tab’s URL for “Disable on this site”.
- **host_permissions** `<all_urls>`: Allows the content script to run on every page so links can be rewritten.
