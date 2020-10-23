import isRegExp from 'lodash.isregexp';
import { URL } from 'url';
import { parseQueryString, compareObjects, matchText } from '../../utils/utils';
import RequestMock from './request_mock';
import { Request } from '../../puppeteer_wrapper/puppeteer_types';
import { RequestMockOptions } from './types';

export default class RequestMocker {
    private _mockedRequests: Array<RequestMock>;

    constructor() {
        this._mockedRequests = [];
    }

    public getAllMocks(): Array<RequestMock> {
        return Array.from(this._mockedRequests);
    }

    public getMockedResponse(request: Request): RequestMock | null {
        const url = new URL(request.url());
        const method = request.method();
        return this._getMock(`${url.origin}${url.pathname}`, {
            method: method,
            queryString: url.search ? parseQueryString(url) : undefined
        });
    }

    public mockRequest(url: string | RegExp, options: RequestMockOptions = {}): RequestMock {
        const mockOptions = Object.assign({}, options);
        if (typeof url === 'string') this._removeExactMocks(url, mockOptions); // Removes exact duplicates to avoid redundancy
        const mock = new RequestMock(url, mockOptions);
        this._mockedRequests.push(mock);
        return mock;
    }

    public removeMock(url: string, options: RequestMockOptions = {}): void {
        this._mockedRequests = this._mockedRequests.filter((m) => {
            return !(this._matchUrl(url, m.url) && this._matchOptions(m, options));
        });
    }

    public clear(): void {
        this._mockedRequests = [];
    }

    private _removeExactMocks(url: string, options: RequestMockOptions): void {
        const method = options.method;
        const queryString = options.queryString;
        this._mockedRequests = this._mockedRequests.filter((m) => {
            const same = m.url === url && method === m.method && this._sameQs(queryString, m.queryString);
            return !same;
        });
    }

    private _sameQs(q1: string | { [s: string]: string } | undefined, q2: string | { [s: string]: string } | undefined): boolean {
        if (q1 === q2) return true;
        if (!q1 || !q2) return false;
        const parsedQ1 = parseQueryString(q1);
        const parsedQ2 = parseQueryString(q2);

        return compareObjects(parsedQ1, parsedQ2);
    }

    private _getMock(url: string, options: RequestMockOptions): RequestMock | null {
        let matchedMock = null;
        for (const m of this._mockedRequests) {
            if (this._matchMock(m, url, options) && this._hasHigherPriority(m, matchedMock)) {
                matchedMock = m;
            }
        }
        return matchedMock;
    }

    private _matchMock(mock: RequestMock, url: string, options: RequestMockOptions): boolean {
        return this._matchUrl(url, mock.url) && this._matchOptions(options, mock);
    }

    private _matchOptions(options: RequestMockOptions | RequestMock, expected: RequestMockOptions | RequestMock): boolean {
        if (expected.method && options.method !== expected.method) return false;
        if (expected.queryString !== undefined && !this._sameQs(options.queryString, expected.queryString)) return false;
        return true;
    }

    private _matchUrl(url: string, expected: string | RegExp): boolean {
        return matchText(url, expected);
    }

    // Priority is: Method > URL > QueryString
    private _hasHigherPriority(m1: RequestMock, m2: RequestMock | null): boolean {
        if (!m2) return true;
        const existsPriority = this._checkElementPriority(m1, m2);
        if (existsPriority !== null) return existsPriority;
        const methodPriority = this._checkElementPriority(m1.method, m2.method);
        if (methodPriority !== null) return methodPriority;
        const urlPriority = this._checkElementPriority(!isRegExp(m1.url), !isRegExp(m2.url));
        if (urlPriority !== null) return urlPriority;
        return Boolean(this._checkElementPriority(m1.queryString, m2.queryString));
    }

    private _checkElementPriority(e1: any, e2: any): boolean | null {
        e1 = Boolean(e1);
        e2 = Boolean(e2);
        if (e1 && !e2) return true;
        if (!e1 && e2) return false;
        else return null;
    }
}
