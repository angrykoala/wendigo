/* global WendigoUtils */
"use strict";

const assert = require('assert');
const BrowserNotAssertions = require('./browser_not_assertions');

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
            const element = document.querySelector(q);
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
};
