"use strict";

const {WendigoError} = require("../../errors");

module.exports = class BrowserLocalStorage {
    constructor(browser) {
        this._browser = browser;
    }

    async getItem(key) {
        try {
            return await this._browser.evaluate((k) => {
                return localStorage.getItem(k);
            }, key);
        } catch (err) {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.getItem"));
        }
    }

    setItem(key, value) {
        return this._browser.evaluate((k, v) => {
            return localStorage.setItem(k, v);
        }, key, value).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.setItem"));
        });
    }

    removeItem(key) {
        return this._browser.evaluate((k) => {
            return localStorage.removeItem(k);
        }, key).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.removeItem"));
        });
    }

    clear() {
        return this._browser.evaluate(() => {
            return localStorage.clear();
        }).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.clear"));
        });
    }

    length() {
        return this._browser.evaluate(() => {
            return localStorage.length;
        }).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.length"));
        });
    }
};
