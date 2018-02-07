/* global WendigoUtils */
"use strict";

const assert = require('assert');
const BrowserNotAssertions = require('./browser_not_assertions');
const elementsAssertionUtils = require('./assertions_utils/assert_elements');

module.exports = class BrowserAssertions {

    constructor(browser) {
        this._browser = browser;
        this.not = new BrowserNotAssertions(this);
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
            for(const text of texts){
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


};
