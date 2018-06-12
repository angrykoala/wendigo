"use strict";

module.exports = class BrowserModule {
    constructor(browser) {
        this._browser = browser;
    }

    _beforeOpen() {
        // Override only if need to perform actions on open
    }

    _beforeClose() {
        // Override only if need to perform actions on open
    }
};
