/* global WendigoUtils */
"use strict";

const assert = require('assert');
const BrowserNotAssertions = require('./browser_not_assertions');


function invertifyAsserts(instance) {
    const result = {};
    const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    properties.shift(); // removes constructor
    for(let key of properties) {
        result[key] = function () {
            return new Promise((resolve, reject) => {
                instance[key].apply(result, arguments).then(() => {
                    reject(new Error());
                }). catch(() => {
                    resolve();
                });
            });
        };
    }
    result._browser = instance._browser;
    return result;
}

module.exports = class BrowserAssertions {

    constructor(browser) {
        this._browser = browser;
        // this.not = invertifyAsserts(this);
        this.not = new BrowserNotAssertions(this);
    }

    exists(selector, msg) {
        if(!msg) msg = `Expected element ${selector} to exists`;
        return this._browser.query(selector).then((element) => {
            assert.strictEqual(Boolean(element), true, msg);
        });
    }

    visible(selector, msg) {
        if(!msg) msg = `Expected element ${selector} to be visible`;
        return this._browser.page.evaluate((q) => {
            const element = document.querySelector(q);
            return WendigoUtils.isVisible(element);
        }, selector).then((visible) => {
            assert.strictEqual(visible, true, msg);
        });
    }

    text(selector, expected, msg) {
        return this._browser.text(selector).then((texts) => {
            if(!msg) msg = `Expected element ${selector} to have text ${expected}, ${texts} found`;
            assert(texts.includes(expected), msg);
        });
    }

    title(expected, msg) {
        return this._browser.title().then((title) => {
            if(!msg) msg = `Expected page title to be ${expected}, ${title} found`;
            assert.strictEqual(title, expected, msg);
        });
    }
};
