/* global GhoulUtils */
"use strict";

const assert = require('assert');

module.exports = class BrowserAssertions {

    constructor(browser) {
        this._browser = browser;
    }

    exists(selector) {
        return this._browser.query(selector).then((element) => {
            assert.strictEqual(Boolean(element), true);
        });
    }

    visible(selector) {
        return this._browser.page.evaluate(function(q) {// eslint-disable-line
            const element = document.querySelector(q);
            return GhoulUtils.isVisible(element);
        }, selector).then((visible) => {
            assert.strictEqual(visible, true);
        });
    }

    text(selector, expected) {
        return this._browser.text(selector).then((texts) => {
            assert(texts.includes(expected));
        });
    }

    title(expected) {
        return this._browser.title().then((title) => {
            assert.strictEqual(title, expected);
        });
    }
};
