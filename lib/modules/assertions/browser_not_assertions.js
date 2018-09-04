"use strict";

const utils = require('../../utils');
const assertUtils = require('./utils/assert_utils');

module.exports = class BrowserNotAssertions {
    constructor(browserAssertions) {
        this._assertions = browserAssertions;
        this._browser = browserAssertions._browser;
    }


    exists(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to not exists`;
        return assertUtils.invertify(() => {
            return this._assertions.exists(selector, "x");
        }, msg);
    }

    visible(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to not be visible.`;
        return assertUtils.invertify(() => {
            return this._assertions.visible(selector, "x");
        }, msg);
    }

    text(selector, expected, msg) {
        if ((!expected && expected !== "") || expected.length === 0) return Promise.reject(new Error(`Missing expected text for assertion`));
        if (!Array.isArray(expected)) expected = [expected];
        return this._browser.text(selector).then((texts) => {
            for (const expectedText of expected) {
                if (utils.matchTextList(texts, expectedText)) {
                    if (!msg) msg = `Expected element "${selector}" not to have text "${expectedText}"`;
                    return assertUtils.rejectAssertion(msg);
                }
            }
            return Promise.resolve();
        });
    }

    textContains(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to contain text "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.textContains(selector, expected, "x");
        }, msg);
    }

    title(expected, msg) {
        if (!msg) msg = `Expected page title not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.title(expected, "x");
        }, msg);
    }

    class(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.class(selector, expected, "x");
        }, msg);
    }

    url(expected, msg) {
        if (!msg) msg = `Expected url not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.url(expected, "x");
        }, msg);
    }

    value(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have value "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.value(selector, expected, "x");
        }, msg);
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
                return assertUtils.rejectAssertion(msg);
            }
            if (!customMessage) msg = `${msg}.`;
            return assertUtils.invertify(() => {
                return this._assertions.attribute(selector, attribute, expectedValue, "x");
            }, msg);
        });
    }

    style(selector, style, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.style(selector, style, expected, "x");
        }, msg);
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg);
    }

    innerHtml(selector, expected, msg) {
        if (!msg) msg = `Expected element "${selector}" not to have inner html "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.innerHtml(selector, expected, "x");
        }, msg);
    }

    selectedOptions(selector, expected, msg) {
        if (!Array.isArray((expected))) expected = [expected];
        if (!msg) {
            const expectedText = expected.join(", ");
            msg = `Expected element "${selector}" not to have options "${expectedText}" selected.`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.selectedOptions(selector, expected, "x");
        }, msg);
    }

    global(key, expected, msg) {
        if (!msg) {
            if (expected === undefined) msg = `Expected "${key}" not to be defined as global variable.`;
            else msg = `Expected "${key}" not to be defined as global variable with value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.global(key, expected, "x");
        }, msg);
    }

    cookie(name, expected, msg) {
        if (!msg) {
            msg = expected === undefined ?
                `Expected cookie "${name}" to not exist.` :
                `Expected cookie "${name}" to not have value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.cookie(name, expected, "x");
        }, msg);
    }

    checked(selector, msg) {
        return this._browser.checked(selector).then((value) => {
            if (value !== false) {
                if (!msg) msg = `Expected element "${selector}" to not be checked.`;
                return assertUtils.rejectAssertion(msg, value, false);
            }
        });
    }

    disabled(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" not to be disabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.disabled(selector, "x");
        }, msg);
    }

    enabled(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" not to be enabled.`;
        return assertUtils.invertify(() => {
            return this._assertions.enabled(selector, "x");
        }, msg);
    }

    focus(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to be unfocused.`;
        return assertUtils.invertify(() => {
            return this._assertions.focus(selector, "x");
        }, msg);
    }

    redirect(msg) {
        if (!msg) msg = `Expected current url not to be a redirection.`;
        return assertUtils.invertify(() => {
            return this._assertions.redirect("x");
        }, msg);
    }

    element(selector, msg) {
        if (!msg) msg = `Expected selector "${selector}" not to find any elements.`;
        return this._assertions.elements(selector, 0, msg);
    }
};
