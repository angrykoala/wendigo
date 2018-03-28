/* global WendigoUtils */
"use strict";

const ErrorFactory = require('../errors/error_factory');

module.exports = function BrowserBaseMixin(s) {
    return class BrowserBase extends s {

        evaluate(cb, ...args) {
            this._failIfNotLoaded();
            return this.page.evaluate(cb, ...args);
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
