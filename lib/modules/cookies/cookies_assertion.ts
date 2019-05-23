import { invertify } from '../../utils/assert_utils';
import BrowserCookies from './browser_cookies';
import BrowserInterface from '../../browser/browser_interface';
import { AssertionError } from '../../errors';

export default {
    async assert(_browser: BrowserInterface, cookiesModule: BrowserCookies, name: string, expected?: string, msg?: string): Promise<void> {
        const cookie = await cookiesModule.get(name);
        if (expected === undefined) {
            if (cookie === undefined) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to exist.`;
                }
                throw new AssertionError("assert.cookies", msg);
            }
        } else {
            const value = cookie ? cookie.value : undefined;
            if (value !== expected) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
                }
                throw new AssertionError("assert.cookies", msg, value, expected);
            }
        }
    },
    not(browser: BrowserInterface, _cookiesModule: BrowserCookies, name: string, expected?: string, msg?: string): Promise<void> {
        if (!msg) {
            msg = expected === undefined ?
                `Expected cookie "${name}" to not exist.` :
                `Expected cookie "${name}" to not have value "${expected}".`;
        }
        return invertify(() => {
            return browser.assert.cookies(name, expected, "x");
        }, "assert.not.cookies", msg);
    }
};
