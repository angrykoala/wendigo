/* global GhoulUtils */
"use strict";

const assert = require('assert');

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
        this.not = invertifyAsserts(this);
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
