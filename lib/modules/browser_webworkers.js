"use strict";

const WebWorker = require('../models/webworker');

module.exports = class BrowserWebWorkers {
    constructor(browser) {
        this._browser = browser;
    }

    all() {
        return this._browser.page.workers().map((ww) => {
            return new WebWorker(ww);
        });
    }
};
