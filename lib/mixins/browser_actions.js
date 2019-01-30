/* global WendigoUtils */
"use strict";

const DomElement = require('../models/dom_element');
const utils = require('../utils/utils');
const {FatalError, QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserActions extends s {
        type(selector, text, options = {}) {
            this._failIfNotLoaded();
            if (typeof selector === "string") {
                return this.page.type(selector, text, {delay: options.delay || 0});
            } else if (selector instanceof DomElement) {
                return selector.element.type(text);
            } else return Promise.reject(new FatalError(`Invalid selector on "browser.type".`));
        }

        keyPress(key, count = 1) {
            this._failIfNotLoaded();
            if (!Array.isArray(key)) key = [key];
            const funcs = key.map(k => () => this.page.keyboard.press(k));
            let funcsFinal = [];
            for (let i = 0; i < count; i++) {
                funcsFinal = funcsFinal.concat(funcs);
            }
            return utils.promiseSerial(funcsFinal).catch(() => {
                return Promise.reject(new Error(`Could not press keys "${key.join(", ")}"`));
            });
        }

        uploadFile(selector, path) {
            this._failIfNotLoaded();
            return this.query(selector).then(fileInput => {
                if (fileInput) {
                    return fileInput.element.uploadFile(path);
                } else {
                    const error = new QueryError(`Selector "${selector}" doesn't match any element to upload file.`);
                    return Promise.reject(error);
                }
            });
        }

        select(selector, values) {
            this._failIfNotLoaded();
            if (!Array.isArray(values)) values = [values];
            return this.page.select(selector, ...values).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to select value.`);
                return Promise.reject(error);
            });
        }

        clearValue(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                for (const element of elements) {
                    element.value = "";
                }
            }, selector);
        }

        setValue(selector, value) {
            this._failIfNotLoaded();
            return this.evaluate((q, v) => {
                const elements = WendigoUtils.queryAll(q);
                if (elements.length === 0) return Promise.reject();
                for (const element of elements) {
                    element.value = v;
                }
                return elements.length;
            }, selector, value).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to set value "${value}".`);
                return Promise.reject(error);
            });
        }

        check(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = true;
            }, selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to check.`);
                return Promise.reject(error);
            });
        }

        uncheck(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = false;
            }, selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to uncheck.`);
                return Promise.reject(error);
            });
        }

        focus(selector) {
            this._failIfNotLoaded();
            return this.page.focus(selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to focus.`);
                return Promise.reject(error);
            });
        }

        hover(selector) {
            this._failIfNotLoaded();
            return this.page.hover(selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to hover.`);
                return Promise.reject(error);
            });
        }

        scroll(value, xvalue) {
            this._failIfNotLoaded();
            return this.evaluate((val, xval) => {
                if (typeof val === 'number') {
                    if (typeof xval !== 'number') xval = window.scrollX;
                    window.scroll(xval, val);
                } else {
                    const element = WendigoUtils.queryElement(val);
                    element.scrollIntoView();
                }
            }, value, xvalue).catch(() => {
                return Promise.reject(new QueryError(`Selector ".not-exists" doesn't match any element to scroll.`));
            });
        }

        // async dragAndDrop(from, to) {
        //     const fromElement = await this.query(from);
        //     const toElement = await this.query(to);
        //     const boxFrom = await fromElement.element.boundingBox();
        //     const boxTo = await toElement.element.boundingBox();
        //     const mouse = this.page.mouse;
        //     await mouse.up();
        //     await mouse.move(boxFrom.x + (boxFrom.width / 2), boxFrom.y + (boxFrom.height / 2));
        //     await mouse.down();
        //     await mouse.move(boxTo.x + (boxTo.width / 2), boxTo.y + (boxTo.height / 2));
        //     await mouse.up();
        // }
    };
};
