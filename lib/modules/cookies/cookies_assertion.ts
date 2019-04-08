import * as assertUtils from '../../utils/assert_utils';
import BrowserCookies from './browser_cookies';
import Browser from '../../browser/browser';

/* eslint-disable max-params */
export default {
    async assert(browser: Browser, cookiesModule: BrowserCookies, name: string, expected?: string, msg?: string): Promise<void> {
        const value = await cookiesModule.get(name);
        if (expected === undefined) {
            if (value === undefined) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to exist.`;
                }
                return assertUtils.rejectAssertion("assert.cookies", msg);
            }
        } else if (value !== expected) {
            if (!msg) {
                msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
            }
            return assertUtils.rejectAssertion("assert.cookies", msg, value, expected);
        }
    },
    not(browser: Browser, cookiesModule: BrowserCookies, name: string, expected?: string, msg?: string): Promise<void> {
        if (!msg) {
            msg = expected === undefined ?
                `Expected cookie "${name}" to not exist.` :
                `Expected cookie "${name}" to not have value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            // return browser.assert.cookies(name, expected, "x");
            const b = browser as any; // TODO: avoid any
            return b.assert.cookies(name, expected, "x");
        }, "assert.not.cookies", msg);
    }
};
/* eslint-enable max-params */
