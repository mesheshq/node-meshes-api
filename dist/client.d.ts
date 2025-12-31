/**
 * Meshes API Client
 * @class
 */
export class MeshesEventsClient {
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
     * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    get(path: string, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<any> | undefined;
    /**
     * API POST request
     * @param {string} path - Request path
     * @param {any} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    post(path: string, body: any, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<any> | undefined;
    /**
     * API PUT request
     * @param {string} path - Request path
     * @param {any} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    put(path: string, body: any, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<any> | undefined;
    /**
     * API PATCH request
     * @param {string} path - Request path
     * @param {any} body - Request body
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    patch(path: string, body: any, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<any> | undefined;
    /**
     * API DELETE request
     * @param {string} path - Request path
     * @param {MeshesOptionalRequestOptions} options - Request options
     * @param {CallbackAny | undefined} done - Callback function
     * @returns {Promise<any> | undefined} - Request promise or undefined if a callback is provided
     * @throws {MeshesApiError} - Invalid request
     */
    delete(path: string, options: MeshesOptionalRequestOptions | undefined, done: CallbackAny | undefined): Promise<any> | undefined;
    #private;
}
export default MeshesEventsClient;
export { MeshesApiError };
export type Headers = import("./index.js").Headers;
export type MeshesOptions = import("./index.js").MeshesOptions;
export type MeshesApiMethod = import("./index.js").MeshesApiMethod;
export type MeshesRequestOptions = import("./index.js").MeshesRequestOptions;
export type MeshesOptionalRequestOptions = import("./index.js").MeshesOptionalRequestOptions;
export type MeshesEventBody = import("./index.js").MeshesEventBody;
export type CreateEventResponseSingle = import("./index.js").CreateEventResponseSingle;
export type BulkCreateEventsResult = import("./index.js").BulkCreateEventsResult;
export type CallbackFunctionSingle = import("./index.js").CallbackFunction<CreateEventResponseSingle>;
export type CallbackFunctionBulk = import("./index.js").CallbackFunction<BulkCreateEventsResult>;
export type CallbackAny = import("./index.js").CallbackFunction<any>;
export type MeshesRequestInit = {
    method: string;
    headers: Headers;
    body: string | null;
    signal?: AbortSignal;
};
import { MeshesApiError } from "./lib/errors.js";
