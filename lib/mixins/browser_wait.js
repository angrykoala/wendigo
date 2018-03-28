/* global WendigoUtils */
"use strict";


module.exports = function BrowserWaitMixin(s) {
    return class BrowserWait extends s {

        wait(ms = 250) {
            this._failIfNotLoaded();
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, ms);
            });
        }

        waitFor(selector, timeout = 500) {
            this._failIfNotLoaded();
            return this.page.waitForSelector(selector, {timeout: timeout, visible: true}).catch(() => {
                return Promise.reject(new Error(`Waiting for element "${selector}" failed, timeout of ${timeout}ms exceeded`));
            });
        }

        waitUntilNotVisible(selector, timeout = 500) {
            this._failIfNotLoaded();
            return this.page.waitForFunction((selector) => {
                const element = WendigoUtils.queryElement(selector);
                return !WendigoUtils.isVisible(element);
            }, {timeout: timeout}, selector).catch(() => {
                return Promise.reject(new Error(`Waiting for element "${selector}" not to be visible, timeout of ${timeout}ms exceeded`));
            });
        }
    };
};
