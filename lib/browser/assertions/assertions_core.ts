import * as utils from '../../utils/utils';
import * as elementsAssertionUtils from './assert_elements';
import * as assertUtils from '../../utils/assert_utils';

import { QueryError, FatalError, WendigoError, AssertionError } from '../../errors';
import { WendigoSelector } from '../../types';
import BrowserInterface from '../browser_interface';
import OverrideError from '../../decorators/override_error';

export default class AssertionsCore {
    protected _browser: BrowserInterface;

    constructor(browser: BrowserInterface) {
        this._browser = browser;
    }

    @OverrideError("assert")
    public async exists(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to exists`;
        let element;
        element = await this._browser.query(selector);
        if (!element) throw new AssertionError("assert.exists", msg);
    }

    public async visible(selector: WendigoSelector, msg?: string): Promise<void> {
        let visible;
        try {
            visible = await this._browser.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                if (elements.length === 0) throw new WendigoError("assert.visible", "Element not Found");
                for (const e of elements) {
                    if (WendigoUtils.isVisible(e)) return true;
                }
                return false;
            }, selector);
        } catch (err) {
            throw new AssertionError("assert.visible", `Selector "${selector}" doesn't match any elements.`);
        }
        if (!visible) {
            if (!msg) msg = `Expected element "${selector}" to be visible.`;
            throw new AssertionError("assert.visible", msg);
        }
    }

    public async tag(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!expected) {
            return Promise.reject(new WendigoError("assert.tag", `Missing expected tag for assertion.`));
        }
        const tagsFound = await this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const results = [];
            for (const e of elements) {
                results.push(e.tagName.toLowerCase());
            }
            return results;
        }, selector);
        for (const tag of tagsFound) {
            if (tag === expected) return Promise.resolve();
        }
        if (!msg) {
            msg = `No element with tag "${expected}" found.`;
        }
        throw new AssertionError("assert.tag", msg);
    }

    public async text(selector: WendigoSelector, expected: string | RegExp | Array<string | RegExp>, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            throw new WendigoError("assert.text", `Missing expected text for assertion.`);
        }
        const processedExpected = utils.arrayfy(expected);
        const texts = await this._browser.text(selector);
        for (const expectedText of processedExpected) {
            if (!utils.matchTextList(texts, expectedText)) {
                if (!msg) {
                    const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                    msg = `Expected element "${selector}" to have text "${expectedText}", ${foundText} found.`;
                }
                throw new AssertionError("assert.text", msg);
            }
        }
    }

    public async textContains(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            throw new WendigoError("assert.textContains", `Missing expected text for assertion.`);
        }

        const processedExpected = utils.arrayfy(expected);
        const texts = await this._browser.text(selector);

        for (const expectedText of processedExpected) {
            if (!utils.matchTextContainingList(texts, expectedText)) {
                if (!msg) {
                    const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                    msg = `Expected element "${selector}" to contain text "${expectedText}", ${foundText} found.`;
                }
                throw new AssertionError("assert.textContains", msg);
            }
        }
    }

    public async title(expected: string | RegExp, msg?: string): Promise<void> {
        const title = await this._browser.title();
        const foundTitle = title ? `"${title}"` : "no title";
        if (!utils.matchText(title, expected)) {
            if (!msg) msg = `Expected page title to be "${expected}", ${foundTitle} found.`;
            throw new AssertionError("assert.title", msg);
        }
    }

    public async class(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        let classes;
        try {
            classes = await this._browser.class(selector);
        } catch (err) {
            return Promise.reject(new QueryError("assert.class", `Selector "${selector}" doesn't match any elements.`));
        }
        if (!classes.includes(expected)) {
            if (!msg) {
                const foundClasses = classes.length === 0 ? "no classes" : `"${classes.join(" ")}"`;
                msg = `Expected element "${selector}" to contain class "${expected}", ${foundClasses} found.`;
            }
            throw new AssertionError("assert.class", msg);
        }
    }

    public async url(expected: string | RegExp, msg?: string): Promise<void> {
        let url;
        try {
            url = await this._browser.url();
        } catch (err) {
            throw new FatalError("assert.url", `Can't obtain page url.${err.extraMessage || err.message}`);
        }
        if (!utils.matchText(url, expected)) {
            if (!msg) msg = `Expected url to be "${utils.stringify(expected)}", "${url}" found`;
            throw new AssertionError("assert.url", msg, url, expected);
        }
    }

    public async value(selector: WendigoSelector, expected: string | null, msg?: string): Promise<void> {
        const value = await this._browser.value(selector);
        if (value !== expected) {
            if (!msg) {
                if (value === null) msg = `Expected element "${selector}" to have value "${expected}", no value found`;
                else msg = `Expected element "${selector}" to have value "${expected}", "${value}" found`;
            }
            throw new AssertionError("assert.value", msg, value, expected);
        }
    }

    @OverrideError("assert")
    public async element(selector: WendigoSelector, msg?: string): Promise<void> {
        return await this.elements(selector, 1, msg);

    }

    public async elements(selector: WendigoSelector, count: number, msg?: string): Promise<void> {
        const assertCountData = elementsAssertionUtils.parseCountInput(count);
        const countCase = elementsAssertionUtils.getCountCase(assertCountData);
        if (!countCase) {
            throw new WendigoError("assert.elements", `parameter count (${count}) is not valid.`);
        }
        const elements = await this._browser.queryAll(selector);
        const elementsCount = elements.length;
        return elementsAssertionUtils.makeAssertion(selector, assertCountData, countCase, elementsCount, msg);
    }

    public async attribute(selector: WendigoSelector, attribute: string, expectedValue?: string | null, msg?: string): Promise<void> {
        const customMessage = Boolean(msg);
        if (!customMessage) {
            msg = `Expected element "${selector}" to have attribute "${attribute}"`;
            if (expectedValue) msg = `${msg} with value "${expectedValue}"`;
            if (expectedValue === null) msg = `Expected element "${selector}" not to have attribute "${attribute}"`;
        }

        const attributes: Array<string | null> = await this._browser.evaluate((q, attrName) => {
            const elements = WendigoUtils.queryAll(q);
            return Array.from(elements).map((el) => {
                return el.getAttribute(attrName);
            });
        }, selector, attribute);

        if (attributes.length === 0) {
            if (!customMessage) msg = `${msg}, no element found.`;
            throw new AssertionError("assert.attribute", msg as string);
        }

        const filteredAttributes = attributes.filter(a => a !== null);
        if (expectedValue === null) {
            if (filteredAttributes.length === 0) return Promise.resolve();
        } else {
            for (const attr of filteredAttributes) {
                if (expectedValue === undefined || utils.matchText(attr, expectedValue)) {
                    return Promise.resolve();
                }
            }
        }

        if (!customMessage) {
            const foundElements = new Set(attributes.filter((a) => {
                return a !== null;
            }));
            if (foundElements.size === 0 || expectedValue === null) msg = `${msg}.`;
            else {
                const foundArr = Array.from(foundElements);
                msg = `${msg}, ["${foundArr.join('", "')}"] found.`;
            }
        }
        throw new AssertionError("assert.attribute", msg as string);
    }

    public async style(selector: WendigoSelector, style: string, expected: string, msg?: string): Promise<void> {
        let value;
        try {
            value = await this._browser.evaluate((sel, sty) => {
                const element = WendigoUtils.queryElement(sel);
                if (!element) return Promise.reject();
                const styles = getComputedStyle(element);
                return styles.getPropertyValue(sty);
            }, selector, style);
        } catch (err) {
            throw new QueryError("assert.style", `Element "${selector}" not found.`);
        }
        if (value !== expected) {
            if (!msg) {
                msg = `Expected element "${selector}" to have style "${style}" with value "${expected}"`;
                if (value) msg = `${msg}, "${value}" found.`;
                else msg = `${msg}, style not found.`;
            }
            throw new AssertionError("assert.style", msg);
        }
    }

    @OverrideError("assert")
    public async href(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        return await this.attribute(selector, "href", expected, msg);
    }

    public async innerHtml(selector: WendigoSelector, expected: string | RegExp, msg?: string): Promise<void> {
        if (!expected && expected !== "") return Promise.reject(new WendigoError("assert.innerHtml", "Missing expected html for assertion."));

        const found = await this._browser.innerHtml(selector);
        if (found.length === 0) {
            const error = new QueryError("assert.innerHtml", `Element "${selector}" not found.`);
            return Promise.reject(error);
        }
        for (const html of found) {
            if (utils.matchText(html, expected)) return Promise.resolve();
        }

        if (!msg) {
            msg = `Expected element "${selector}" to have inner html "${expected}", "${found.join(" ")}" found.`;
        }

        throw new AssertionError("assert.innerHtml", msg, found, expected);
    }

    public async elementHtml(selector: WendigoSelector, expected: string | RegExp, msg?: string): Promise<void> {
        if (!expected && expected !== "") return Promise.reject(new WendigoError("assert.elementHtml", "Missing expected html for assertion."));

        const found = await this._browser.elementHtml(selector);
        if (found.length === 0) {
            const error = new QueryError("assert.elementHtml", `Element "${selector}" not found.`);
            return Promise.reject(error);
        }
        for (const html of found) {
            if (utils.matchText(html, expected)) return Promise.resolve();
        }

        if (!msg) {
            msg = `Expected element "${selector}" to have html "${expected}".`;
        }

        throw new AssertionError("assert.elementHtml", msg, found, expected);
    }

    public async options(selector: WendigoSelector, expected: string | Array<string>, msg?: string): Promise<void> {
        const parsedExpected = utils.arrayfy(expected);
        const options = await this._browser.options(selector);
        const sameMembers = assertUtils.sameMembers(parsedExpected, options);
        if (!sameMembers) {
            if (!msg) {
                const expectedText = parsedExpected.join(", ");
                const optionsText = options.join(", ");
                msg = `Expected element "${selector}" to have options "${expectedText}", "${optionsText}" found.`;
            }
            throw new AssertionError("assert.options", msg, options, expected);
        }
    }

    public async selectedOptions(selector: WendigoSelector, expected: string | Array<string>, msg?: string): Promise<void> {
        const parsedExpected = utils.arrayfy(expected);
        const selectedOptions = await this._browser.selectedOptions(selector);
        const sameMembers = assertUtils.sameMembers(parsedExpected, selectedOptions);
        if (!sameMembers) {
            if (!msg) {
                const expectedText = parsedExpected.join(", ");
                const optionsText = selectedOptions.join(", ");
                msg = `Expected element "${selector}" to have options "${expectedText}" selected, "${optionsText}" found.`;
            }
            throw new AssertionError("assert.selectedOptions", msg, selectedOptions, expected);
        }
    }

    public async global(key: string, expected?: any, msg?: string): Promise<void> {
        const value = await this._browser.evaluate((k: string) => {
            return (window as any)[k];
        }, key);
        if (expected === undefined) {
            if (value === undefined) {
                if (!msg) {
                    msg = `Expected "${key}" to be defined as global variable.`;
                }
                throw new AssertionError("assert.global", msg);
            }
        } else if (value !== expected) {
            if (!msg) {
                msg = `Expected "${key}" to be defined as global variable with value "${expected}", "${value}" found.`;
            }
            throw new AssertionError("assert.global", msg, value, expected);
        }
        return Promise.resolve();
    }

    public async checked(selector: WendigoSelector, msg?: string): Promise<void> {
        let value;
        try {
            value = await this._browser.checked(selector);
        } catch (err) {
            throw new QueryError("assert.checked", `Element "${selector}" not found.`);
        }
        if (value !== true) {
            if (!msg) msg = `Expected element "${selector}" to be checked.`;
            throw new AssertionError("assert.checked", msg, value, true);
        }
    }

    public async disabled(selector: WendigoSelector, msg?: string): Promise<void> {
        let value;
        try {
            value = await this._browser.attribute(selector, "disabled");
        } catch (err) {
            throw new QueryError("assert.disabled", `Element "${selector}" not found.`);
        }
        if (value === null) {
            if (!msg) msg = `Expected element "${selector}" to be disabled.`;
            throw new AssertionError("assert.disabled", msg);
        }
    }

    public async enabled(selector: WendigoSelector, msg?: string): Promise<void> {
        let value;
        try {
            value = await this._browser.attribute(selector, "disabled");
        } catch (err) {
            throw new QueryError("assert.enabled", `Element "${selector}" not found.`);
        }
        if (value !== null) {
            if (!msg) msg = `Expected element "${selector}" to be enabled.`;
            throw new AssertionError("assert.enabled", msg);
        }
    }

    public async focus(selector: WendigoSelector, msg?: string): Promise<void> {
        let focused;
        try {
            focused = await this._browser.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                if (elements.length === 0) return Promise.reject();
                for (const el of elements) {
                    if (document.activeElement === el) return true;
                }
                return false;
            }, selector);
        } catch (err) {
            throw new QueryError("assert.focus", `Element "${selector}" not found.`);
        }
        if (!focused) {
            if (!msg) msg = `Expected element "${selector}" to be focused.`;
            throw new AssertionError("assert.focus", msg);
        }
    }

    public async redirect(msg?: string): Promise<void> {
        if (!msg) msg = `Expected current url to be a redirection.`;

        if (!this._browser.initialResponse) throw new AssertionError("assert.redirect", msg);
        else {
            const chain = this._browser.initialResponse.request().redirectChain();
            if (chain.length === 0) {
                throw new AssertionError("assert.redirect", msg);
            }
        }
    }
}
