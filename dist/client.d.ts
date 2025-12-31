/**
 * Meshes API Client
 * @class
 */
export class MeshesApiClient {
    /**
     * Create the Meshes API Client.
     * @param {string} organizationId - Meshes Account Organization ID
     * @param {string} accessKey - API access key
     * @param {string} secretKey - API secret key
     * @param {MeshesOptions} options - Additional options
     * @constructor - Meshes API constructor
     */
    constructor(organizationId: string, accessKey: string, secretKey: string, options?: MeshesOptions);
    /**
     * API GET request
     * @template T
     * @param {string} path - Request path
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {import("./index.js").CallbackFunction<T> | undefined} done
     * @returns {Promise<T> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    get<T>(path: string, options?: MeshesOptionalRequestOptions, done?: import("./index.js").CallbackFunction<T> | undefined): Promise<T> | undefined;
    /**
     * API POST request
     * @template T
     * @template B
     * @param {string} path - Request path
     * @param {B} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {import("./index.js").CallbackFunction<T> | undefined} done
     * @returns {Promise<T> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    post<T, B>(path: string, body: B, options?: MeshesOptionalRequestOptions, done?: import("./index.js").CallbackFunction<T> | undefined): Promise<T> | undefined;
    /**
     * API PUT request
     * @template T
     * @template B
     * @param {string} path - Request path
     * @param {B} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {import("./index.js").CallbackFunction<T> | undefined} done
     * @returns {Promise<T> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    put<T, B>(path: string, body: B, options?: MeshesOptionalRequestOptions, done?: import("./index.js").CallbackFunction<T> | undefined): Promise<T> | undefined;
    /**
     * API PATCH request
     * @template T
     * @template B
     * @param {string} path - Request path
     * @param {B} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {import("./index.js").CallbackFunction<T> | undefined} done
     * @returns {Promise<T> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    patch<T, B>(path: string, body: B, options?: MeshesOptionalRequestOptions, done?: import("./index.js").CallbackFunction<T> | undefined): Promise<T> | undefined;
    /**
     * API DELETE request
     * @template T
     * @param {string} path - Request path
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {import("./index.js").CallbackFunction<T> | undefined} done
     * @returns {Promise<T> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    delete<T>(path: string, options?: MeshesOptionalRequestOptions, done?: import("./index.js").CallbackFunction<T> | undefined): Promise<T> | undefined;
    #private;
}
export default MeshesApiClient;
export { MeshesApiError };
export type Headers = import("./index.js").Headers;
export type MeshesOptions = import("./index.js").MeshesOptions;
export type MeshesApiMethod = import("./index.js").MeshesApiMethod;
export type MeshesRequestOptions = import("./index.js").MeshesRequestOptions;
export type MeshesOptionalRequestOptions = import("./index.js").MeshesOptionalRequestOptions;
export type MeshesRequestInit = {
    method: MeshesApiMethod;
    headers: Headers;
    body: string | null;
    signal?: AbortSignal;
};
import { MeshesApiError } from "./lib/errors.js";
