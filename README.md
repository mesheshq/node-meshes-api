# meshes-api (@mesheshq/api)

[![Tests](https://github.com/mesheshq/node-meshes-api/actions/workflows/tests.yml/badge.svg)](https://github.com/mesheshq/node-meshes-api/actions/workflows/tests.yml)
[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

A minimal JavaScript client for calling **Meshes Management APIs** using an **organization id**, **access key**, and **secret key**.

This package is designed to be tiny and predictable:

- Supports **Promise**, **async/await**, and **callback** styles
- Works with both **ESM** and **CommonJS**
- Automatically signs a short-lived **machine token (JWT)** and sends it as a `Bearer` token
- Allows safe custom headers (with contract headers protected)
- Optional timeout support using `AbortController` when available

---

## Installation

```bash
npm i @mesheshq/api
# or
pnpm add @mesheshq/api
# or
yarn add @mesheshq/api
```

---

## Quick Start

The package exports:

- `MeshesApiClient` (default export + named export)
- `MeshesApiError`

```js
// CommonJS
// const { MeshesApiClient } = require("@mesheshq/api");

// ESM
import MeshesApiClient, { MeshesApiClient as NamedClient } from "@mesheshq/api";

const organizationId = process.env.MESHES_ORGANIZATION_ID!;
const accessKey = process.env.MESHES_ACCESS_KEY!;
const secretKey = process.env.MESHES_SECRET_KEY!;

const client = new MeshesApiClient(organizationId, accessKey, secretKey);

// Promise style
client
  .get("/workspaces")
  .then((result) => {
    // success handling
  })
  .catch((err) => {
    // error handling
  });

// Using async/await
try {
  const workspaces = await client.get("/workspaces");
  // success handling
} catch (err) {
  // error handling
}
```

### Callback style (no Promise returned)

If you provide a callback, the method returns `undefined` and invokes the callback when complete.

```js
client.get("/workspaces", {}, function (err, result) {
  if (err) {
    // error handling
  } else {
    // success handling
  }
});
```

---

## Credentials

### Organization ID

`organizationId` is a UUID that identifies your Meshes account organization.  This can be found in the main account settings.

Example:

```
123e4567-e89b-12d3-a456-426614174000
```

### Access Key + Secret Key

The management API client uses an **access key** and **secret key** to sign a short-lived machine token (JWT).

The client then sends the token as:

```
Authorization: Bearer <token>
```

Example access key:

```
mk_abcdefghijklmnopqrstuv
```

Example secret key:

```
b6YH5cKJ9m3sYt... (long string)
```

If any credential is missing or invalid, the client throws a `MeshesApiError` immediately during construction.

---

## Usage

### Initialization

```js
import MeshesApiClient from "@mesheshq/api";

const client = new MeshesApiClient(
  process.env.MESHES_ORGANIZATION_ID!,
  process.env.MESHES_ACCESS_KEY!,
  process.env.MESHES_SECRET_KEY!,
  {
    version: "v1", // only "v1" currently supported
    timeout: 10000, // 1000..30000 ms
    debug: false, // logs to console.debug / console.error when true

    // Optional: extra default headers applied to all requests
    headers: {
      "X-Request-Id": "req_123",
    },

    // Optional: override base URL for testing
    // apiBaseUrl: "https://example.test/api/v1",
  }
);
```

### GET

```js
const me = await client.get("/workspaces");
```

### POST / PUT / PATCH

Bodies are serialized automatically:

- objects → `JSON.stringify(body)`
- strings → sent as-is

```js
const created = await client.post("/resources", { name: "My Resource" });

const updated = await client.put("/resources/123", { name: "Renamed" });

await client.patch("/resources/123", { enabled: true });
```

### DELETE

```js
await client.delete("/resources/123");
```

---

## Request Options

All request methods accept an optional `options` object:

```js
await client.get("/resources", {
  // Add request-specific headers
  headers: {
    "Idempotency-Key": "idem_456",
    "X-Request-Id": "req_789",
  },

  // Optional query parameters
  query: {
    limit: 25,
    active: true,
  },

  // Override timeout for this call only (1000..30000 ms)
  timeout: 15000,
});
```

### Query parameters

`query` values may be strings, numbers, or booleans. They will be stringified and appended to the URL.

---

## Protected / Forbidden Headers

To keep the API contract consistent, the following headers cannot be overridden via **constructor** `options.headers`
and will cause a `MeshesApiError`:

- `Authorization`
- `X-Meshes-Client`
- `Content-Type`
- `Accept`

If you pass these in **per-request** `options.headers`, they are silently dropped (and the client’s contract headers remain in effect).

---

## Errors

All client errors are thrown as `MeshesApiError`.

```js
import MeshesApiClient, { MeshesApiError } from "@mesheshq/api";

try {
  const client = new MeshesApiClient(
    process.env.MESHES_ORGANIZATION_ID!,
    process.env.MESHES_ACCESS_KEY!,
    process.env.MESHES_SECRET_KEY!
  );

  await client.get("/workspaces");
} catch (err) {
  if (err instanceof MeshesApiError) {
    console.error("Meshes error:", err.message, err.data);
  } else {
    console.error("Unexpected error:", err);
  }
}
```

### HTTP Failures

If the Meshes API returns a non-2xx response, the client throws `MeshesApiError` and includes:

```js
err.data = {
  status: 401,
  statusText: "Unauthorized",
  data: { ...parsedResponseBodyOrText },
};
```

---

## Response Body Parsing

Responses are parsed as:

- JSON (if the response body is valid JSON)
- otherwise plain text
- `null` if the response body is empty

---

## Timeouts and AbortController

Timeout support uses `AbortController` when available (modern Node versions have it globally).  
If `AbortController` is not available, requests still work, but timeouts cannot be enforced by aborting the request.

Timeout range: **1000ms** to **30000ms**.

---

## Node / Runtime Notes

This client uses `fetch`. Ensure your runtime provides a global `fetch`:

- Node 18+ has global `fetch`
- For Node 16/17 you may need a polyfill (e.g. `undici`) or run in an environment that provides it

### WebCrypto / jose (Node 16/17)

If you run on Node 16/17 and see errors related to WebCrypto, you may need to provide `globalThis.crypto`:

```js
import { webcrypto } from "node:crypto";
globalThis.crypto ??= webcrypto;
```

Node 18+ already includes WebCrypto globally.

---

## License

MIT

[npm-install-size-image]: https://badgen.net/packagephobia/publish/@mesheshq/api?cache=250&v1.0.0
[npm-install-size-url]: https://packagephobia.com/result?p=%40mesheshq%2Fapi
[npm-url]: https://www.npmjs.com/package/@mesheshq/api
[npm-version-image]: https://badgen.net/npm/v/@mesheshq/api?cache=250&v1.0.0
