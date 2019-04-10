import * as utils from '../../utils/utils';
import * as assertUtils from '../../utils/assert_utils';
import { WendigoError, QueryError } from '../../errors';
import BrowserAssertions from '../browser_assertions';
import Browser from '../../browser/browser';
import { WendigoSelector } from '../../types';

export default class BrowserNotAssertions {
    protected _assertions: BrowserAssertions;
    protected _browser: Browser;

    constructor(assertions: BrowserAssertions, browser: Browser) {
        this._assertions = assertions;
        this._browser = browser;
    }

    public exists(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not exists.`;
        return assertUtils.invertify(() => {
            return this._assertions.exists(selector, "x");
        }, "assert.not.exists", msg);
    }

    public visible(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not be visible.`;
        return assertUtils.invertify(() => {
            return this._assertions.visible(selector, "x");
        }, "assert.not.visible", msg);
    }

    public tag(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not have "${expected}" tag.`;
        return assertUtils.invertify(() => {
            return this._assertions.tag(selector, expected, "x");
        }, "assert.not.tag", msg);
    }

    public text(selector: WendigoSelector, expected: string | RegExp | Array<string | RegExp>, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            return Promise.reject(new WendigoError("assert.not.text", `Missing expected text for assertion.`));
        }
        const processedExpected = utils.arrayfy(expected);

        return this._browser.text(selector).then((texts) => {
            for (const expectedText of processedExpected) {
                if (utils.matchTextList(texts, expectedText)) {
                    if (!msg) msg = `Expected element "${selector}" not to have text "${expectedText}".`;
                    return assertUtils.rejectAssertion("assert.not.text", msg);
                }
            }
            return Promise.resolve();
        });
    }

    public textContains(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not contain text "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.textContains(selector, expected, "x");
        }, "assert.not.textContains", msg);
    }

    public title(expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected page title not to be "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.title(expected, "x");
        }, "assert.not.title", msg);
    }

    public class(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.class(selector, expected, "x");
        }, "assert.not.class", msg);
    }

    public url(expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected url not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.url(expected, "x");
        }, "assert.not.url", msg);
    }

    public value(selector: WendigoSelector, expected: string | null, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.value(selector, expected, "x");
        }, "assert.not.value", msg);
    }

    public attribute(selector: WendigoSelector, attribute: string, expectedValue?: string, msg?: string): Promise<void> {
        const customMessage = Boolean(msg);
        if (!customMessage) {
            msg = `Expected element "${selector}" not to have attribute "${attribute}"`;
            if (expectedValue) msg = `${msg} with value "${expectedValue}"`;
        }
        return this._browser.query(selector).then((elementFound) => {
            if (elementFound === null) {
                if (!customMessage) {
                    msg = `${msg}, no element found.`;
                }
                return assertUtils.rejectAssertion("assert.not.attribute", msg as string);
            }
            if (!customMessage) msg = `${msg}.`;
            return assertUtils.invertify(() => {
                return this._assertions.attribute(selector, attribute, expectedValue, "x");
            }, "assert.not.attribute", msg as string);
        });
    }

    public style(selector: WendigoSelector, style: string, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.style(selector, style, expected, "x");
        }, "assert.not.style", msg);
    }

    public href(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        return this.attribute(selector, "href", expected, msg).catch((err: Error) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.not.href"));
        });
    }

    public innerHtml(selector: WendigoSelector, expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have inner html "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.innerHtml(selector, expected, "x");
        }, "assert.not.innerHtml", msg);
    }

    public selectedOptions(selector: WendigoSelector, expected: string | Array<string>, msg?: string): Promise<void> {
        if (!msg) {
            const parsedExpected = utils.arrayfy(expected);
            const expectedText = parsedExpected.join(", ");
            msg = `Expected element "${selector}" not to have options "${expectedText}" selected.`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.selectedOptions(selector, expected, "x");
        }, "assert.not.selectedOptions", msg);
    }

    public global(key: string, expected: any, msg?: string): Promise<void> {
        if (!msg) {
            if (expected === undefined) msg = `Expected "${key}" not to be defined as global variable.`;
            else msg = `Expected "${key}" not to be defined as global variable with value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.global(key, expected, "x");
        }, "assert.not.global", msg);
    }

    public async checked(selector: WendigoSelector, msg?: string): Promise<void> {
        let value;
        try {
            value = await this._browser.checked(selector);
        } catch (err) {
            throw new QueryError("assert.not.checked", `Element "${selector}" not found.`);
        }
        if (value !== false) {
            if (!msg) msg = `Expected element "${selector}" to not be checked.`;
            return assertUtils.rejectAssertion("assert.not.checked", msg, value, false);
        }
    }

    public disabled(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to be disabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.disabled(selector, "x");
        }, "assert.not.disabled", msg);
    }

    public enabled(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to be enabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.enabled(selector, "x");
        }, "assert.not.enabled", msg);
    }

    public focus(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to be unfocused.`;
        return assertUtils.invertify(() => {
            return this._assertions.focus(selector, "x");
        }, "assert.not.focus", msg);
    }

    public redirect(msg?: string): Promise<void> {
        if (!msg) msg = `Expected current url not to be a redirection.`;
        return assertUtils.invertify(() => {
            return this._assertions.redirect("x");
        }, "assert.not.redirect", msg);
    }

    public element(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected selector "${selector}" not to find any elements.`;
        return this._assertions.elements(selector, 0, msg).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.not.element"));
        });
    }
}
