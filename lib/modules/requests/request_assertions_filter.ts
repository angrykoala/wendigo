import { AssertionError } from '../../errors';
import { stringify } from '../../utils/utils';
import RequestFilter from './request_filter';
import { ExpectedHeaders } from './types';
import { ResourceType } from 'puppeteer';

type PromiseExecutor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;

export default class RequestAssertionsFilter extends Promise<RequestAssertionsFilter> {
    private _requestFilter: RequestFilter;
    constructor(executor: PromiseExecutor<RequestAssertionsFilter>, requestFilter: RequestFilter) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });

        this._requestFilter = requestFilter;
    }

    public url(expected: string | RegExp, msg?: string): RequestAssertionsFilter {
        const urlFilter = this._requestFilter.url(expected);
        if (!msg) msg = `Expected request with url "${expected}" to exist.`;
        return this._assertFilter("assert.requests.url", urlFilter, msg);
    }

    public method(expected: string | RegExp, msg?: string): RequestAssertionsFilter {
        const methodFilter = this._requestFilter.method(expected);
        if (!msg) msg = `Expected request with method "${expected}" to exist.`;
        return this._assertFilter("assert.requests.method", methodFilter, msg);
    }

    public status(expected: number, msg?: string): RequestAssertionsFilter {
        const statusFilter = this._requestFilter.status(expected);
        if (!msg) msg = `Expected request with status "${expected}" to exist.`;
        return this._assertFilter("assert.requests.status", statusFilter, msg);
    }

    public responseHeaders(expected: ExpectedHeaders, msg?: string): RequestAssertionsFilter {
        const responseHeadersFilter = this._requestFilter.responseHeaders(expected);
        if (!msg) {
            const keys = Object.keys(expected);
            const expectedText = keys.map((k) => {
                return `${k}: ${expected[k]}`;
            }).join(", ");
            msg = `Expected response with headers "${expectedText}" to exist.`;
        }
        return this._assertFilter("assert.requests.responseHeaders", responseHeadersFilter, msg);
    }

    public ok(expected = true, msg?: string): RequestAssertionsFilter {
        const okFilter = this._requestFilter.ok(expected);
        if (!msg) msg = `Expected ${expected ? "" : "not"} ok request to exist.`;
        return this._assertFilter("assert.requests.ok", okFilter, msg);
    }

    public postBody(expected: string | object | RegExp, msg?: string): RequestAssertionsFilter {
        const bodyFilter = this._requestFilter.postBody(expected);
        if (!msg) {
            const expectedString = stringify(expected);
            msg = `Expected request with body "${expectedString}" to exist.`;
        }
        return this._assertFilter("assert.requests.postBody", bodyFilter, msg);
    }

    public responseBody(expected: string | object | RegExp, msg?: string): RequestAssertionsFilter {
        const responseBodyFilter = this._requestFilter.responseBody(expected);
        if (!msg) {
            const expectedString = stringify(expected);
            msg = `Expected request with response body "${expectedString}" to exist.`;
        }
        return this._assertFilter("assert.requests.responseBody", responseBodyFilter, msg);
    }

    public pending(msg?: string): RequestAssertionsFilter {
        const responseBodyFilter = this._requestFilter.pending();
        if (!msg) msg = `Expected pending request to exist.`;

        return this._assertFilter("assert.requests.pending", responseBodyFilter, msg);
    }

    public resourceType(expected: ResourceType, msg?: string): RequestAssertionsFilter {
        const responseBodyFilter = this._requestFilter.resourceType(expected);
        if (!msg) msg = `Expected request with resourceType "${expected}" to exist.`;

        return this._assertFilter("assert.requests.resourceType", responseBodyFilter, msg);
    }

    public exactly(expected: number, msg?: string): RequestAssertionsFilter {
        return new RequestAssertionsFilter((resolve, reject) => {
            this.then(() => {
                return this._assertNumber("assert.requests.exactly", expected, msg, resolve, reject);
            }).catch(() => {
                // Empty Catch
            });
            this.catch((err) => {
                if (err instanceof AssertionError) {
                    return this._assertNumber("assert.requests.exactly", expected, msg, resolve, reject);
                } else return reject(err);
            });
        }, this._requestFilter);
    }

    private _assertFilter(fnName: string, filter: RequestFilter, msg: string): RequestAssertionsFilter {
        return new RequestAssertionsFilter((resolve, reject) => {
            return this.then(async () => {
                const reqs = await filter.requests;
                if (reqs.length > 0) resolve();
                else {
                    const err = new AssertionError(fnName, msg);
                    reject(err);
                }
            }).catch((err) => {
                reject(err);
            });
        }, filter);
    }

    private async _assertNumber(fnName: string, expected: number, msg: string | undefined, resolve: () => void, reject: (e: Error) => void): Promise<void> {
        const reqs = await this._requestFilter.requests;
        const requestsNumber = reqs.length;
        if (!msg) msg = `Expected exactly ${expected} requests, ${requestsNumber} found.`;
        if (requestsNumber === expected) return resolve();
        else {
            const err = new AssertionError(fnName, msg);
            return reject(err);
        }
    }
}
