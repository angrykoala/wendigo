/* global WendigoUtils */
"use strict";

const ErrorFactory = require('../errors/error_factory');
const DomElement = require('../models/dom_element');
const utils = require('../utils');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserActions extends s {
        type(selector, text) {
            this._failIfNotLoaded();
            if(typeof selector === "string") {
                return this.page.type(selector, text);
            } else if(selector instanceof DomElement) {
                return selector.element.type(text);
            } else return Promise.reject(ErrorFactory.generateFatalError(`Invalid selector on "browser.type".`));
        }

        keyPress(key) {
            this._failIfNotLoaded();
            if(!Array.isArray(key)) key = [key];
            const funcs = key.map(k => () => this.page.keyboard.press(k));
            return utils.promiseSerial(funcs).catch(() => {
                return Promise.reject(new Error(`Could not press keys "${key.join(", ")}"`));
            });
        }

        uploadFile(selector, path) {
            this._failIfNotLoaded();
            return this.query(selector).then(fileInput => {
                if (fileInput) {
                    return fileInput.element.uploadFile(path);
                } else {
                    const error = ErrorFactory.generateQueryError(`Selector "${selector}" doesn't match any element to upload file.`);
                    return Promise.reject(error);
                }
            });
        }

        select(selector, values) {
            this._failIfNotLoaded();
            if(!Array.isArray(values)) values = [values];
            return this.page.select(selector, ...values).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to select value.`);
                return Promise.reject(error);
            });
        }

        clearValue(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                for(const element of elements) {
                    element.value = "";
                }
            }, selector);
        }

        setValue(selector, value) {
            this._failIfNotLoaded();
            return this.evaluate((q, v) => {
                const elements = WendigoUtils.queryAll(q);
                if(elements.length === 0) return Promise.reject();
                for(const element of elements) {
                    element.value = v;
                }
                return elements.length;
            }, selector, value).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to set value "${value}".`);
                return Promise.reject(error);
            });
        }

        click(selector, index) {
            this._failIfNotLoaded();
            return this.queryAll(selector).then((elements) => {
                if(index !== undefined) {
                    if(index > elements.length || index < 0) {
                        const error = ErrorFactory.generateQueryError(`browser.click, invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`);
                        return Promise.reject(error);
                    }
                    elements[index].click();
                    return 1;
                } else{
                    if(elements.length <= 0) {
                        const error = ErrorFactory.generateQueryError(`No element "${selector}" found when trying to click.`);
                        return Promise.reject(error);
                    }
                    return Promise.all(elements.map((e) => e.click())).then(() => {
                        return elements.length;
                    });
                }
            });
        }

        clickText(text, optionalText) {
            this._failIfNotLoaded();
            return this.findByText(text, optionalText).then((elements) => {
                if(elements.length <= 0) {
                    const error = ErrorFactory.generateQueryError(`No element with text "${optionalText || text}" found when trying to click.`);
                    return Promise.reject(error);
                }
                return this.click(elements);
            });
        }

        check(selector) {
            this._failIfNotLoaded();
            return this.evaluate((selector) => {
                const element = WendigoUtils.queryElement(selector);
                if(!element) return Promise.reject();
                element.checked = true;
            }, selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to check.`);
                return Promise.reject(error);
            });
        }

        uncheck(selector) {
            this._failIfNotLoaded();
            return this.evaluate((selector) => {
                const element = WendigoUtils.queryElement(selector);
                if(!element) return Promise.reject();
                element.checked = false;
            }, selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to uncheck.`);
                return Promise.reject(error);
            });
        }

        focus(selector) {
            this._failIfNotLoaded();
            return this.page.focus(selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to focus.`);
                return Promise.reject(error);
            });
        }

        hover(selector) {
            this._failIfNotLoaded();
            return this.page.hover(selector).catch(() => {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to hover.`);
                return Promise.reject(error);
            });
        }

        scroll(value, xvalue) {
            this._failIfNotLoaded();
            return this.evaluate((value, xvalue) => {
                if(typeof value === 'number') {
                    if(typeof xvalue !== 'number') xvalue = window.scrollX;
                    window.scroll(xvalue, value);
                } else{
                    const element = WendigoUtils.queryElement(value);
                    element.scrollIntoView();
                }
            }, value, xvalue).catch(() => {
                return Promise.reject(ErrorFactory.generateQueryError(`Selector ".not-exists" doesn't match any element to scroll.`));
            });

        }
    };
};
