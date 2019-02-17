/* global WendigoUtils */
"use strict";

const DomElement = require('../models/dom_element');
const utils = require('../utils/utils');
const {TimeoutError, WendigoError} = require('../errors');

module.exports = function BrowserWaitMixin(s) {
    return class BrowserWait extends s {
        wait(ms = 250) {
            this._failIfNotLoaded("wait");
            return utils.delay(ms);
        }

        waitFor(selector, timeout = 500, ...args) {
            this._failIfNotLoaded("waitFor");
            args = args.map((e) => {
                if (e instanceof DomElement) return e.element;
                else return e;
            });

            return this.page.waitFor(selector, {timeout: timeout,
                visible: true}, ...args).catch(() => {
                let errMsg;
                if (typeof selector === 'function') errMsg = `Waiting for function to return true`;
                else errMsg = `Waiting for element "${selector}"`;
                return Promise.reject(new TimeoutError("waitFor", errMsg, timeout));
            });
        }

        waitUntilNotVisible(selector, timeout = 500) {
            this._failIfNotLoaded("waitUntilNotVisible");
            return this.waitFor((q) => {
                const element = WendigoUtils.queryElement(q);
                return !WendigoUtils.isVisible(element);
            }, timeout, selector).catch(() => {
                return Promise.reject(new TimeoutError("waitUntilNotVisible", `Waiting for element "${selector}" to not be visible`, timeout));
            });
        }

        waitForUrl(url, timeout = 500) {
            this._failIfNotLoaded("waitForUrl");
            return this.waitFor((expectedUrl) => {
                let currentUrl = window.location.href;
                if (currentUrl === "about:blank") currentUrl = null;
                return currentUrl === expectedUrl;
            }, timeout, url).catch(() => {
                return Promise.reject(new TimeoutError("waitForUrl", `Waiting for url "${url}"`, timeout));
            });
        }

        waitForRequest(url, timeout = 500) {
            this._failIfNotLoaded("waitForRequest");
            const waitForPromise = this.waitForNextRequest(url, timeout);

            const alreadyRequestsPromise = this.requests.filter.url(url).requests.then((requests) => {
                if (requests.length > 0) return Promise.resolve();
                else return Promise.reject();
            });

            return utils.promiseOr([alreadyRequestsPromise, waitForPromise]).catch(() => {
                return Promise.reject(new TimeoutError("waitForRequest", `Waiting for request "${url}"`, timeout));
            });
        }

        waitForResponse(url, timeout = 500) {
            this._failIfNotLoaded("waitForResponse");
            const waitForPromise = this.waitForNextResponse(url, timeout);

            const alreadyResponsePromise = this.requests.filter.url(url).requests.then((requests) => {
                const responded = requests.filter((request) => {
                    return Boolean(request.response());
                });
                if (responded.length > 0) return Promise.resolve();
                else return Promise.reject();
            });

            return utils.promiseOr([alreadyResponsePromise, waitForPromise]).catch(() => {
                return Promise.reject(new TimeoutError("waitForResponse", `Waiting for response "${url}"`, timeout));
            });
        }

        waitForNextRequest(url, timeout = 500) {
            this._failIfNotLoaded("waitForNextRequest");
            return this.page.waitForRequest(url, {
                timeout: timeout
            }).catch(() => {
                return Promise.reject(new TimeoutError("waitForNextRequest", `Waiting for request "${url}"`, timeout));
            });
        }

        waitForNextResponse(url, timeout = 500) {
            this._failIfNotLoaded("waitForNextResponse");
            return this.page.waitForResponse(url, {
                timeout: timeout
            }).catch(() => {
                return Promise.reject(new TimeoutError("waitForNextResponse", `Waiting for response "${url}"`, timeout));
            });
        }

        waitForNavigation(timeout = 500) {
            this._failIfNotLoaded("waitForNavigation");
            const t1 = new Date().getTime();
            return this.page.waitForNavigation({
                timeout: timeout
            }).then(() => {
                const t2 = new Date().getTime();
                const timeDiff = t2 - t1;
                let timeout2 = timeout - timeDiff;
                if (timeout2 <= 0) timeout2 = 10; // just in case
                return this.waitFor(() => {
                    return Boolean(window.WendigoUtils);
                }, timeout2);
            }).catch(() => {
                return Promise.reject(new TimeoutError("waitForNavigation", "", timeout));
            });
        }

        clickAndWaitForNavigation(selector, timeout = 500) {
            return Promise.all([
                this.waitForNavigation(timeout),
                this.click(selector)
            ]).then((res) => {
                return res[1];
            }).catch((err) => {
                return Promise.reject(WendigoError.overrideFnName(err, "clickAndWaitForNavigation"));
            });
        }

        waitForText(text, timeout = 500) {
            return this.waitFor((txt) => {
                const xpath = `//*[text()='${txt}']`; // NOTE: Duplicate of findByText
                return Boolean(WendigoUtils.xPathQuery(xpath).length > 0);
            }, timeout, text).catch(() => {
                return Promise.reject(new TimeoutError("waitForText", `Waiting for text "${text}"`, timeout));
            });
        }

        waitAndClick(selector, timeout = 500) {
            return this.waitFor(selector, timeout).then(() => {
                return this.click(selector);
            }).catch(() => {
                return Promise.reject(new TimeoutError("waitAndClick", "", timeout));
            });
        }

        waitUntilEnabled(selector, timeout = 500) {
            return this.waitFor((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return false;
                const value = element.getAttribute("disabled");
                return value === null;
            }, timeout, selector).catch(() => {
                return Promise.reject(new TimeoutError("waitUntilEnabled", `Waiting for element "${selector}" to be enabled`, timeout));
            });
        }
    };
};
