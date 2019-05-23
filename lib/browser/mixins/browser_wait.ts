import { EvaluateFn } from 'puppeteer';

import BrowserNavigation from './browser_navigation';

import * as utils from '../../utils/utils';
import DomElement from '../../models/dom_element';
import { TimeoutError, WendigoError } from '../../errors';
import { WendigoSelector } from '../../types';
import { createFindTextXPath } from '../../utils/utils';

export default abstract class BrowserWait extends BrowserNavigation {
    public wait(ms: number = 250): Promise<void> {
        this._failIfNotLoaded("wait");
        return utils.delay(ms);
    }

    public async waitFor(selector: string | EvaluateFn, timeout = 500, ...args: Array<any>): Promise<void> {
        this._failIfNotLoaded("waitFor");
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
        this._failIfNotLoaded("waitUntilNotVisible");
        try {
            await this.waitFor((q: string | HTMLElement) => {
                const element = WendigoUtils.queryElement(q);
                return !WendigoUtils.isVisible(element);
            }, timeout, selector);
        } catch (err) {
            throw new TimeoutError("waitUntilNotVisible", `Waiting for element "${selector}" to not be visible`, timeout);
        }
    }

    public async waitForUrl(url: string | RegExp, timeout: number = 500): Promise<void> {
        this._failIfNotLoaded("waitForUrl");
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

    public async waitForNavigation(timeout: number = 500): Promise<void> {
        this._failIfNotLoaded("waitForNavigation");
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
            const xPath = createFindTextXPath(text);
            await this.waitFor((xp: string) => {
                return Boolean(WendigoUtils.xPathQuery(xp).length > 0);
            }, timeout, xPath);
        } catch (err) {
            throw new TimeoutError("waitForText", `Waiting for text "${text}"`, timeout);
        }
    }

    public async waitAndClick(selector: string, timeout: number = 500): Promise<number> {
        try {
            await this.waitFor(selector, timeout);
            return await this.click(selector);
        } catch (err) {
            throw new TimeoutError("waitAndClick", "", timeout);
        }
    }

    public async waitUntilEnabled(selector: WendigoSelector, timeout: number = 500): Promise<void> {
        try {
            await this.waitFor((q: string | HTMLElement) => {
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
