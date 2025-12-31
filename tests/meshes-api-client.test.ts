import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { webcrypto } from "node:crypto";
import { MeshesApiError } from "../src/lib/errors";
import MeshesApiClient from "../src";

vi.mock("jose", () => {
  class SignJWT {
    payload: any;
    protectedHeader: any;
    issuer?: string;
    audience?: string;
    issuedAt?: boolean;
    expiration?: string;

    constructor(payload: any) {
      this.payload = payload;
    }
    setProtectedHeader(h: any) {
      this.protectedHeader = h;
      return this;
    }
    setIssuer(i: string) {
      this.issuer = i;
      return this;
    }
    setAudience(a: string) {
      this.audience = a;
      return this;
    }
    setIssuedAt() {
      this.issuedAt = true;
      return this;
    }
    setExpirationTime(e: string) {
      this.expiration = e;
      return this;
    }
    async sign(_secret: Uint8Array) {
      return "test.jwt.token";
    }
  }

  return { SignJWT };
});

type MockFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
  headers?: { get(name: string): string | null };
};

function mockResponse(opts: {
  ok: boolean;
  status?: number;
  statusText?: string;
  bodyText?: string;
  contentType?: string;
}): MockFetchResponse {
  const ct = opts.contentType ?? "application/json";
  return {
    ok: opts.ok,
    status: opts.status ?? (opts.ok ? 200 : 400),
    statusText: opts.statusText ?? (opts.ok ? "OK" : "Bad Request"),
    text: async () => opts.bodyText ?? "",
    headers: {
      get(name: string) {
        return name.toLowerCase() === "content-type" ? ct : null;
      },
    },
  };
}

const VALID_ORG_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_ACCESS_KEY = "mk_" + "a".repeat(22);
const VALID_SECRET_KEY = "b".repeat(43);

describe("MeshesApiClient (management api)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn();
    (globalThis as any).crypto ??= webcrypto;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("constructs with valid inputs", () => {
    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY)
    ).not.toThrow();
  });

  it("throws on invalid organizationId/accessKey/secretKey", () => {
    expect(
      () =>
        new MeshesApiClient("bad" as any, VALID_ACCESS_KEY, VALID_SECRET_KEY)
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, "mk_short" as any, VALID_SECRET_KEY)
    ).toThrow(MeshesApiError);

    expect(
      () => new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, "x" as any)
    ).toThrow(MeshesApiError);
  });

  it("throws on invalid options object", () => {
    expect(
      () =>
        new MeshesApiClient(
          VALID_ORG_ID,
          VALID_ACCESS_KEY,
          VALID_SECRET_KEY,
          null as any
        )
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(
          VALID_ORG_ID,
          VALID_ACCESS_KEY,
          VALID_SECRET_KEY,
          "nope" as any
        )
    ).toThrow(MeshesApiError);
  });

  it("throws on unsupported version", () => {
    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          version: "v2" as any,
        })
    ).toThrow(MeshesApiError);
  });

  it("throws on invalid timeout type / out of bounds (constructor)", () => {
    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          timeout: "x" as any,
        })
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          timeout: 999,
        })
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          timeout: 30001,
        })
    ).toThrow(MeshesApiError);
  });

  it("throws if options.headers is invalid or includes forbidden headers (constructor)", () => {
    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          headers: [] as any,
        })
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          headers: { "Content-Type": "evil" } as any, // forbidden
        })
    ).toThrow(MeshesApiError);

    expect(
      () =>
        new MeshesApiClient(VALID_ORG_ID, VALID_ACCESS_KEY, VALID_SECRET_KEY, {
          headers: { "X-Ok": 123 } as any, // non-string value
        })
    ).toThrow(MeshesApiError);
  });

  it("cleans constructor headers (trims, drops empties) and preserves allowed", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      {
        headers: {
          " X-Request-Id ": " req_1 ",
          "   ": "x",
          "X-Empty": "   ",
        } as any,
      } as any
    );

    await client.get("/ping");

    const [, init] = (globalThis.fetch as any).mock.calls[0];

    expect(init.headers["X-Request-Id"]).toBe("req_1");
    expect(init.headers["X-Empty"]).toBeUndefined();
  });

  it("injects Authorization Bearer token and sets contract headers", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await client.get("/accounts");

    const [, init] = (globalThis.fetch as any).mock.calls[0];

    expect(init.headers.Authorization).toBe("Bearer test.jwt.token");
    expect(init.headers.Accept).toBe("application/json");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["X-Meshes-Client"]).toMatch(/^Meshes API Client/);
  });

  it("normalizes path (adds leading slash), and appends query params", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await client.get("resources", { query: { a: 1, b: true, c: "x" } });

    const [url] = (globalThis.fetch as any).mock.calls[0];

    expect(url).toMatch(/^https:\/\/api\.meshes\.io\/api\/v1\/resources\?/);
    expect(url).toContain("a=1");
    expect(url).toContain("b=true");
    expect(url).toContain("c=x");
  });

  it("supports apiBaseUrl override", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      { apiBaseUrl: "https://example.test/api/v1" } as any
    );

    await client.get("/accounts");

    const [url] = (globalThis.fetch as any).mock.calls[0];
    expect(url).toBe("https://example.test/api/v1/accounts");
  });

  it("serializes POST/PUT/PATCH bodies (object -> JSON, string -> raw)", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );
    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await client.post("/things", { a: 1 });
    let [, init] = (globalThis.fetch as any).mock.calls.at(-1);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));

    await client.put("/things/1", "RAW");
    [, init] = (globalThis.fetch as any).mock.calls.at(-1);
    expect(init.method).toBe("PUT");
    expect(init.body).toBe("RAW");

    await client.patch("/things/1", { b: 2 });
    [, init] = (globalThis.fetch as any).mock.calls.at(-1);
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ b: 2 }));
  });

  it("DELETE sends correct method and no body by default", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );
    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await client.delete("/things/1");

    const [, init] = (globalThis.fetch as any).mock.calls[0];
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeNull();
  });

  it("rejects invalid request path", async () => {
    (globalThis.fetch as any).mockResolvedValue(mockResponse({ ok: true }));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/" as any)).rejects.toBeInstanceOf(MeshesApiError);
    await expect(client.get("   " as any)).rejects.toBeInstanceOf(
      MeshesApiError
    );
    await expect(client.get("" as any)).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("rejects invalid per-request timeout type / out of bounds", async () => {
    (globalThis.fetch as any).mockResolvedValue(mockResponse({ ok: true }));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(
      client.get("/x", { timeout: "nope" as any })
    ).rejects.toBeInstanceOf(MeshesApiError);

    await expect(client.get("/x", { timeout: 999 })).rejects.toBeInstanceOf(
      MeshesApiError
    );
    await expect(client.get("/x", { timeout: 30001 })).rejects.toBeInstanceOf(
      MeshesApiError
    );
  });

  it("rejects invalid query param shape (array/null)", async () => {
    (globalThis.fetch as any).mockResolvedValue(mockResponse({ ok: true }));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(
      client.get("/x", { query: ["nope"] as any })
    ).rejects.toBeInstanceOf(MeshesApiError);

    await expect(
      client.get("/x", { query: null as any })
    ).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("drops forbidden per-request headers (does not throw) and trims allowed", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await client.get("/x", {
      headers: {
        Accept: "text/plain", // forbidden -> dropped
        Authorization: "evil", // forbidden -> dropped
        " X-Request-Id ": " req_99 ", // allowed -> trimmed
      } as any,
    });

    const [, init] = (globalThis.fetch as any).mock.calls[0];

    expect(init.headers["X-Request-Id"]).toBe("req_99");
    expect(init.headers.Accept).toBe("application/json"); // enforced
    expect(init.headers.Authorization).toBe("Bearer test.jwt.token"); // enforced by jwt
  });

  it("returns parsed JSON (success)", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({
        ok: true,
        bodyText: '{"id":"acc_1"}',
        contentType: "application/json",
      })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/accounts/1")).resolves.toEqual({ id: "acc_1" });
  });

  it("returns text for success non-JSON responses", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: "OK", contentType: "text/plain" })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/ping")).resolves.toBe("OK");
  });

  it("returns null for empty success body", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: "", contentType: "application/json" })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/ping")).resolves.toBeNull();
  });

  it("throws MeshesApiError with status & parsed data on non-2xx", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        bodyText: '{"error":"nope"}',
        contentType: "application/json",
      })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    try {
      await client.get("/accounts");
      throw new Error("Expected to throw");
    } catch (err: any) {
      expect(err).toBeInstanceOf(MeshesApiError);
      expect(err.data.status).toBe(401);
      expect(err.data.statusText).toBe("Unauthorized");
      expect(err.data.data).toEqual({ error: "nope" });
    }
  });

  it("wraps errors when reading success body fails", async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => {
        throw new Error("boom");
      },
      headers: { get: () => "application/json" },
    });

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/x")).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("wraps errors when reading error body fails", async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => {
        throw new Error("boom");
      },
      headers: { get: () => "application/json" },
    });

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/x")).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("wraps fetch network errors (non-MeshesApiError)", async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error("NetworkDown"));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/x")).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("passes through MeshesApiError from fetch (covers instanceof branch)", async () => {
    (globalThis.fetch as any).mockRejectedValue(new MeshesApiError("already"));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await expect(client.get("/x")).rejects.toBeInstanceOf(MeshesApiError);
    await expect(client.get("/x")).rejects.toMatchObject({
      message: "already",
    });
  });

  it("supports callback style (success) and returns undefined", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await new Promise<void>((resolve, reject) => {
      const ret = client.get("/x", {}, (err: any, data?: any) => {
        try {
          expect(ret).toBeUndefined();
          expect(err).toBeNull();
          expect(data).toEqual({ ok: true });
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it("supports callback style (error) and returns undefined", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        bodyText: '{"e":1}',
      })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY
    );

    await new Promise<void>((resolve, reject) => {
      const ret = client.get("/x", {}, (err: any, data?: any) => {
        try {
          expect(ret).toBeUndefined();
          expect(err).toBeInstanceOf(MeshesApiError);
          expect(data).toBeUndefined();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it("aborts on timeout when AbortController exists", async () => {
    // Mock fetch that rejects when the AbortSignal aborts
    (globalThis.fetch as any).mockImplementation((_url: any, init: any) => {
      return new Promise((_resolve, reject) => {
        const signal: AbortSignal | undefined = init.signal;

        const fail = () => reject(new Error("AbortError"));

        if (!signal) {
          // If signal isn't provided, this test isn't applicable
          return reject(new Error("Missing AbortSignal"));
        }

        // If already aborted, fail immediately (prevents race)
        if (signal.aborted) return fail();

        signal.addEventListener("abort", fail, { once: true });
      });
    });

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      { timeout: 5000 } as any
    );

    const p = client.get("/x");

    // Let async token creation + includeApiJwt resolve and `fetch()` actually be invoked; due to signing and fetch calling
    for (
      let i = 0;
      i < 5 && (globalThis.fetch as any).mock.calls.length === 0;
      i++
    ) {
      await Promise.resolve();
    }
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Now trigger the timeout abort
    vi.advanceTimersByTime(6000);

    // Flush any promise reactions
    await Promise.resolve();

    await expect(p).rejects.toBeInstanceOf(MeshesApiError);
  });

  it("works without AbortController (signal is undefined)", async () => {
    const original = globalThis.AbortController;
    (globalThis as any).AbortController = undefined;

    try {
      (globalThis.fetch as any).mockResolvedValue(
        mockResponse({ ok: true, bodyText: '{"ok":true}' })
      );

      const client = new MeshesApiClient(
        VALID_ORG_ID,
        VALID_ACCESS_KEY,
        VALID_SECRET_KEY
      );
      await client.get("/x");

      const [, init] = (globalThis.fetch as any).mock.calls[0];
      expect(init.signal).toBeUndefined();
    } finally {
      (globalThis as any).AbortController = original;
    }
  });

  it("debug=true emits console.debug logs", async () => {
    const dbg = vi.spyOn(console, "debug").mockImplementation(() => {});
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      {
        debug: true,
      } as any
    );

    await client.get("/x");
    expect(dbg).toHaveBeenCalled();
  });

  it("debug=true emits console.error on failures", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (globalThis.fetch as any).mockRejectedValue(new Error("NetworkDown"));

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      {
        debug: true,
      } as any
    );

    await expect(client.get("/x")).rejects.toBeInstanceOf(MeshesApiError);
    expect(errSpy).toHaveBeenCalled();
  });

  it("skips invalid per-request header entries (non-string values) without throwing", async () => {
    (globalThis.fetch as any).mockResolvedValue(
      mockResponse({ ok: true, bodyText: '{"ok":true}' })
    );

    const client = new MeshesApiClient(
      VALID_ORG_ID,
      VALID_ACCESS_KEY,
      VALID_SECRET_KEY,
      {
        debug: true,
      } as any
    );

    await client.get("/x", {
      headers: {
        "X-Request-Id": "req_ok",
        "X-Not-String": 123 as any,
      } as any,
    });

    const [, init] = (globalThis.fetch as any).mock.calls[0];
    expect(init.headers["X-Request-Id"]).toBe("req_ok");
    expect(init.headers["X-Not-String"]).toBeUndefined();
  });
});
