/* global WendigoUtils */
"use strict";

const {QueryError} = require('../errors');

module.exports = function BrowserInfoMixin(s) {
    return class BrowserInfo extends s {
        text(selector) {
            this._failIfNotLoaded("text");
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                const result = [];
                for (let i = 0; i < elements.length; i++) {
                    result.push(elements[i].textContent);
                }
                return result;
            }, selector);
        }

        title() {
            this._failIfNotLoaded("title");
            return this.page.title();
        }

        html() {
            this._failIfNotLoaded("html");
            return this._originalHtml;
        }

        url() {
            this._failIfNotLoaded("url");
            return this.evaluate(() => window.location.href).then((url) => {
                if (url === "about:blank") url = null;
                return url;
            });
        }

        tag(selector) {
            this._failIfNotLoaded("tag");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return null;
                else return element.tagName.toLowerCase();
            }, selector);
        }

        innerHtml(selector) {
            this._failIfNotLoaded("innerHtml");
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                return Array.from(elements).map(e => e.innerHTML);
            }, selector);
        }

        options(selector) {
            this._failIfNotLoaded("options");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                const options = element.options || [];
                const result = [];
                for (const o of options) {
                    result.push(o.value);
                }
                return result;
            }, selector).catch(() => {
                const error = new QueryError("options", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        selectedOptions(selector) {
            this._failIfNotLoaded("selectedOptions");
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryElement(q);
                return Array.from(elements.options).filter((option) => {
                    return option.selected;
                }).map((option) => {
                    return option.value || option.text;
                });
            }, selector).catch(() => {
                const error = new QueryError("selectedOptions", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        class(selector) {
            this._failIfNotLoaded("class");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) throw new Error();
                else return Array.from(element.classList);
            }, selector).catch(() => {
                const error = new QueryError("class", `Selector "${selector}" doesn't match any elements.`);
                return Promise.reject(error);
            });
        }

        value(selector) {
            this._failIfNotLoaded("value");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return null;
                else if (element.value === undefined) return null;
                else return element.value;
            }, selector);
        }

        attribute(selector, attributeName) {
            this._failIfNotLoaded("attribute");
            return this.evaluate((q, attr) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return element.getAttribute(attr);
            }, selector, attributeName).catch(() => { // To avoid Error: Evaluation Failed
                const error = new QueryError("attribute", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        styles(selector) {
            this._failIfNotLoaded("styles");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return WendigoUtils.getStyles(element);
            }, selector).catch(() => { // To avoid Error: Evaluation Failed
                const error = new QueryError("styles", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        style(selector, styleName) {
            this._failIfNotLoaded("style");
            return this.styles(selector).then((styles) => {
                return styles[styleName];
            }).catch(() => {
                const error = new QueryError("style", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        checked(selector) {
            this._failIfNotLoaded("checked");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return element.checked;
            }, selector).catch(() => {
                const error = new QueryError("checked", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }
    };
};
