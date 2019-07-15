import EventEmitter from 'events';
import { URL } from 'url';
import { Request } from '../../browser/puppeteer_wrapper/puppeteer_types';

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
    method?: string;
    waitUntilCalled(timeout: number): Promise<void>;
    assert: {
        called(times?: number, msg?: string): Promise<void>
        postBody(expected: RequestBody | RegExp, msg?: string): Promise<void>
    };
}

class RequestMockAssertions {
    private mock: RequestMock;
    constructor(mock: RequestMock) {
        this.mock = mock;
    }

    public called(times?: number, msg?: string): Promise<void> {
        if (typeof times === 'number') {
            const timesCalled = this.mock.timesCalled;
            if (times !== timesCalled) {
                if (!msg) msg = `Mock of ${this.mock.url} not called ${times} times.`;
                return Promise.reject(new AssertionError("assert.called", msg, timesCalled, times));
            }
        } else if (!this.mock.called) {
            if (!msg) msg = `Mock of ${this.mock.url} not called.`;
            return Promise.reject(new AssertionError("assert.called", msg));
        }
        return Promise.resolve();
    }

    public async postBody(expected: RequestBody | RegExp, msg?: string): Promise<void> {
        const filter = new RequestFilter(Promise.resolve(this.mock.requestsReceived)).postBody(expected);
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
    public readonly url: string | RegExp;
    public readonly assert: RequestMockAssertions;
    public readonly queryString?: { [s: string]: string; };
    public requestsReceived: Array<Request> = [];

    private events: EventEmitter;
    private redirectTo?: URL;
    private delay: number;

    constructor(url: string | RegExp, options: RequestMockOptions) {
        this.url = this.parseUrl(url);
        this.response = this.processResponse(options);
        this.delay = options.delay || 0;
        this.method = options.method;
        if (options.queryString !== undefined) this.queryString = utils.parseQueryString(options.queryString);
        else this.queryString = this.parseUrlQueryString(url);
        this.auto = options.auto !== false;
        this.events = new EventEmitter();
        this.redirectTo = options.redirectTo ? new URL(options.redirectTo) : undefined;
        this.assert = new RequestMockAssertions(this);
    }

    get called(): boolean {
        return this.timesCalled > 0;
    }

    get timesCalled(): number {
        return this.requestsReceived.length;
    }

    get immediate(): boolean {
        return this.delay === 0;
    }

    public trigger(response: RequestMockResponseOptions): void {
        if (this.auto) throw new FatalError("trigger", `Cannot trigger auto request mock.`);
        this.events.emit("respond", response);
    }

    public async waitUntilCalled(timeout: number = 500): Promise<void> {
        if (!this.called) await new Promise((resolve, reject) => {
            let rejected = false;
            const tid = setTimeout(() => {
                rejected = true;
                reject(new TimeoutError("waitUntilCalled", `Wait until mock of "${this.url}" is called`, timeout));
            }, timeout);
            this.events.once("on-request", () => {
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
            return this.respondRequest(request);
        } else if (this.auto) {
            await utils.delay(this.delay);
            return this.respondRequest(request);
        } else {
            this.onTrigger((response) => {
                return this.respondRequest(request, response);
            });
        }
    }

    private async respondRequest(request: Request, optionalResponse?: RequestMockResponseOptions): Promise<void> {
        let response = this.response;
        if (optionalResponse) {
            response = this.processResponse(optionalResponse);
        }
        if (this.redirectTo) {
            const url = new URL(request.url());
            let qs = url.searchParams.toString();
            if (qs) qs = `?${qs}`;
            await request.continue({
                url: `${this.redirectTo.origin}${this.redirectTo.pathname}${qs || ""}`
            });
        } else await request.respond(response);
        this.events.emit("on-request");
    }

    private onTrigger(cb: (r: RequestMockResponseOptions) => Promise<void>): void {
        this.events.once("respond", cb);
    }

    private processResponse(options: RequestMockOptions): MockResponse {
        const body = utils.stringify(options.body) || undefined;
        return {
            status: options.status,
            headers: options.headers,
            contentType: options.contentType,
            body: body
        };
    }

    private parseUrlQueryString(url: string | RegExp): { [s: string]: string; } | undefined {
        if (url instanceof RegExp) return undefined;
        else {
            const parsedUrl = new URL(url);
            if (parsedUrl.search) {
                return utils.parseQueryString(parsedUrl.search);
            } else return undefined;
        }
    }

    private parseUrl(url: string | RegExp): string | RegExp {
        if (url instanceof RegExp) {
            return url;
        } else {
            const parsedUrl = new URL(url);
            return `${parsedUrl.origin}${parsedUrl.pathname}`;
        }
    }
}
