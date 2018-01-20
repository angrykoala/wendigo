"use strict";

const BrowserAssertions = require('./browser_assertions');
const BrowserBase = require('./browser_base');

module.exports = class Browser extends BrowserBase {
    constructor(page) {
        super(page);
        this.assert = new BrowserAssertions(this);
    }

    open(url) {
        return this.page.open(url).then(() => {
            return this.page.injectJs("injection_scripts/ghoul_utils.js");
        });
    }

    text(selector) {
        return this.queryAll(selector).then((elements) => {
            return Array.from(elements).map(e => e.textContent);
        });
    }

    html() {
        return this.page.property('content');
    }

};
