# Explorer link mapping – examples and config overview

## URL rewriting

Only the **path** is used for matching and rewriting (query and fragment are preserved). The full path must match a route; no partial or prefix match.

Example transformations (default config):

| Source link | Target link |
| --- | --- |
| https://etherscan.io/address/0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97 | https://eth.blockscout.com/address/0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97 |
| https://optimistic.etherscan.io/block/148428458 | https://explorer.optimism.io/block/148428458 |
| https://polygonscan.com/tx/0xf67c3aa7ca07b6929821bb63c480b8b131800a6885e0bcc5c4853759910f41ab | https://polygon.blockscout.com/tx/0xf67c3aa7ca07b6929821bb63c480b8b131800a6885e0bcc5c4853759910f41ab |
| https://etherscan.io/charts | https://eth.blockscout.com/stats |

## Config structure (`explorerMapping.js`)

Route matching and param extraction use **[path-to-regexp](https://github.com/pillarjs/path-to-regexp)**. Config patterns use `{paramName}` placeholders; they are converted to path-to-regexp’s `:paramName` syntax internally.

### 1. Parameter patterns

Dynamic path segments are validated by **param name**:

| Param          | Pattern        | Use case              |
|----------------|----------------|------------------------|
| `number`       | digits only    | Block number           |
| `addressHash`  | `0x` + 40 hex  | Contract/account address |
| `txHash`       | `0x` + 64 hex  | Transaction hash       |

### 2. Per-host mapping

Each entry in `HOST_MAPPINGS` has:

- **`sourceHost`** – Matched case-insensitively (exact or suffix, e.g. `explorer.com` matches `chain.explorer.com`). More specific hosts should appear first.
- **`targetHost`** – Host used for the rewritten URL.
- **`routes`** – Array of `{ source, target }` path patterns. First match wins.

Example:

```js
{
  sourceHost: "source.explorer.com",
  targetHost: "target.explorer.com",
  routes: [
    { source: "/block/{number}", target: "/block/{number}" },
    { source: "/tx/{txHash}", target: "/tx/{txHash}" },
    { source: "/address/{addressHash}", target: "/address/{addressHash}" },
    { source: "/token/{addressHash}", target: "/token/{addressHash}" },
    { source: "/charts", target: "/stats" },
  ],
}
```

### 3. Route patterns

- **Dynamic** – Placeholders like `{number}`, `{addressHash}`, `{txHash}`. The path must match the source pattern and each captured segment must pass the corresponding param pattern; the target path is built by substituting the same values into the target pattern.
- **Static** – No placeholders (e.g. `source: "/charts"`, `target: "/stats"`). Exact path match; target is used as-is.

You can map the same source path to different target paths per host by defining different `routes` per `sourceHost`/`targetHost`.
