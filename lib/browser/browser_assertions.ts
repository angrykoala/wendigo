import Browser from './browser';

// Assertions
import AssertionsCore from './assertions/assertions_core';
import BrowserNotAssertions from './assertions/browser_not_assertions';

import BrowserLocalStorageAssertions from '../modules/local_storage/local_storage_assertions';
import CookiesAssertions from '../modules/cookies/cookies_assertion';
import ConsoleAssertion from '../modules/console/console_assertion';
import WebWorkerAssertion from '../modules/webworkers/webworkers_assertions';

import RequestAssertionsFilter from '../modules/requests/request_assertions_filter';
import { ConsoleFilter } from '../modules/console/types';

export default class BrowserAssertions extends AssertionsCore {
    public readonly not: NotAssertions;
    public readonly localStorage: BrowserLocalStorageAssertions;

    constructor(browser: Browser) {
        super(browser);
        this.not = new NotAssertions(this, browser);
        this.localStorage = new BrowserLocalStorageAssertions(this._browser.localStorage);
    }

    public get requests(): RequestAssertionsFilter {
        const requests = this._browser.requests.filter;
        return new RequestAssertionsFilter((r) => {
            r();
        }, requests);
    }

    public console(filterOptions: ConsoleFilter, count?: number, msg?: string): Promise<void> {
        return ConsoleAssertion(this._browser.console, filterOptions, count, msg);
    }

    public cookies(name: string, expected?: string, msg?: string): Promise<void> {
        return CookiesAssertions.assert(this._browser, this._browser.cookies, name, expected, msg);
    }

    public webworkers(options: { url?: string, count?: number }, msg?: string): Promise<void> {
        return WebWorkerAssertion(this._browser.webworkers, options, msg);
    }
}

class NotAssertions extends BrowserNotAssertions {
    public cookies(name: string, expected?: string, msg?: string): Promise<void> {
        return CookiesAssertions.not(this._browser, this._browser.cookies, name, expected, msg);
    }

}
