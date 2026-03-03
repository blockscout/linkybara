const { describe, it } = require("node:test");
const assert = require("node:assert");
const { rewriteExplorerUrl, isSourceHost, isTargetHost } = require("./explorerMapping.js");

const validAddress = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";
const validTxHash = "0xf67c3aa7ca07b6929821bb63c480b8b131800a6885e0bcc5c4853759910f41ab";

describe("rewriteExplorerUrl", () => {
  describe("dynamic routes", () => {
    it("rewrites address URL from source host to target host", () => {
      const input = `https://etherscan.io/address/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://eth.blockscout.com/address/${validAddress}`);
    });

    it("rewrites tx URL for polygonscan to polygon.blockscout.com", () => {
      const input = `https://polygonscan.com/tx/${validTxHash}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://polygon.blockscout.com/tx/${validTxHash}`);
    });

    it("rewrites block URL from subdomain source to target", () => {
      const input = "https://optimistic.etherscan.io/block/148428458";
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, "https://explorer.optimism.io/block/148428458");
    });

    it("rewrites token URL from source host to target host", () => {
      const input = `https://etherscan.io/token/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://eth.blockscout.com/token/${validAddress}`);
    });

    it("rewrites for subdomain source host", () => {
      const input = `https://sepolia.etherscan.io/address/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://sepolia.blockscout.com/address/${validAddress}`);
    });

    it("rewrites address URL with ENS domain (e.g. vitalik.eth)", () => {
      const input = "https://etherscan.io/address/vitalik.eth";
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, "https://eth.blockscout.com/address/vitalik.eth");
    });

    it("does not rewrite token URL with ENS domain (tokens support only address hash)", () => {
      const input = "https://etherscan.io/token/sub.vitalik.eth";
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, null);
    });
  });

  describe("static routes", () => {
    it("rewrites /charts to /stats", () => {
      const input = "https://etherscan.io/charts";
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, "https://eth.blockscout.com/stats");
    });
  });

  describe("preserves query and hash", () => {
    it("keeps search params and hash", () => {
      const input = `https://etherscan.io/address/${validAddress}?foo=bar#section`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://eth.blockscout.com/address/${validAddress}?foo=bar#section`);
    });
  });

  describe("unsupported or invalid", () => {
    it("returns null for unknown host", () => {
      assert.strictEqual(rewriteExplorerUrl("https://example.com/address/0x123"), null);
    });

    it("returns null for configured host but unknown path", () => {
      assert.strictEqual(rewriteExplorerUrl("https://etherscan.io/unknown/path"), null);
    });

    it("returns null for invalid URL", () => {
      assert.strictEqual(rewriteExplorerUrl("not-a-url"), null);
    });

    it("does not match address with wrong length (tx hash in address path) for configured source", () => {
      const input = `https://etherscan.io/address/${validTxHash}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, null);
    });

    it("does not match tx with wrong length (address in tx path) for configured source", () => {
      const input = `https://etherscan.io/tx/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, null);
    });
  });

  describe("other configured explorers", () => {
    it("rewrites basescan.org to base.blockscout.com", () => {
      const input = `https://basescan.org/address/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://base.blockscout.com/address/${validAddress}`);
    });

    it("rewrites arbiscan.io to arbitrum.blockscout.com", () => {
      const input = `https://arbiscan.io/tx/${validTxHash}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://arbitrum.blockscout.com/tx/${validTxHash}`);
    });

    it("rewrites nova.arbiscan.io to arbitrum-nova.blockscout.com", () => {
      const input = `https://nova.arbiscan.io/block/12345`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, "https://arbitrum-nova.blockscout.com/block/12345");
    });
  });
});

describe("isSourceHost", () => {
  it("returns true for all configured source explorer hosts", () => {
    const sourceHosts = [
      "etherscan.io",
      "sepolia.etherscan.io",
      "optimistic.etherscan.io",
      "mega.etherscan.io",
      "polygonscan.com",
      "arbiscan.io",
      "nova.arbiscan.io",
      "basescan.org",
      "celoscan.io",
      "gnosisscan.io",
    ];
    for (const host of sourceHosts) {
      assert.strictEqual(isSourceHost(host), true, `expected isSourceHost("${host}") === true`);
    }
  });

  it("returns false for target hosts and unknown hosts", () => {
    assert.strictEqual(isSourceHost("eth.blockscout.com"), false);
    assert.strictEqual(isSourceHost("explorer.optimism.io"), false);
    assert.strictEqual(isSourceHost("example.com"), false);
  });

  it("is used by content script to skip rewriting when user is on source explorer", () => {
    // When the page host is a source host (e.g. etherscan.io), the content script
    // must not rewrite any links so the source explorer remains usable.
    assert.strictEqual(isSourceHost("etherscan.io"), true);
    assert.strictEqual(isSourceHost("polygonscan.com"), true);
  });
});

describe("isTargetHost", () => {
  it("returns true for all configured target explorer hosts", () => {
    const targetHosts = [
      "eth.blockscout.com",
      "explorer.optimism.io",
    ];
    for (const host of targetHosts) {
      assert.strictEqual(isTargetHost(host), true, `expected isTargetHost("${host}") === true`);
    }
  });

  it("returns true for subdomains of blockscout.com", () => {
    assert.strictEqual(isTargetHost("api.eth.blockscout.com"), true);
  });

  it("returns false for source hosts and unknown hosts", () => {
    assert.strictEqual(isTargetHost("etherscan.io"), false);
    assert.strictEqual(isTargetHost("polygonscan.com"), false);
    assert.strictEqual(isTargetHost("example.com"), false);
  });

  it("is used by content script to skip rewriting when user is on target explorer", () => {
    // When the page host is a target host (e.g. eth.blockscout.com), the content script
    // must not rewrite any links so the target explorer remains usable.
    assert.strictEqual(isTargetHost("eth.blockscout.com"), true);
    assert.strictEqual(isTargetHost("explorer.optimism.io"), true);
  });
});
