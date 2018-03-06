"use strict";

const assert = require('assert');
const utils = require('../utils');

function invertify(cb, msg) {
    return cb().then(() => {
        return Promise.reject(new assert.AssertionError({message: msg}));
    }, (err) => {
        if(err instanceof assert.AssertionError) return Promise.resolve();
        else return Promise.reject(err);
    });
}

module.exports = class BrowserAssertions {

    constructor(browserAssertions, browser) {
        this._assertions = browserAssertions;
        this._browser = browser;
    }


    exists(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to not exists`;
        return invertify(() => {
            return this._assertions.exists(selector);
        }, msg);
    }

    visible(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to not be visible`;
        return invertify(() => {
            return this._assertions.visible(selector);
        }, msg);
    }

    text(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have text "${expected}"`;
        return invertify(() => {
            return this._assertions.text(selector, expected);
        }, msg);
    }

    textContains(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to contain text "${expected}"`;
        return invertify(() => {
            return this._assertions.textContains(selector, expected);
        }, msg);
    }

    title(expected, msg) {
        if(!msg) msg = `Expected page title not to be "${expected}"`;
        return invertify(() => {
            return this._assertions.title(expected);
        }, msg);
    }

    class(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to contain class "${expected}".`;
        return invertify(() => {
            return this._assertions.class(selector, expected);
        }, msg);
    }

    url(expected, msg) {
        if(!msg) msg = `Expected url not to be "${expected}"`;
        return invertify(() => {
            return this._assertions.url(expected);
        }, msg);
    }

    value(selector, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have value "${expected}"`;
        return invertify(() => {
            return this._assertions.value(selector, expected);
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
            return utils.rejectAssertion(msg);
        });
    }

    style(selector, style, expected, msg) {
        if(!msg) msg = `Expected element "${selector}" not to have style "${style}" with value "${expected}".`;
        return invertify(() => {
            return this._assertions.style(selector, style, expected);
        }, msg);
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg);
    }
};
