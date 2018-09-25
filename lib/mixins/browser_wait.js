/* global WendigoUtils */
"use strict";

const utils = require('../utils');
const {TimeoutError} = require('../errors/errors');

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
                let errMsg;
                if (typeof selector === 'function') errMsg = `Waiting for function to return true`;
                else errMsg = `Waiting for element "${selector}"`;
                return Promise.reject(new TimeoutError(errMsg, timeout));
            });
        }

        waitUntilNotVisible(selector, timeout = 500) {
            return this.waitFor((q) => {
                const element = WendigoUtils.queryElement(q);
                return !WendigoUtils.isVisible(element);
            }, timeout, selector).catch(() => {
                return Promise.reject(new TimeoutError(`Waiting for element "${selector}" not to be visible`, timeout));
            });
        }

        waitForUrl(url, timeout = 500) {
            return this.waitFor((expectedUrl) => {
                let currentUrl = window.location.href;
                if (currentUrl === "about:blank") currentUrl = null;
                return currentUrl === expectedUrl;
            }, timeout, url).catch(() => {
                return Promise.reject(new TimeoutError(`Waiting for url "${url}"`, timeout));
            });
        }

        waitForRequest(url, timeout = 500) {
            return this.page.waitForRequest(url, {
                timeout: timeout
            }).catch(() => {
                return Promise.reject(new TimeoutError(`Waiting for request "${url}"`, timeout));
            });
        }

        waitForResponse(url, timeout = 500) {
            return this.page.waitForResponse(url, {
                timeout: timeout
            }).catch(() => {
                return Promise.reject(new TimeoutError(`Waiting for response "${url}"`, timeout));
            });
        }
    };
};
