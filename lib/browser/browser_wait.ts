import { EvaluateFn } from 'puppeteer';

import * as utils from '../utils/utils';
import DomElement from '../models/dom_element';
import { TimeoutError, WendigoError } from '../errors';
import BrowserNavigation from './browser_navigation';
import { CssSelector, WendigoSelector } from '../types';

export default abstract class BrowserWait extends BrowserNavigation {
    public wait(ms: number = 250): Promise<void> {
        this.failIfNotLoaded("wait");
        return utils.delay(ms);
    }

    public async waitFor(selector: CssSelector | EvaluateFn, timeout = 500, ...args: Array<any>): Promise<void> {
        this.failIfNotLoaded("waitFor");
        args = args.map((e) => {
            if (e instanceof DomElement) return e.element;
            else return e;
        });
        try {
            await this.page.waitFor(selector, {
                timeout: timeout,
                visible: true
            }, ...args);
        } catch (err) {
            let errMsg;
            if (typeof selector === 'function') errMsg = `Waiting for function to return true`;
            else errMsg = `Waiting for element "${selector}"`;
            throw new TimeoutError("waitFor", errMsg, timeout);
        }
    }

    public async waitUntilNotVisible(selector: WendigoSelector, timeout = 500): Promise<void> {
        this.failIfNotLoaded("waitUntilNotVisible");
        try {
            await this.waitFor((q) => {
                const element = WendigoUtils.queryElement(q);
                return !WendigoUtils.isVisible(element);
            }, timeout, selector);
        } catch (err) {
            throw new TimeoutError("waitUntilNotVisible", `Waiting for element "${selector}" to not be visible`, timeout);
        }
    }

    public async waitForUrl(url: string | RegExp, timeout: number = 500): Promise<void> {
        this.failIfNotLoaded("waitForUrl");
        if (!url) return Promise.reject(new WendigoError("waitForUrl", `Invalid parameter url.`));
        let parsedUrl: string | RegExp | { source: string, flags: string } = url;
        if (url instanceof RegExp) {
            parsedUrl = {
                source: url.source,
                flags: url.flags
            };
        }
        try {
            await this.waitFor((expectedUrl: string | { source: string, flags: string }) => {
                const currentUrl = window.location.href;
                if (currentUrl === "about:blank") return false;
                if (typeof expectedUrl !== 'string') {
                    const regex = new RegExp(expectedUrl.source, expectedUrl.flags);
                    return regex.test(currentUrl);
                } else {
                    return currentUrl === expectedUrl;
                }
            }, timeout, parsedUrl);
        } catch (err) {
            throw new TimeoutError("waitForUrl", `Waiting for url "${url}"`, timeout);
        }
    }

    // public waitForRequest(url: string, timeout: number = 500): Promise<void> {
    //     this.failIfNotLoaded("waitForRequest");
    //     const waitForPromise = this.waitForNextRequest(url, timeout);
    //
    //     const alreadyRequestsPromise = this.requests.filter.url(url).requests.then((requests) => {
    //         if (requests.length > 0) return Promise.resolve();
    //         else return Promise.reject();
    //     });
    //
    //     return utils.promiseOr([alreadyRequestsPromise, waitForPromise]).catch(() => {
    //         return Promise.reject(new TimeoutError("waitForRequest", `Waiting for request "${url}"`, timeout));
    //     });
    // }
    //
    // waitForResponse(url, timeout = 500) {
    //     this._failIfNotLoaded("waitForResponse");
    //     const waitForPromise = this.waitForNextResponse(url, timeout);
    //
    //     const alreadyResponsePromise = this.requests.filter.url(url).requests.then((requests) => {
    //         const responded = requests.filter((request) => {
    //             return Boolean(request.response());
    //         });
    //         if (responded.length > 0) return Promise.resolve();
    //         else return Promise.reject();
    //     });
    //
    //     return utils.promiseOr([alreadyResponsePromise, waitForPromise]).catch(() => {
    //         return Promise.reject(new TimeoutError("waitForResponse", `Waiting for response "${url}"`, timeout));
    //     });
    // }

    public async waitForNextRequest(url: string, timeout: number = 500): Promise<void> {
        this.failIfNotLoaded("waitForNextRequest");
        try {
            await this.page.waitForRequest(url, {
                timeout: timeout
            });
        } catch (err) {
            throw new TimeoutError("waitForNextRequest", `Waiting for request "${url}"`, timeout);
        }
    }

    public async waitForNextResponse(url: string, timeout: number = 500): Promise<void> {
        this.failIfNotLoaded("waitForNextResponse");
        try {
            await this.page.waitForResponse(url, {
                timeout: timeout
            });
        } catch (err) {
            throw new TimeoutError("waitForNextResponse", `Waiting for response "${url}"`, timeout);
        }
    }

    public async waitForNavigation(timeout: number = 500): Promise<void> {
        this.failIfNotLoaded("waitForNavigation");
        const t1 = new Date().getTime();
        try {
            await this.page.waitForNavigation({
                timeout: timeout
            });
            const t2 = new Date().getTime();
            const timeDiff = t2 - t1;
            let timeout2 = timeout - timeDiff;
            if (timeout2 < 10) timeout2 = 10; // just in case
            await this.waitFor(() => {
                const w = window as any;
                return Boolean(w.WendigoUtils);
            }, timeout2);
        } catch (err) {
            throw new TimeoutError("waitForNavigation", "", timeout);
        }
    }

    public async clickAndWaitForNavigation(selector: WendigoSelector, timeout: number = 500): Promise<number> {
        try {
            const result = await Promise.all([
                this.waitForNavigation(timeout),
                this.click(selector)
            ]);
            return result[1];
        } catch (err) {
            throw WendigoError.overrideFnName(err, "clickAndWaitForNavigation");
        }
    }

    public async waitForText(text: string, timeout: number = 500): Promise<void> {
        try {
            await this.waitFor((txt) => {
                const xpath = `//*[text()='${txt}']`; // NOTE: Duplicate of findByText
                return Boolean(WendigoUtils.xPathQuery(xpath).length > 0);
            }, timeout, text);
        } catch (err) {
            throw new TimeoutError("waitForText", `Waiting for text "${text}"`, timeout);
        }
    }

    public async waitAndClick(selector: CssSelector, timeout: number = 500): Promise<number> {
        try {
            await this.waitFor(selector, timeout);
            return await this.click(selector);
        } catch (err) {
            throw new TimeoutError("waitAndClick", "", timeout);
        }
    }

    public async waitUntilEnabled(selector: WendigoSelector, timeout: number = 500): Promise<void> {
        try {
            await this.waitFor((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return false;
                const value = element.getAttribute("disabled");
                return value === null;
            }, timeout, selector);
        } catch (err) {
            throw new TimeoutError("waitUntilEnabled", `Waiting for element "${selector}" to be enabled`, timeout);
        }
    }
}
