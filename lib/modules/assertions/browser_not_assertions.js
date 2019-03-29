"use strict";

const utils = require('../../utils/utils');
const assertUtils = require('../../utils/assert_utils');
const deprecationWarning = require('../../utils/deprecation_warning');
const {WendigoError, QueryError} = require('../../errors');

module.exports = class BrowserNotAssertions {
    constructor(assertions) {
        this._assertions = assertions;
        this._browser = assertions._browser;
    }

    exists(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to not exists.`;
        return assertUtils.invertify(() => {
            return this._assertions.exists(selector, "x");
        }, "assert.not.exists", msg);
    }

    visible(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to not be visible.`;
        return assertUtils.invertify(() => {
            return this._assertions.visible(selector, "x");
        }, "assert.not.visible", msg);
    }

    tag(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" to not have "${expected}" tag.`;
        return assertUtils.invertify(() => {
            return this._assertions.tag(selector, expected, "x");
        }, "assert.not.tag", msg);
    }

    text(selector, expected, msg) {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            return Promise.reject(new WendigoError("assert.not.text", `Missing expected text for assertion.`));
        }
        if (!Array.isArray(expected)) expected = [expected];
        return this._browser.text(selector).then((texts) => {
            for (const expectedText of expected) {
                if (utils.matchTextList(texts, expectedText)) {
                    if (!msg) msg = `Expected element "${selector}" not to have text "${expectedText}".`;
                    return assertUtils.rejectAssertion("assert.not.text", msg);
                }
            }
            return Promise.resolve();
        });
    }

    textContains(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" to not contain text "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.textContains(selector, expected, "x");
        }, "assert.not.textContains", msg);
    }

    title(expected, msg) {
        if (!msg) msg = `Expected page title not to be "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.title(expected, "x");
        }, "assert.not.title", msg);
    }

    class(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.class(selector, expected, "x");
        }, "assert.not.class", msg);
    }

    url(expected, msg) {
        if (!msg) msg = `Expected url not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.url(expected, "x");
        }, "assert.not.url", msg);
    }

    value(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.value(selector, expected, "x");
        }, "assert.not.value", msg);
    }

    attribute(selector, attribute, expectedValue, msg) {
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
                return assertUtils.rejectAssertion("assert.not.attribute", msg);
            }
            if (!customMessage) msg = `${msg}.`;
            return assertUtils.invertify(() => {
                return this._assertions.attribute(selector, attribute, expectedValue, "x");
            }, "assert.not.attribute", msg);
        });
    }

    style(selector, style, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.style(selector, style, expected, "x");
        }, "assert.not.style", msg);
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.not.href"));
        });
    }

    innerHtml(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have inner html "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.innerHtml(selector, expected, "x");
        }, "assert.not.innerHtml", msg);
    }

    selectedOptions(selector, expected, msg) {
        if (!Array.isArray((expected))) expected = [expected];
        if (!msg) {
            const expectedText = expected.join(", ");
            msg = `Expected element "${selector}" not to have options "${expectedText}" selected.`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.selectedOptions(selector, expected, "x");
        }, "assert.not.selectedOptions", msg);
    }

    global(key, expected, msg) {
        if (!msg) {
            if (expected === undefined) msg = `Expected "${key}" not to be defined as global variable.`;
            else msg = `Expected "${key}" not to be defined as global variable with value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.global(key, expected, "x");
        }, "assert.not.global", msg);
    }

    cookie(...args) {
        // DEPRECATED
        deprecationWarning("browser.assert.not.cookie", "browser.asssert.not.cookies");
        return this.cookies(...args);
    }

    async checked(selector, msg) {
        let value;
        try {
            value = await this._browser.checked(selector);
        } catch (err) {
            return Promise.reject(new QueryError("assert.not.checked", `Element "${selector}" not found.`));
        }
        if (value !== false) {
            if (!msg) msg = `Expected element "${selector}" to not be checked.`;
            return assertUtils.rejectAssertion("assert.not.checked", msg, value, false);
        }
    }

    disabled(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" not to be disabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.disabled(selector, "x");
        }, "assert.not.disabled", msg);
    }

    enabled(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" not to be enabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.enabled(selector, "x");
        }, "assert.not.enabled", msg);
    }

    focus(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to be unfocused.`;
        return assertUtils.invertify(() => {
            return this._assertions.focus(selector, "x");
        }, "assert.not.focus", msg);
    }

    redirect(msg) {
        if (!msg) msg = `Expected current url not to be a redirection.`;
        return assertUtils.invertify(() => {
            return this._assertions.redirect("x");
        }, "assert.not.redirect", msg);
    }

    element(selector, msg) {
        if (!msg) msg = `Expected selector "${selector}" not to find any elements.`;
        return this._assertions.elements(selector, 0, msg).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.not.element"));
        });
    }
};
