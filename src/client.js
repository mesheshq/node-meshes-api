"use strict";

/**
 * JavaScript Meshes API Client
 * @module meshes-api
 * @license MIT
 * @since 1.0.0
 * @description Meshes API client for management APIs.
 * @repository https://github.com/mesheshq/node-meshes-api
 */

/** @typedef {import("./index.js").Headers} Headers */
/** @typedef {import("./index.js").MeshesOptions} MeshesOptions */
/** @typedef {import("./index.js").MeshesApiMethod} MeshesApiMethod */
/** @typedef {import("./index.js").MeshesRequestOptions} MeshesRequestOptions */
/** @typedef {import("./index.js").MeshesOptionalRequestOptions} MeshesOptionalRequestOptions */
/** @typedef {import("./index.js").CallbackFunction<any>} CallbackAny */
/** @typedef {{ method: string, headers: Headers, body: string | null, signal?: AbortSignal }} MeshesRequestInit */

import { MeshesApiError } from "./lib/errors.js";
import { readBody } from "./lib/helpers.js";
import { SignJWT } from "jose";

const MAX_TIMEOUT_MS = 30000;

const forbiddenHeaders = new Set([
  "accept",
  "authorization",
  "content-length",
  "content-type",
  "host",
  "x-amz-date",
  "x-api-key",
  "x-amz-security-token",
  "x-amz-user-agent",
  "x-meshes-client",
  "x-meshes-publishable-key",
]);

/**
 * Valid HTTP methods
 * @type {MeshesApiMethod[]}
 * @constant
 */
const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/**
 * Meshes API Options
 * @type {MeshesOptions}
 * @constant
 */
const defaultOptions = {
  version: "v1",
  timeout: 5000,
  debug: false,
};

/**
 * Meshes API Client
 * @class
 */
export class MeshesApiClient {
  #organizationId;
  #accessKey;
  #secretKey;
  #apiBaseUrl;
  #apiHeaders;
  #apiTimeout;
  #debug;

  /**
   * Create the Meshes API Client.
   * @param {string} organizationId - Meshes Account Organization ID
   * @param {string} accessKey - API access key
   * @param {string} secretKey - API secret key
   * @param {MeshesOptions} options - Additional options
   * @constructor - Meshes API constructor
   */
  constructor(organizationId, accessKey, secretKey, options = {}) {
    const regex = {
      organizationId:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      accessKey: /^mk_[A-Za-z0-9_-]+$/,
      secretKey: /^[A-Za-z0-9_-]{43,}$/,
    };

    if (
      typeof organizationId !== "string" ||
      !regex.organizationId.test(organizationId)
    ) {
      throw new MeshesApiError(
        `Missing or invalid account organization ID: ${organizationId}`
      );
    }
    if (typeof accessKey !== "string" || !regex.accessKey.test(accessKey)) {
      throw new MeshesApiError(`Missing or invalid access key: ${accessKey}`);
    }
    if (typeof secretKey !== "string" || !regex.secretKey.test(secretKey)) {
      throw new MeshesApiError(`Missing or invalid secret key: ${secretKey}`);
    }

    if (!options || typeof options !== "object") {
      throw new MeshesApiError(
        `Invalid options object: ${typeof options}`,
        options
      );
    }
    options = { ...defaultOptions, ...options };

    if (typeof options.version !== "string") {
      throw new MeshesApiError(`Invalid API version: ${options.version}`);
    } else if (options.version !== "v1") {
      throw new MeshesApiError(`Unsupported API version: ${options.version}`);
    }
    if (typeof options.timeout !== "undefined") {
      if (typeof options.timeout !== "number") {
        throw new MeshesApiError(`Invalid request timeout: ${options.timeout}`);
      } else if (options.timeout < 1000 || options.timeout > MAX_TIMEOUT_MS) {
        throw new MeshesApiError(
          `Unsupported request timeout: ${options.timeout}`
        );
      }
    }

    if (typeof options.headers !== "undefined") {
      if (
        !options.headers ||
        typeof options.headers !== "object" ||
        Array.isArray(options.headers)
      ) {
        throw new MeshesApiError(
          `Invalid additional request headers: ${typeof options.headers}`,
          options.headers
        );
      }
      for (const [k, v] of Object.entries(options.headers)) {
        if (typeof v !== "string") {
          throw new MeshesApiError(
            `Invalid request header value for ${k}: ${typeof v}`,
            options.headers
          );
        }
        if (forbiddenHeaders.has(k.toLowerCase())) {
          throw new MeshesApiError(`Header not allowed: ${k}`, options.headers);
        }
      }
    }

    this.#organizationId = organizationId;
    this.#accessKey = accessKey;
    this.#secretKey = new TextEncoder().encode(secretKey);
    this.#apiBaseUrl =
      options.apiBaseUrl ?? `https://api.meshes.io/api/${options.version}`;
    this.#apiHeaders = {
      ...this.#cleanHeaders(options.headers),
      "X-Meshes-Client": "Meshes API Client v1.0.0",
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    this.#apiTimeout = options.timeout;
    this.#debug = options.debug === true;
  }

  /**
   * Log debug messages
   * @param {string} message - Debug message
   * @returns {void}
   */
  #log(message) {
    if (this.#debug) {
      console.debug(...arguments);
    }
  }

  /**
   * Log error messages
   * @param {string} message - Debug message
   * @returns {void}
   */
  #error(message) {
    if (this.#debug) {
      console.error(...arguments);
    }
  }

  /**
   * Create the Meshes machine token to use for the bearer token
   * @returns {Promise<string>}
   */
  async #createMeshesMachineToken() {
    return new SignJWT({
      org: this.#organizationId,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
        kid: this.#accessKey,
      })
      .setIssuer(`urn:meshes:m2m:${this.#accessKey}`)
      .setAudience("meshes-api")
      .setIssuedAt() // automatically sets iat (seconds)
      .setExpirationTime("30s") // must be <= 60s
      .sign(this.#secretKey);
  }

  /**
   * Add the JWT to all outgoing API requests
   * @param {MeshesRequestInit} request
   * @returns {Promise<MeshesRequestInit>}
   * @throws {MeshesApiError} - No Authentication Data
   */
  async #includeApiJwt(request) {
    if (this.#accessKey && this.#secretKey) {
      const token = await this.#createMeshesMachineToken();
      request.headers["Authorization"] = `Bearer ${token}`;
    } else {
      throw new MeshesApiError("No Authentication Data");
    }
    return request;
  }

  /**
   * Clean the input headers
   * @param {Headers | undefined} headers - Request headers
   * @returns {Headers} - Cleaned headers
   */
  #cleanHeaders(headers) {
    if (!headers || typeof headers !== "object") {
      return {};
    }

    /** @type {Headers} */
    const cleanHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof key !== "string" || typeof value !== "string") {
        this.#log("Invalid Header", key, value);
        continue;
      }

      const k = key.trim();
      const v = value.trim();
      if (!k || !v) {
        continue;
      }
      if (forbiddenHeaders.has(k.toLowerCase())) {
        continue;
      }
      cleanHeaders[k] = v;
    }
    return cleanHeaders;
  }

  /**
   * Make an API request
   * @param {MeshesRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  #request(options, done) {
    this.#log("Request Options", options, done ? "Callback" : "Promise");

    // AbortController was added in node v14.17.0 globally; if not available, don't support timeouts
    const AbortController = globalThis.AbortController ?? undefined;
    const controller = AbortController ? new AbortController() : undefined;
    const effectiveTimeout =
      typeof options?.timeout === "number" ? options.timeout : this.#apiTimeout;
    const timeout = AbortController
      ? setTimeout(() => controller?.abort(), effectiveTimeout)
      : undefined;
    if (controller === undefined) {
      this.#log("AbortController", "Not Supported; Timeouts won't be enforced");
    }

    const requestPromise = new Promise((resolve, reject) => {
      if (typeof options !== "object") {
        this.#log("Invalid Request Options", options);
        throw new MeshesApiError("Invalid request options", options);
      }
      const method = /** @type {MeshesApiMethod | undefined} */ (
        options?.method?.toUpperCase()
      );
      if (!method || typeof method !== "string") {
        this.#log("Invalid Request Method", options);
        throw new MeshesApiError("Invalid request method", options);
      } else if (!validMethods.includes(method)) {
        this.#log("Invalid Request Method Option", options);
        throw new MeshesApiError("Unsupported request method", options);
      }

      if (
        !options?.path ||
        typeof options.path !== "string" ||
        options.path.trim().length === 0 ||
        options.path.trim() === "/"
      ) {
        this.#log("Invalid Request Path", options);
        throw new MeshesApiError("Invalid request path", options);
      }

      if (typeof options?.timeout !== "undefined") {
        if (typeof options.timeout !== "number") {
          this.#log("Invalid Request Timeout", options);
          throw new MeshesApiError("Invalid request timeout", options);
        }
        if (options.timeout < 1000 || options.timeout > MAX_TIMEOUT_MS) {
          this.#log("Unsupported Request Timeout", options);
          throw new MeshesApiError("Unsupported request timeout", options);
        }
      }

      if (typeof options.query !== "undefined") {
        if (
          !options.query ||
          typeof options.query !== "object" ||
          Array.isArray(options.query)
        ) {
          this.#log("Invalid Request Query Params", options);
          throw new MeshesApiError("Invalid request query params", options);
        }
      }

      try {
        const queryString = options.query
          ? `?${new URLSearchParams(
              Object.entries(options.query).reduce((acc, [k, v]) => {
                acc[k] = String(v);
                return acc;
              }, /** @type {Record<string, string>} */ ({}))
            ).toString()}`
          : "";

        const requestPath =
          options.path.charAt(0) !== "/" ? `/${options.path}` : options.path;

        this.#log("Fetch Options", {
          method: method,
          path: requestPath,
          query: queryString,
        });

        return this.#includeApiJwt({
          method: method,
          headers: {
            ...this.#cleanHeaders(options.headers),
            ...this.#apiHeaders,
          },
          body: options.body
            ? typeof options.body === "string"
              ? options.body
              : JSON.stringify(options.body)
            : null,
          signal: controller?.signal,
        })
          .then((requestOptions) => {
            return fetch(
              `${this.#apiBaseUrl}${requestPath}${queryString}`,
              requestOptions
            );
          })
          .then((response) => {
            if (response.ok) {
              readBody(response)
                .then((data) => {
                  this.#log("Response Success");
                  resolve(data);
                })
                .catch((err) => {
                  this.#error("Response Parsing Error", err);
                  reject(
                    new MeshesApiError("Error parsing response data", err)
                  );
                });
            } else {
              readBody(response)
                .then((data) => {
                  this.#log("Response Error", data);
                  reject(
                    new MeshesApiError("Meshes API request failed", {
                      status: response.status,
                      statusText: response.statusText,
                      data,
                    })
                  );
                })
                .catch((err) => {
                  this.#error("Response Parsing Failure", err);
                  reject(
                    new MeshesApiError("Error parsing request failure", {
                      status: response.status,
                      statusText: response.statusText,
                      error: err,
                    })
                  );
                });
            }
          })
          .catch((err) => {
            this.#error("Request Failure", err);
            reject(new MeshesApiError("Request Failure", err));
          });
      } catch (err) {
        this.#error("Unexpected Error", err);
        reject(new MeshesApiError("Unexpected Error", err));
        throw err;
      }
    })
      .then((result) => {
        this.#log("Promise Success", result);

        if (done) {
          this.#log("Promise Success", "Callback Success");
          done(null, result);
          return;
        }

        return result;
      })
      .catch((err) => {
        this.#log("Promise Error", err);

        if (done) {
          this.#log("Promise Error", "Callback Error");
          done(err);
          return;
        }

        throw err;
      })
      .finally(() => {
        if (timeout) {
          clearTimeout(timeout);
        }
      });

    if (done) {
      return undefined;
    }
    this.#log("Promise Returned", "No callback");
    return requestPromise;
  }

  /**
   * API GET request
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  get(path, options = {}, done) {
    return this.#request(
      {
        ...options,
        path: path,
        method: "GET",
      },
      done
    );
  }

  /**
   * API POST request
   * @param {string} path - Request path
   * @param {unknown} body - Request body
   * @param {MeshesOptionalRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  post(path, body, options = {}, done) {
    return this.#request(
      {
        ...options,
        path: path,
        method: "POST",
        body: body,
      },
      done
    );
  }

  /**
   * API PUT request
   * @param {string} path - Request path
   * @param {unknown} body - Request body
   * @param {MeshesOptionalRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  put(path, body, options = {}, done) {
    return this.#request(
      {
        ...options,
        path: path,
        method: "PUT",
        body: body,
      },
      done
    );
  }

  /**
   * API PATCH request
   * @param {string} path - Request path
   * @param {unknown} body - Request body
   * @param {MeshesOptionalRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  patch(path, body, options = {}, done) {
    return this.#request(
      {
        ...options,
        path: path,
        method: "PATCH",
        body: body,
      },
      done
    );
  }

  /**
   * API DELETE request
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions} options - Request options
   * @param {CallbackAny | undefined} done - Callback function
   * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
   * @throws {MeshesApiError} - Invalid request
   */
  delete(path, options = {}, done) {
    return this.#request(
      {
        ...options,
        path: path,
        method: "DELETE",
      },
      done
    );
  }
}

export default MeshesApiClient;

export { MeshesApiError };
