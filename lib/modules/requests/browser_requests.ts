import WendigoModule from '../wendigo_module';
import { OpenSettings, FinalBrowserSettings } from '../../types';

import RequestFilter from './request_filter';
import RequestMocker from './request_mocker';
import Browser from '../../browser/browser';
import RequestMock from './request_mock';
import { Request, Response } from '../../puppeteer_wrapper/puppeteer_types';
import { RequestMockOptions } from './types';
import { TimeoutError } from '../../models/errors';
import { promiseOr, matchText, isNumber } from '../../utils/utils';

export default class BrowserRequests extends WendigoModule {
    private _requestMocker: RequestMocker;
    private _requests: Array<Request>;
    private _interceptorReady: boolean;
    private _interceptorCallback?: (req: Request) => Promise<void>;
    private _responseInterceptorCallback?: (res: Response) => Promise<void>;
    private _settings: FinalBrowserSettings;

    constructor(browser: Browser, settings: FinalBrowserSettings) {
        super(browser);
        this._requestMocker = new RequestMocker();
        this._requests = [];
        this._interceptorReady = false;
        this._settings = settings;
        this.clearRequests();
    }

    public get filter(): RequestFilter {
        return new RequestFilter(Promise.resolve(this._requests));
    }

    public all(): Array<Request> {
        return this._requests;
    }

    public getAllMocks(): Array<RequestMock> {
        return this._requestMocker.getAllMocks();
    }

    public mock(url: string | RegExp, options: RequestMockOptions): RequestMock {
        return this._requestMocker.mockRequest(url, options);
    }

    public removeMock(url: string, options: RequestMockOptions): void {
        this._requestMocker.removeMock(url, options);
    }

    public clearRequests(): void {
        this._requests = [];
    }

    public clearMocks(): void {
        this._requestMocker.clear();
    }

    public setHeaders(headers: Record<string, string>): Promise<void> {
        return this._browser._headerHelper.setExtraHeaders(headers);
    }

    public async waitForNextRequest(url: string | RegExp, timeout?: number): Promise<void> {
        timeout = this._getTimeout(timeout);
        try {
            await this._waitForRequestEvent("request", url, timeout);
        } catch (err) {
            throw new TimeoutError("waitForNextRequest", `Waiting for request "${url}"`, timeout);
        }
    }

    public async waitForNextResponse(url: string | RegExp, timeout?: number): Promise<void> {
        timeout = this._getTimeout(timeout);
        try {
            await this._waitForRequestEvent("response", url, timeout);
        } catch (err) {
            throw new TimeoutError("waitForNextResponse", `Waiting for response "${url}"`, timeout);
        }
    }

    public async waitForRequest(url: string, timeout: number = 500): Promise<void> {
        const waitForPromise = this.waitForNextRequest(url, timeout);

        const alreadyRequestsPromise = this.filter.url(url).requests.then((requests) => {
            if (requests.length > 0) return Promise.resolve();
            else return Promise.reject();
        });

        try {
            await promiseOr([alreadyRequestsPromise, waitForPromise]);
        } catch (err) {
            throw new TimeoutError("waitForRequest", `Waiting for request "${url}"`, timeout);
        }
    }

    public async waitForResponse(url: string, timeout = 500): Promise<void> {
        const waitForPromise = this.waitForNextResponse(url, timeout);

        const alreadyResponsePromise = this.filter.url(url).requests.then((requests) => {
            const responded = requests.filter((request) => {
                return Boolean(request.response());
            });
            if (responded.length > 0) return Promise.resolve();
            else return Promise.reject();
        });

        try {
            await promiseOr([alreadyResponsePromise, waitForPromise]);
        } catch (err) {
            throw new TimeoutError("waitForResponse", `Waiting for response "${url}"`, timeout);
        }
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        this.clearRequests();
        if (this._interceptorReady) return Promise.resolve();
        await this._startRequestInterceptor();
        if (this._settings.logRequests) await this._startResponseLogInterceptor();
        if (options.headers) await this.setHeaders(options.headers);
    }

    protected _beforeClose(): Promise<void> {
        this.clearMocks();
        this.clearRequests();
        this._closeRequestInterceptor();
        return Promise.resolve();
    }

    private async _startRequestInterceptor(): Promise<void> {
        this._interceptorReady = true;
        await this._page.setRequestInterception(true);

        this._interceptorCallback = (request: Request) => {
            this._requests.push(request);
            const mock = this._requestMocker.getMockedResponse(request);
            if (mock) {
                return mock.onRequest(request);
            } else {
                return request.continue();
            }
        };

        this._page.on('request', this._interceptorCallback);
    }

    private async _startResponseLogInterceptor(): Promise<void> {
        this._responseInterceptorCallback = async (response: Response) => {
            const request = response.request();
            if (this._settings.logRequests) {
                console.log(`[${new Date().toISOString()}] ${request.method()} ${request.url()} ${response.status()}`);
            }
        };
        this._page.on('response', this._responseInterceptorCallback);

    }

    private _closeRequestInterceptor(): void {
        if (this._interceptorCallback) {
            this._page.off('request', this._interceptorCallback);
            this._interceptorCallback = undefined;
        }
        if (this._responseInterceptorCallback) {
            this._page.off('response', this._responseInterceptorCallback);
            this._responseInterceptorCallback = undefined;
        }
    }

    private _waitForRequestEvent(event: "response" | "request", url: string | RegExp, timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForEventCallback = async (response: Response | Request) => {
                const currentUrl = new URL(response.url());
                const match = matchText(`${currentUrl.origin}${currentUrl.pathname}`, url);
                if (match) {
                    this._page.off(event, waitForEventCallback);
                    resolve();
                }
            };

            setTimeout(() => {
                this._page.off(event, waitForEventCallback);
                reject();
            }, timeout);

            this._page.on(event, waitForEventCallback);
        });
    }

    private _getTimeout(timeout?: number): number {
        if (isNumber(timeout)) return timeout;
        else return this._settings.defaultTimeout;
    }
}
