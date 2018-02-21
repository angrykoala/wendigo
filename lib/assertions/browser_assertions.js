/* global WendigoUtils */
"use strict";

const assert = require('assert');
const BrowserNotAssertions = require('./browser_not_assertions');
const elementsAssertionUtils = require('./utils/assert_elements');
const utils = require('../utils');

module.exports = class BrowserAssertions {

    constructor(browser) {
        this._browser = browser;
        this.not = new BrowserNotAssertions(this, browser);
    }

    exists(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to exists`;
        return this._browser.query(selector).then((element) => {
            assert.strictEqual(Boolean(element), true, msg);
        });
    }

    visible(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to be visible`;
        return this._browser.page.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            return WendigoUtils.isVisible(element);
        }, selector).then((visible) => {
            assert.strictEqual(visible, true, msg);
        });
    }

    text(selector, expected, msg) {
        return this._browser.text(selector).then((texts) => {
            if(!msg) {
                const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                msg = `Expected element "${selector}" to have text "${expected}", ${foundText} found`;
            }
            assert(texts.includes(expected), msg);
        });
    }

    textContains(selector, expected, msg) {
        return this._browser.text(selector).then((texts) => {
            if(!msg) {
                const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                msg = `Expected element "${selector}" to contain text "${expected}", ${foundText} found`;
            }
            for(const text of texts) {
                if(text && text.includes(expected)) return Promise.resolve();
            }
            assert(false, msg);
        });
    }

    title(expected, msg) {
        return this._browser.title().then((title) => {
            const foundTitle = title ? `"${title}"` : "no title";
            if(!msg) msg = `Expected page title to be "${expected}", ${foundTitle} found`;
            assert.strictEqual(title, expected, msg);
        });
    }

    class(selector, expected, msg) {
        return this._browser.class(selector).then((classes) => {
            if(!msg) {
                const foundClasses = classes.length === 0 ? "no classes" : `"${classes.join(" ")}"`;
                msg = `Expected element "${selector}" to contain class "${expected}", ${foundClasses} found`;
            }
            assert(classes.includes(expected), msg);
        });
    }

    url(expected, msg) {
        return this._browser.url().then((url) => {
            if(!msg) msg = `Expected url to be "${expected}", "${url}" found`;
            assert.strictEqual(url, expected, msg);
        });
    }

    value(selector, expected, msg) {
        return this._browser.value(selector).then((value) => {
            if(!msg) {
                if(value === null) msg = `Expected element "${selector}" to have value "${expected}", no value found`;
                else msg = `Expected element "${selector}" to have value "${expected}", "${value}" found`;
            }
            assert.strictEqual(value, expected, msg);
        });
    }

    element(selector, msg) {
        return this.elements(selector, 1, msg);
    }

    elements(selector, count, msg) {
        const assertCountData = elementsAssertionUtils.parseCountInput(count);
        if(!assertCountData.case) {
            return Promise.reject(new Error(`browser.assert.elements, parameter count (${count}) is not valid`));
        }
        return this._browser.queryAll(selector).then((elements) => {
            const elementsCount = elements.length;
            if(!msg) msg = elementsAssertionUtils.getAssertionMessage(selector, assertCountData, elementsCount);
            elementsAssertionUtils.makeAssertion(assertCountData, elementsCount, msg);
        });
    }

    attribute(selector, attribute, expectedValue, msg) {
        return this._browser.attribute(selector, attribute).then((value) => {
            if(expectedValue === undefined || expectedValue === null) {
                if(!msg) msg = `Expected element "${selector}" to have attribute "${attribute}".`;
                assert((value !== null), msg);
            } else {
                if(!msg) {
                    msg = `Expected element "${selector}" to have attribute "${attribute}" with value "${expectedValue}"`;
                    if(value) msg = `${msg}, "${value}" found.`;
                    else msg = `${msg}.`;
                }
                assert.strictEqual(value, expectedValue, msg);
            }
        }).catch(() => {
            if(!msg) {
                msg = `Expected element "${selector}" to have attribute "${attribute}"`;
                if(expectedValue !== undefined) msg = `${msg} with value "${expectedValue}"`;
                msg = `${msg}, no element found.`;
            }
            return utils.rejectAssertion(msg);
        });
    }

    style(selector, style, expected, msg) {
        return this._browser.page.evaluate((selector, style) => {
            const element = WendigoUtils.queryElement(selector);
            if(!element) return Promise.reject();
            const styles = getComputedStyle(element);
            return styles.getPropertyValue(style);
        }, selector, style).catch(() => {
            return Promise.reject(new Error(`Element "${selector}" not found when trying to assert style.`));
        }).then((value) => {
            if(!msg) {
                msg = `Expected element "${selector}" to have style "${style}" with value "${expected}"`;
                if(value) msg = `${msg}, "${value}" found.`;
                else msg = `${msg}, style not found.`;
            }
            assert.strictEqual(value, expected, msg);
        });

    }
};
