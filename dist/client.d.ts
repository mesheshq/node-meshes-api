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
     * @param {string} path - Request path
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    get(path: string, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<unknown> | undefined;
    /**
     * API POST request
     * @param {string} path - Request path
     * @param {unknown} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    post(path: string, body: unknown, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<unknown> | undefined;
    /**
     * API PUT request
     * @param {string} path - Request path
     * @param {unknown} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    put(path: string, body: unknown, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<unknown> | undefined;
    /**
     * API PATCH request
     * @param {string} path - Request path
     * @param {unknown} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    patch(path: string, body: unknown, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<unknown> | undefined;
    /**
     * API DELETE request
     * @param {string} path - Request path
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<unknown> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    delete(path: string, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<unknown> | undefined;
    #private;
}
export default MeshesApiClient;
export { MeshesApiError };
export type Headers = import("./index.js").Headers;
export type MeshesOptions = import("./index.js").MeshesOptions;
export type MeshesApiMethod = import("./index.js").MeshesApiMethod;
export type MeshesRequestOptions = import("./index.js").MeshesRequestOptions;
export type MeshesOptionalRequestOptions = import("./index.js").MeshesOptionalRequestOptions;
export type CallbackAny = import("./index.js").CallbackFunction<any>;
export type MeshesRequestInit = {
    method: string;
    headers: Headers;
    body: string | null;
    signal?: AbortSignal;
};
import { MeshesApiError } from "./lib/errors.js";
