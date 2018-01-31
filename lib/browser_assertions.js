/* global WendigoUtils */
"use strict";

const assert = require('assert');
const BrowserNotAssertions = require('./browser_not_assertions');
const utils = require('./utils');

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
        if(utils.isNumber(count)) {
            count = {
                equal: Number(count)
            };
        }
        if(!this._checkCountParameter(count)) {
            return Promise.reject(new Error(`browser.assert.elements, parameter count (${count}) is not valid`));
        }
        return this._browser.queryAll(selector).then((elements) => {
            const elementsCount = elements.length;
            if(utils.isNumber(count.equal)) {
                if(!msg) msg = `Expected selector "${selector}" to find exactly ${count.equal} elements, ${elementsCount} found`;
                assert.strictEqual(elementsCount, Number(count.equal), msg);
            } else if(utils.isNumber(count.atLeast) && !utils.isNumber(count.atMost)) {
                if(!msg) msg = `Expected selector "${selector}" to find at least ${count.atLeast} elements, ${elementsCount} found`;
                assert(elementsCount >= count.atLeast, msg);
            } else if(utils.isNumber(count.atMost) && !utils.isNumber(count.atLeast)) {
                if(!msg) msg = `Expected selector "${selector}" to find up to ${count.atMost} elements, ${elementsCount} found`;
                assert(elementsCount <= count.atMost, msg);
            } else if(utils.isNumber(count.atMost) && utils.isNumber(count.atLeast)) {
                if(!msg) msg = `Expected selector "${selector}" to find between ${count.atLeast} and ${count.atMost} elements, ${elementsCount} found`;
                assert(elementsCount >= count.atLeast && elementsCount <= count.atMost, msg);
            }
        });
    }

    _checkCountParameter(count) {
        const validEqual = utils.isNumber(count["equal"]);
        const validAtLeast = utils.isNumber(count["atLeast"]);
        const validAtMost = utils.isNumber(count["atMost"]);
        return validEqual || validAtMost || validAtLeast;
    }
};
