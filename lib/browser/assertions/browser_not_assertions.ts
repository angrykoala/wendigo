import { arrayfy, matchTextList, matchTextContainingList } from '../../utils/utils';
import { invertify } from '../../utils/assert_utils';
import { WendigoError, QueryError, AssertionError } from '../../models/errors';
import BrowserAssertions from '../browser_assertions';
import BrowserInterface from '../../browser/browser_interface';
import { WendigoSelector } from '../../types';
import OverrideError from '../../decorators/override_error';

export default class BrowserNotAssertions {
    protected _assertions: BrowserAssertions;
    protected _browser: BrowserInterface;

    constructor(assertions: BrowserAssertions, browser: BrowserInterface) {
        this._assertions = assertions;
        this._browser = browser;
    }

    public exists(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not exists.`;
        return invertify(() => {
            return this._assertions.exists(selector, "x");
        }, "assert.not.exists", msg);
    }

    public visible(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not be visible.`;
        return invertify(() => {
            return this._assertions.visible(selector, "x");
        }, "assert.not.visible", msg);
    }

    public tag(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to not have "${expected}" tag.`;
        return invertify(() => {
            return this._assertions.tag(selector, expected, "x");
        }, "assert.not.tag", msg);
    }

    public async text(selector: WendigoSelector, expected: string | RegExp | Array<string | RegExp>, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            throw new WendigoError("assert.not.text", `Missing expected text for assertion.`);
        }
        const processedExpected = arrayfy(expected);

        const texts = await this._browser.text(selector);
        for (const expectedText of processedExpected) {
            if (matchTextList(texts, expectedText)) {
                if (!msg) msg = `Expected element "${selector}" not to have text "${expectedText}".`;
                throw new AssertionError("assert.not.text", msg);
            }
        }
    }

    public async textContains(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            throw new WendigoError("assert.not.textContains", `Missing expected text for assertion.`);
        }

        const processedExpected = arrayfy(expected);
        const texts = await this._browser.text(selector);

        for (const expectedText of processedExpected) {
            if (matchTextContainingList(texts, expectedText)) {
                if (!msg) {
                    msg = `Expected element "${selector}" to not contain text "${expectedText}".`;
                }
                throw new AssertionError("assert.not.textContains", msg);
            }
        }
    }

    public title(expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected page title not to be "${expected}".`;
        return invertify(() => {
            return this._assertions.title(expected, "x");
        }, "assert.not.title", msg);
    }

    public class(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return invertify(() => {
            return this._assertions.class(selector, expected, "x");
        }, "assert.not.class", msg);
    }

    public url(expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected url not to be "${expected}"`;
        return invertify(() => {
            return this._assertions.url(expected, "x");
        }, "assert.not.url", msg);
    }

    public value(selector: WendigoSelector, expected: string | null, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have value "${expected}".`;
        return invertify(() => {
            return this._assertions.value(selector, expected, "x");
        }, "assert.not.value", msg);
    }

    public async attribute(selector: WendigoSelector, attribute: string, expectedValue?: string, msg?: string): Promise<void> {
        const customMessage = Boolean(msg);
        if (!customMessage) {
            msg = `Expected element "${selector}" not to have attribute "${attribute}"`;
            if (expectedValue) msg = `${msg} with value "${expectedValue}"`;
        }
        const elementFound = await this._browser.query(selector);
        if (elementFound === null) {
            if (!customMessage) {
                msg = `${msg}, no element found.`;
            }
            throw new AssertionError("assert.not.attribute", msg as string);
        }
        if (!customMessage) msg = `${msg}.`;
        return invertify(() => {
            return this._assertions.attribute(selector, attribute, expectedValue, "x");
        }, "assert.not.attribute", msg as string);
    }

    public style(selector: WendigoSelector, style: string, expected: string, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return invertify(() => {
            return this._assertions.style(selector, style, expected, "x");
        }, "assert.not.style", msg);
    }

    @OverrideError("assert.not")
    public async href(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        await this.attribute(selector, "href", expected, msg);
    }

    public innerHtml(selector: WendigoSelector, expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have inner html "${expected}".`;
        return invertify(() => {
            return this._assertions.innerHtml(selector, expected, "x");
        }, "assert.not.innerHtml", msg);
    }

    public elementHtml(selector: WendigoSelector, expected: string | RegExp, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to have html "${expected}".`;
        return invertify(() => {
            return this._assertions.elementHtml(selector, expected, "x");
        }, "assert.not.elementHtml", msg);
    }

    public selectedOptions(selector: WendigoSelector, expected: string | Array<string>, msg?: string): Promise<void> {
        if (!msg) {
            const parsedExpected = arrayfy(expected);
            const expectedText = parsedExpected.join(", ");
            msg = `Expected element "${selector}" not to have options "${expectedText}" selected.`;
        }
        return invertify(() => {
            return this._assertions.selectedOptions(selector, expected, "x");
        }, "assert.not.selectedOptions", msg);
    }

    public global(key: string, expected: any, msg?: string): Promise<void> {
        if (!msg) {
            if (expected === undefined) msg = `Expected "${key}" not to be defined as global variable.`;
            else msg = `Expected "${key}" not to be defined as global variable with value "${expected}".`;
        }
        return invertify(() => {
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
            throw new AssertionError("assert.not.checked", msg, value, false);
        }
    }

    public disabled(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to be disabled.`;
        return invertify(() => {
            return this._assertions.disabled(selector, "x");
        }, "assert.not.disabled", msg);
    }

    public enabled(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" not to be enabled.`;
        return invertify(() => {
            return this._assertions.enabled(selector, "x");
        }, "assert.not.enabled", msg);
    }

    public focus(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to be unfocused.`;
        return invertify(() => {
            return this._assertions.focus(selector, "x");
        }, "assert.not.focus", msg);
    }

    public redirect(msg?: string): Promise<void> {
        if (!msg) msg = `Expected current url not to be a redirection.`;
        return invertify(() => {
            return this._assertions.redirect("x");
        }, "assert.not.redirect", msg);
    }

    @OverrideError("assert.not")
    public async element(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected selector "${selector}" not to find any elements.`;
        await this._assertions.elements(selector, 0, msg);
    }
}
