"use strict";

const assert = require('assert');
const textUtils = require('./utils/text_utils');
const assertUtils = require('./utils/assert_utils');

module.exports = class BrowserNotAssertions {

    constructor(browserAssertions, browser) {
        this._assertions = browserAssertions;
        this._browser = browser;
    }


    exists(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to not exists`;
        return assertUtils.invertify(() => {
            return this._assertions.exists(selector, "");
        }, msg);
    }

    visible(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to not be visible`;
        return assertUtils.invertify(() => {
            return this._assertions.visible(selector, "");
        }, msg);
    }

    text(selector, expected, msg) {
        if((!expected && expected !== "") || expected.length === 0) return Promise.reject(new Error(`Missing expected text for assertion`));
        if(!Array.isArray(expected)) expected = [expected];
        return this._browser.text(selector).then((texts) => {
            for(const expectedText of expected) {
                if(textUtils.matchTextList(texts, expectedText)) {
                    if(!msg) msg = `Expected element "${selector}" not to have text "${expectedText}"`;
                    return assertUtils.rejectAssertion(msg);
                }
            }
            return Promise.resolve();
        });
    }

    textContains(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to contain text "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.textContains(selector, expected, "");
        }, msg);
    }

    title(expected, msg) {
        if(!msg) msg = `Expected page title not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.title(expected, "");
        }, msg);
    }

    class(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.class(selector, expected, "");
        }, msg);
    }

    url(expected, msg) {
        if(!msg) msg = `Expected url not to be "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.url(expected, "");
        }, msg);
    }

    value(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have value "${expected}"`;
        return assertUtils.invertify(() => {
            return this._assertions.value(selector, expected, "");
        }, msg);
    }

    attribute(selector, attribute, expectedValue, msg) {
        return this._browser.attribute(selector, attribute).then((value) => {
            if(expectedValue === undefined || expectedValue === null) {
                if(!msg) msg = `Expected element "${selector}" not to have attribute "${attribute}".`;
                assert((value === null), msg);
            } else {
                if(!msg) {
                    msg = `Expected element "${selector}" not to have attribute "${attribute}" with value "${expectedValue}".`;
                }
                assert(value !== expectedValue, msg);
            }
        }).catch(() => {
            if(!msg) {
                msg = `Expected element "${selector}" not to have attribute "${attribute}"`;
                if(expectedValue !== undefined) msg = `${msg} with value "${expectedValue}"`;
                msg = `${msg}, no element found.`;
            }
            return assertUtils.rejectAssertion(msg);
        });
    }

    style(selector, style, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.style(selector, style, expected, "");
        }, msg);
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg);
    }

    innerHtml(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have inner html "${expected}".`;
        return assertUtils.invertify(() => {
            return this._assertions.innerHtml(selector, expected, "");
        }, msg);
    }

    selectedOptions(selector, expected, msg) {
        if(!Array.isArray((expected))) expected = [expected];
        if (!msg) {
            const expectedText = expected.join(", ");
            msg = `Expected element "${selector}" not to have options "${expectedText}" selected.`;
        }
        return assertUtils.invertify(() => {
            return this._assertions.selectedOptions(selector, expected, "");
        }, msg);
    }
};
