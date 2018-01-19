"use strict";

const assert = require('assert');

module.exports = class BrowserAssertions {

    constructor(browser) {
        this.browser = browser;

    }

    exists(selector) {
        return this.browser.query(selector).then((element) => {
            assert.strictEqual(Boolean(element), true);
        });
    }
};
