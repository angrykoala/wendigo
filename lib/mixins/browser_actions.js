/* global WendigoUtils */
"use strict";

const DomElement = require('../models/dom_element');
const utils = require('../utils/utils');
const {FatalError, QueryError, WendigoError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserActions extends s {
        type(selector, text, options = {}) {
            this._failIfNotLoaded("type");
            if (typeof selector === "string") {
                return this.page.type(selector, text, {delay: options.delay || 0});
            } else if (selector instanceof DomElement) {
                return selector.element.type(text);
            } else return Promise.reject(new FatalError("type", `Invalid selector on "browser.type".`));
        }

        keyPress(key, count = 1) {
            this._failIfNotLoaded("keyPress");
            if (!Array.isArray(key)) key = [key];
            const funcs = key.map(k => () => this.page.keyboard.press(k));
            let funcsFinal = [];
            for (let i = 0; i < count; i++) {
                funcsFinal = funcsFinal.concat(funcs);
            }
            return utils.promiseSerial(funcsFinal).catch(() => {
                return Promise.reject(new WendigoError("keyPress", `Could not press keys "${key.join(", ")}"`));
            });
        }

        uploadFile(selector, path) {
            this._failIfNotLoaded("uploadFile");
            return this.query(selector).then(fileInput => {
                if (fileInput) {
                    return fileInput.element.uploadFile(path);
                } else {
                    const error = new QueryError("uploadFile", `Selector "${selector}" doesn't match any element to upload file.`);
                    return Promise.reject(error);
                }
            });
        }

        select(selector, values) {
            this._failIfNotLoaded("select");
            if (!Array.isArray(values)) values = [values];
            return this.page.select(selector, ...values).catch(() => {
                const error = new QueryError("select", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        clearValue(selector) {
            this._failIfNotLoaded("clearValue");
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                for (const element of elements) {
                    element.value = "";
                }
            }, selector);
        }

        setValue(selector, value) {
            this._failIfNotLoaded("setValue");
            return this.evaluate((q, v) => {
                const elements = WendigoUtils.queryAll(q);
                if (elements.length === 0) return Promise.reject();
                for (const element of elements) {
                    element.value = v;
                }
                return elements.length;
            }, selector, value).catch(() => {
                const error = new QueryError("setValue", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        check(selector) {
            this._failIfNotLoaded("check");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = true;
            }, selector).catch(() => {
                const error = new QueryError("check", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        uncheck(selector) {
            this._failIfNotLoaded("uncheck");
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = false;
            }, selector).catch(() => {
                const error = new QueryError("uncheck", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        focus(selector) {
            this._failIfNotLoaded("focus");
            return this.page.focus(selector).catch(() => {
                const error = new QueryError("focus", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        hover(selector) {
            this._failIfNotLoaded("hover");
            return this.page.hover(selector).catch(() => {
                const error = new QueryError("hover", `Element "${selector}" not found.`);
                return Promise.reject(error);
            });
        }

        scroll(value, xvalue) {
            this._failIfNotLoaded("scroll");
            return this.evaluate((val, xval) => {
                if (typeof val === 'number') {
                    if (typeof xval !== 'number') xval = window.scrollX;
                    window.scroll(xval, val);
                } else {
                    const element = WendigoUtils.queryElement(val);
                    element.scrollIntoView();
                }
            }, value, xvalue).catch(() => { // FIXME
                return Promise.reject(new QueryError("scroll", `Selector "${value}" doesn't match any element to scroll.`));
            });
        }

        screenshot(...args) {
            this._failIfNotLoaded("screenshot");
            return this.page.screenshot(...args);
        }

        async screenshotOfElement(selector, options) {
            this._failIfNotLoaded("screenshotOfElement");
            const element = await this.query(selector);
            if (!element) throw new QueryError("screenshotOfElement", `Selector "${selector}" not found.`);
            return element.element.screenshot(options);
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
