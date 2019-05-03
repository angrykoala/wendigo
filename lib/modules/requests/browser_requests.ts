import WendigoModule from '../wendigo_module';
import { OpenSettings } from '../../types';

import RequestFilter from './request_filter';
import RequestMocker from './request_mocker';
import Browser from '../../browser/browser';
import RequestMock from './request_mock';
import { Request } from 'puppeteer';
import { RequestMockOptions } from './types';
import { TimeoutError } from '../../errors';
import { promiseOr } from '../../utils/utils';

export default class BrowserRequests extends WendigoModule {
    private _requestMocker: RequestMocker;
    private _requests: Array<Request>;
    private _interceptorReady: boolean;

    constructor(browser: Browser) {
        super(browser);
        this._requestMocker = new RequestMocker();
        this._requests = [];
        this._interceptorReady = false;
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

    public async waitForNextRequest(url: string, timeout: number = 500): Promise<void> {
        try {
            await this._browser.page.waitForRequest(url, {
                timeout: timeout
            });
        } catch (err) {
            throw new TimeoutError("waitForNextRequest", `Waiting for request "${url}"`, timeout);
        }
    }

    public async waitForNextResponse(url: string, timeout: number = 500): Promise<void> {
        try {
            await this._browser.page.waitForResponse(url, {
                timeout: timeout
            });
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

    protected _beforeOpen(_options: OpenSettings): Promise<void> {
        this.clearRequests();
        if (this._interceptorReady) return Promise.resolve();
        return this._startRequestInterceptor();
    }

    protected _beforeClose(): Promise<void> {
        this.clearMocks();
        this.clearRequests();
        return Promise.resolve();
    }

    protected async _startRequestInterceptor(): Promise<void> {
        this._interceptorReady = true;
        await this._browser.page.setRequestInterception(true);
        this._browser.page.on('request', request => {
            this._requests.push(request);
            const mock = this._requestMocker.getMockedResponse(request);
            if (mock) {
                return mock.onRequest(request);
            } else {
                return request.continue();
            }
        });
    }
}
