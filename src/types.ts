/**
 * Typescript type definitions for Meshes API Client
 * @module meshes-api
 * @license MIT
 * @since 1.0.0
 * @description Meshes API client for management APIs.
 * @repository https://github.com/mesheshq/node-meshes-api
 */

export type MeshesErrorResponse = {
  message: string;
  error?: unknown;
};

/**
 * Callback function to use rather than promises
 */
export type CallbackFunction<T = unknown> = (
  err: MeshesApiError | null,
  data?: T
) => void;

/**
 * Request headers
 */
export type Headers = {
  [key: string]: string;
};

/**
 * Query parameters
 */
export type QueryParams = Record<string, string | number | boolean>;

/**
 * Meshes API Config Options
 */
export type MeshesOptions = {
  /**
   * API version
   */
  version?: "v1";

  /**
   * Request timeout in milliseconds
   * @constraint [1000-30000]
   */
  timeout?: number;

  /**
   * Additional request headers
   */
  headers?: Headers;

  /**
   * If true, will enable debug mode.
   */
  debug?: boolean;

  /**
   * API Base Url.  This is optional and can be useful for testing.
   * @default "https://api.meshes.io/api/v1"
   */
  apiBaseUrl?: string;
};

/**
 * Meshes API Optional Request Options
 */
export type MeshesOptionalRequestOptions = {
  /**
   * Request headers
   */
  headers?: Headers;

  /**
   * Query parameters
   */
  query?: QueryParams;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
};

export type MeshesApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Meshes API Request Options
 */
export type MeshesRequestOptions = {
  method: MeshesApiMethod;
  path: string;
  body?: unknown;

  /**
   * Request headers
   */
  headers?: Headers;

  /**
   * Query parameters
   */
  query?: QueryParams;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
};

/**
 * Meshes API Client
 * @class
 * @property {Function} get - Send a GET request to the Meshes API
 * @property {Function} post - Send a POST request to the Meshes API
 * @property {Function} put - Send a PUT request to the Meshes API
 * @property {Function} patch - Send a PATCH request to the Meshes API
 * @property {Function} delete - Send a DELETE request to the Meshes API
 */
export declare class MeshesApiClient {
  constructor(
    organizationId: string,
    accessKey: string,
    secretKey: string,
    options?: MeshesOptions
  );

  /**
   * Send a GET request to the Meshes API
   * @template T
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Request promise
   */
  get<T = unknown>(
    path: string,
    options?: MeshesOptionalRequestOptions
  ): Promise<T>;

  /**
   * Send a GET request to the Meshes API (callback form)
   * @template T
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions | undefined} options - Request options
   * @param {CallbackFunction<T>} done - Callback function
   * @returns {undefined} - Undefined when a callback is provided
   */
  get<T = unknown>(
    path: string,
    options: MeshesOptionalRequestOptions | undefined,
    done: CallbackFunction<T>
  ): undefined;

  /**
   * Send a POST request to the Meshes API
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Request promise
   */
  post<T = unknown, B = unknown>(
    path: string,
    body: B,
    options?: MeshesOptionalRequestOptions
  ): Promise<T>;

  /**
   * Send a POST request to the Meshes API (callback form)
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions | undefined} options - Request options
   * @param {CallbackFunction<T>} done - Callback function
   * @returns {undefined} - Undefined when a callback is provided
   */
  post<T = unknown, B = unknown>(
    path: string,
    body: B,
    options: MeshesOptionalRequestOptions | undefined,
    done: CallbackFunction<T>
  ): undefined;

  /**
   * Send a PUT request to the Meshes API
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Request promise
   */
  put<T = unknown, B = unknown>(
    path: string,
    body: B,
    options?: MeshesOptionalRequestOptions
  ): Promise<T>;

  /**
   * Send a PUT request to the Meshes API (callback form)
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions | undefined} options - Request options
   * @param {CallbackFunction<T>} done - Callback function
   * @returns {undefined} - Undefined when a callback is provided
   */
  put<T = unknown, B = unknown>(
    path: string,
    body: B,
    options: MeshesOptionalRequestOptions | undefined,
    done: CallbackFunction<T>
  ): undefined;

  /**
   * Send a PATCH request to the Meshes API
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Request promise
   */
  patch<T = unknown, B = unknown>(
    path: string,
    body: B,
    options?: MeshesOptionalRequestOptions
  ): Promise<T>;

  /**
   * Send a PATCH request to the Meshes API (callback form)
   * @template T
   * @template B
   * @param {string} path - Request path
   * @param {B} body - Request body
   * @param {MeshesOptionalRequestOptions | undefined} options - Request options
   * @param {CallbackFunction<T>} done - Callback function
   * @returns {undefined} - Undefined when a callback is provided
   */
  patch<T = unknown, B = unknown>(
    path: string,
    body: B,
    options: MeshesOptionalRequestOptions | undefined,
    done: CallbackFunction<T>
  ): undefined;

  /**
   * Send a DELETE request to the Meshes API
   * @template T
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions} [options] - Request options
   * @returns {Promise<T>} - Request promise
   */
  delete<T = unknown>(
    path: string,
    options?: MeshesOptionalRequestOptions
  ): Promise<T>;

  /**
   * Send a DELETE request to the Meshes API (callback form)
   * @template T
   * @param {string} path - Request path
   * @param {MeshesOptionalRequestOptions | undefined} options - Request options
   * @param {CallbackFunction<T>} done - Callback function
   * @returns {undefined} - Undefined when a callback is provided
   */
  delete<T = unknown>(
    path: string,
    options: MeshesOptionalRequestOptions | undefined,
    done: CallbackFunction<T>
  ): undefined;
}

/**
 * Meshes API Error
 */
export declare class MeshesApiError extends Error {
  data?: any;

  constructor(message: string, data?: any);

  toJSON(includeStack?: boolean): {
    name: string;
    message: string;
    data?: any;
    stack?: any;
  };
}

declare const _default: typeof MeshesApiClient;
export default _default;
