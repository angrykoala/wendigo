"use strict";

module.exports = class BrowserModule {
    constructor(browser) {
        this._browser = browser;
    }

    _beforeOpen() {
        // Override only if needed to perform actions on open
    }
};
