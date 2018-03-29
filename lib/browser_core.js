"use strict";


module.exports = class BrowserCore {
    constructor(page, settings) {
        this.page = page;
        this._settings = settings;
    }

    evaluate(cb, ...args) {
        this._failIfNotLoaded();
        return this.page.evaluate(cb, ...args);
    }
};
