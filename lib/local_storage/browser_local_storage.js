"use strict";


module.exports = class BrowserLocalStorage {
    constructor(browser) {
        this._browser = browser;
    }

    getItem(key) {
        return this._browser.page.evaluate((k) => {
            return localStorage.getItem(k);
        }, key);
    }

    setItem(key, value) {
        return this._browser.page.evaluate((k, v) => {
            return localStorage.setItem(k, v);
        }, key, value);
    }

    removeItem(key) {
        return this._browser.page.evaluate((k) => {
            return localStorage.removeItem(k);
        }, key);

    }

    clear() {
        return this._browser.page.evaluate(() => {
            return localStorage.clear();
        });

    }

    length() {
        return this._browser.page.evaluate(() => {
            return localStorage.length;
        });

    }


};
