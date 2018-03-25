"use strict";

const BrowserModule = require('./browser_module');

module.exports = class BrowserLocalStorage extends BrowserModule {
    getItem(key) {
        return this._browser.evaluate((k) => {
            return localStorage.getItem(k);
        }, key);
    }

    setItem(key, value) {
        return this._browser.evaluate((k, v) => {
            return localStorage.setItem(k, v);
        }, key, value);
    }

    removeItem(key) {
        return this._browser.evaluate((k) => {
            return localStorage.removeItem(k);
        }, key);
    }

    clear() {
        return this._browser.evaluate(() => {
            return localStorage.clear();
        });
    }

    length() {
        return this._browser.evaluate(() => {
            return localStorage.length;
        });
    }
};
