/* global WendigoUtils */
"use strict";

const utils = require('../utils');

module.exports = function BrowserWaitMixin(s) {
    return class BrowserWait extends s {
        wait(ms = 250) {
            this._failIfNotLoaded();
            return utils.delay(ms);
        }

        waitFor(selector, timeout = 500, ...args) {
            this._failIfNotLoaded();
            return this.page.waitFor(selector, {timeout: timeout,
                visible: true}, ...args).catch(() => {
                let errMsg = `timeout of ${timeout}ms exceeded.`;
                if (typeof selector === 'function') errMsg = `Waiting for function to return true, ${errMsg}`;
                else errMsg = `Waiting for element "${selector}", ${errMsg}`;
                return Promise.reject(new Error(errMsg));
            });
        }

        waitUntilNotVisible(selector, timeout = 500) {
            // TODO: fix and remove eslint-disable
            return this.waitFor((selector) => { // eslint-disable-line
                const element = WendigoUtils.queryElement(selector);
                return !WendigoUtils.isVisible(element);
            }, timeout, selector).catch(() => {
                return Promise.reject(new Error(`Waiting for element "${selector}" not to be visible, timeout of ${timeout}ms exceeded.`));
            });
        }

        waitForUrl(url, timeout = 500) {
            return this.waitFor((expectedUrl) => {
                let currentUrl = window.location.href;
                if (currentUrl === "about:blank") currentUrl = null;
                return currentUrl === expectedUrl;
            }, timeout, url).catch(() => {
                return Promise.reject(new Error(`Waiting for url "${url}", timeout of ${timeout}ms exceeded.`));
            });
        }
    };
};
