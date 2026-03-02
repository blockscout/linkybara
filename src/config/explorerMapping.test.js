const { describe, it } = require("node:test");
const assert = require("node:assert");
const { rewriteExplorerUrl } = require("./explorerMapping.js");

const validAddress = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";
const validTxHash = "0xf67c3aa7ca07b6929821bb63c480b8b131800a6885e0bcc5c4853759910f41ab";

describe("rewriteExplorerUrl", () => {
  describe("dynamic routes", () => {
    it("rewrites address URL for etherscan.io to eth.blockscout.com", () => {
      const input = `https://etherscan.io/address/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://eth.blockscout.com/address/${validAddress}`);
    });

    it("rewrites tx URL for polygonscan to polygon.blockscout.com", () => {
      const input = `https://polygonscan.com/tx/${validTxHash}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://polygon.blockscout.com/tx/${validTxHash}`);
    });

    it("rewrites block URL for optimistic.etherscan.io to explorer.optimism.io", () => {
      const input = "https://optimistic.etherscan.io/block/148428458";
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, "https://explorer.optimism.io/block/148428458");
    });

    it("rewrites token URL for etherscan.io", () => {
      const input = `https://etherscan.io/token/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://eth.blockscout.com/token/${validAddress}`);
    });

    it("rewrites for subdomain (sepolia.etherscan.io)", () => {
      const input = `https://sepolia.etherscan.io/address/${validAddress}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, `https://sepolia.blockscout.com/address/${validAddress}`);
    });
  });

  describe("static routes", () => {
    it("rewrites /charts to /stats for etherscan.io", () => {
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

    it("returns null for known host but unknown path", () => {
      assert.strictEqual(rewriteExplorerUrl("https://etherscan.io/unknown/path"), null);
    });

    it("returns null for invalid URL", () => {
      assert.strictEqual(rewriteExplorerUrl("not-a-url"), null);
    });

    it("does not match address with wrong length (tx hash in address path)", () => {
      const input = `https://etherscan.io/address/${validTxHash}`;
      const out = rewriteExplorerUrl(input);
      assert.strictEqual(out, null);
    });

    it("does not match tx with wrong length (address in tx path)", () => {
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
