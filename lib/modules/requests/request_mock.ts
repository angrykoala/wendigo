import EventEmitter from 'events';
import { URL } from 'url';
import { Request } from '../../puppeteer_wrapper/puppeteer_types';

import RequestFilter from './request_filter';
import { FatalError, AssertionError, TimeoutError } from '../../errors';
import * as utils from '../../utils/utils';
import { RequestBody, RequestMockResponseOptions, RequestMockOptions } from './types';

interface MockResponse {
    status?: number;
    headers?: { [s: string]: string };
    contentType?: string;
    body?: string;
}

interface RequestMockInterface {
    called: boolean;
    timesCalled: number;
    response: MockResponse;
    url: string | RegExp;
    immediate: boolean;
    auto: boolean;
    continue: boolean;
    method?: string;
    waitUntilCalled(timeout: number): Promise<void>;
    assert: {
        called(times?: number, msg?: string): Promise<void>
        postBody(expected: RequestBody | RegExp, msg?: string): Promise<void>
    };
}

class RequestMockAssertions {
    private _mock: RequestMock;
    constructor(mock: RequestMock) {
        this._mock = mock;
    }

    public called(times?: number, msg?: string): Promise<void> {
        if (typeof times === 'number') {
            const timesCalled = this._mock.timesCalled;
            if (times !== timesCalled) {
                if (!msg) msg = `Mock of ${this._mock.url} not called ${times} times.`;
                return Promise.reject(new AssertionError("assert.called", msg, timesCalled, times));
            }
        } else if (!this._mock.called) {
            if (!msg) msg = `Mock of ${this._mock.url} not called.`;
            return Promise.reject(new AssertionError("assert.called", msg));
        }
        return Promise.resolve();
    }

    public async postBody(expected: RequestBody | RegExp, msg?: string): Promise<void> {
        const filter = new RequestFilter(Promise.resolve(this._mock.requestsReceived)).postBody(expected);
        const filteredRequests = await filter.requests;
        if (filteredRequests.length === 0) {
            if (!msg) {
                msg = `Expected mock to be called with body "${utils.stringify(expected)}".`;
            }
            throw new AssertionError("assert.postBody", msg);
        }
    }
}

export default class RequestMock implements RequestMockInterface {
    public readonly method?: string;
    public readonly response: MockResponse;
    public readonly auto: boolean;
    public readonly continue: boolean;
    public readonly url: string | RegExp;
    public readonly assert: RequestMockAssertions;
    public readonly queryString?: { [s: string]: string; };
    public requestsReceived: Array<Request> = [];

    private _events: EventEmitter;
    private _redirectTo?: URL;
    private _delay: number;

    constructor(url: string | RegExp, options: RequestMockOptions) {
        this.url = this._parseUrl(url);
        this.response = this._processResponse(options);
        this._delay = options.delay || 0;
        this.method = options.method;
        if (options.queryString !== undefined) this.queryString = utils.parseQueryString(options.queryString);
        else this.queryString = this._parseUrlQueryString(url);
        this.auto = options.auto !== false;
        this.continue = options.continue === true;
        this._events = new EventEmitter();
        this._redirectTo = options.redirectTo ? new URL(options.redirectTo) : undefined;
        this.assert = new RequestMockAssertions(this);
    }

    get called(): boolean {
        return this.timesCalled > 0;
    }

    get timesCalled(): number {
        return this.requestsReceived.length;
    }

    get immediate(): boolean {
        return this._delay === 0;
    }

    public trigger(response: RequestMockResponseOptions): void {
        if (this.auto) throw new FatalError("trigger", `Cannot trigger auto request mock.`);
        this._events.emit("respond", response);
    }

    public async waitUntilCalled(timeout: number = 500): Promise<void> {
        if (!this.called) await new Promise((resolve, reject) => {
            let rejected = false;
            const tid = setTimeout(() => {
                rejected = true;
                reject(new TimeoutError("waitUntilCalled", `Wait until mock of "${this.url}" is called`, timeout));
            }, timeout);
            this._events.once("on-request", () => {
                if (!rejected) {
                    clearTimeout(tid);
                    resolve();
                }
            });
        });
        await utils.delay(20); // Give time to the browser to handle the response
    }

    public async onRequest(request: Request): Promise<void> {
        this.requestsReceived.push(request);

        if (this.auto && this.immediate) {
            return this._respondRequest(request);
        } else if (this.auto) {
            await utils.delay(this._delay);
            return this._respondRequest(request);
        } else {
            this._onTrigger((response) => {
                return this._respondRequest(request, response);
            });
        }
    }

    private async _respondRequest(request: Request, optionalResponse?: RequestMockResponseOptions): Promise<void> {
        let response = this.response;
        if (optionalResponse) {
            response = this._processResponse(optionalResponse);
        }

        if (this.continue) {
            await request.continue();
        } else if (this._redirectTo) {
            const qs = this._getUrlQuerystring(request.url());
            await request.continue({
                url: `${this._redirectTo.origin}${this._redirectTo.pathname}${qs}`
            });
        } else await request.respond(response);
        this._events.emit("on-request");
    }

    private _onTrigger(cb: (r: RequestMockResponseOptions) => Promise<void>): void {
        this._events.once("respond", cb);
    }

    private _getUrlQuerystring(rawUrl: string): string {
        const url = new URL(rawUrl);
        const qs = url.searchParams.toString();
        if (qs) return `?${qs}`;
        else return "";
    }

    private _processResponse(options: RequestMockOptions): MockResponse {
        const body = utils.stringify(options.body) || undefined;
        return {
            status: options.status,
            headers: options.headers,
            contentType: options.contentType,
            body: body
        };
    }

    private _parseUrlQueryString(url: string | RegExp): { [s: string]: string; } | undefined {
        if (url instanceof RegExp) return undefined;
        else {
            const parsedUrl = new URL(url);
            if (parsedUrl.search) {
                return utils.parseQueryString(parsedUrl.search);
            } else return undefined;
        }
    }

    private _parseUrl(url: string | RegExp): string | RegExp {
        if (url instanceof RegExp) {
            return url;
        } else {
            const parsedUrl = new URL(url);
            return `${parsedUrl.origin}${parsedUrl.pathname}`;
        }
    }
}
