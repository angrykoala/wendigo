/* global WendigoUtils */
"use strict";

const ErrorFactory = require('../errors/error_factory');

module.exports = function BrowserInfo(s) {
    return class BrowserInfo extends s {

        text(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                const result = [];
                for(let i = 0;i < elements.length;i++) {
                    result.push(elements[i].textContent);
                }
                return result;
            }, selector);
        }

        title() {
            this._failIfNotLoaded();
            return this.page.title();
        }

        html() {
            this._failIfNotLoaded();
            return this._originalHtml;
        }

        url() {
            this._failIfNotLoaded();
            return this.evaluate(() => window.location.href).then((url) => {
                if(url === "about:blank") url = null;
                return url;
            });
        }

        innerHtml(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                return Array.from(elements).map(e => e.innerHTML);
            }, selector);
        }

        options(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if(!element) return Promise.reject();
                const options = element.options || [];
                const result = [];
                for(const o of options) {
                    result.push(o.value);
                }
                return result;
            }, selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get options.`);
                return Promise.reject(error);
            });
        }

        selectedOptions(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryElement(q);
                return Array.from(elements.options).filter((option) => {
                    return option.selected;
                }).map((option) => {
                    return option.value || option.text;
                });
            }, selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get selected options.`);
                return Promise.reject(error);
            });
        }

        class(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if(!element) throw new Error();
                else return Array.from(element.classList);
            }, selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Selector "${selector}" doesn't match any elements when trying to get classes.`);
                return Promise.reject(error);
            });
        }

        value(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if(!element) return null;
                else if(element.value === undefined) return null;
                else return element.value;
            }, selector);
        }

        attribute(selector, attributeName) {
            this._failIfNotLoaded();
            return this.evaluate((q, attributeName) => {
                const element = WendigoUtils.queryElement(q);
                if(!element) return Promise.reject();
                return element.getAttribute(attributeName);
            }, selector, attributeName).catch(() => { // To avoid Error: Evaluation Failed
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get attribute "${attributeName}".`);
                return Promise.reject(error);
            });
        }

        styles(selector) {
            this._failIfNotLoaded();
            return this.evaluate((selector) => {
                const element = WendigoUtils.queryElement(selector);
                if(!element) return Promise.reject();
                return WendigoUtils.getStyles(element);
            }, selector).catch(() => { // To avoid Error: Evaluation Failed
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get styles.`);
                return Promise.reject(error);
            });
        }
    };
};
