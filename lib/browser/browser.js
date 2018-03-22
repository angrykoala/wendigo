/* global WendigoUtils */
"use strict";

const path = require('path');
const BrowserAssertions = require('../assertions/browser_assertions');
const LocalStorageAssertions = require('../assertions/local_storage_assertions');
const BrowserLocalStorage = require('./browser_local_storage');
const BrowserBase = require('./browser_base');
const utils = require('../utils');

const injectionScriptsPath = path.join(__dirname, "../..", "injection_scripts");

const injectionScripts = ["selector_query.js", "wendigo_utils.js"];


module.exports = class Browser extends BrowserBase {

    constructor(page, settings) {
        super(page, settings);
        this.localStorage = new BrowserLocalStorage(this);
        this.assert = new BrowserAssertions(this);
        this.assert.localStorage = new LocalStorageAssertions(this);
    }

    open(url) {
        return this.page.goto(url).then(() => {
            return this.page.content().then((content) => {
                this._originalHtml = content;
                return this._addJsScripts();
            });
        });
    }

    close() {
        return this.page.close();
    }

    text(selector) {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const result = [];
            for(let i = 0;i < elements.length;i++) {
                result.push(elements[i].textContent);
            }
            return result;
        }, selector);
    }

    click(selector, index) {
        return this.queryAll(selector).then((elements) => {
            if(index !== undefined) {
                if(index > elements.length || index < 0) {
                    return Promise.reject(new Error(`browser.click, invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`));
                }
                elements[index].click();
                return 1;
            } else{
                if(elements.length <= 0) return Promise.reject(new Error(`No element "${selector}" found when trying to click.`));
                return Promise.all(elements.map((e) => e.click())).then(() => {
                    return elements.length;
                });
            }
        });
    }

    clickText(text) {
        return this.findByText(text).then((elements) => {
            if(elements.length <= 0) return Promise.reject(new Error(`No element with text "${text}" found when trying to click.`));
            return this.click(elements);
        });
    }

    title() {
        return this.page.title();
    }

    html() {
        return this._originalHtml;
    }

    url() {
        return this.evaluate(() => window.location.href).then((url) => {
            if(url === "about:blank") url = null;
            return url;
        });
    }

    wait(ms = 250) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    waitFor(selector, timeout = 500) {
        return this.page.waitForSelector(selector, {timeout: timeout, visible: true}).catch(() => {
            return Promise.reject(new Error(`Waiting for element "${selector}" failed, timeout of ${timeout}ms exceeded`));
        });
    }

    waitUntilNotVisible(selector, timeout = 500) {
        return this.page.waitForFunction((selector) => {
            const element = WendigoUtils.queryElement(selector);
            return !WendigoUtils.isVisible(element);
        }, {timeout: timeout}, selector).catch(() => {
            return Promise.reject(new Error(`Waiting for element "${selector}" not to be visible, timeout of ${timeout}ms exceeded`));
        });
    }

    findByText(text) {
        const xPath = `//*[text()='${text}']`;
        return this.queryXPath(xPath);
    }

    findByTextContaining(text) {
        const xPath = `//*[contains(text(),'${text}')]`;
        return this.queryXPath(xPath);
    }

    type(selector, text) {
        if(typeof selector === "string") {
            return this.page.type(selector, text);
        }else {
            return selector.type(text);
        }
    }

    keyPress(key) {
        if(!Array.isArray(key)) key = [key];
        const funcs = key.map(k => () => this.page.keyboard.press(k));
        return utils.promiseSerial(funcs).catch((err) => {
            return Promise.reject(new Error(err.message));
        });
    }

    uploadFile(selector, path) {
        return this.query(selector).then(fileInput => {
            if (fileInput) {
                return fileInput.uploadFile(path);
            } else {
                return Promise.reject(new Error(`Selector "${selector}" doesn't match any element.`));
            }
        });
    }

    select(selector, values) {
        if(!Array.isArray(values)) values = [values];
        return this.page.select(selector, ...values).catch(() => {
            return Promise.reject(new Error(`Element "${selector}" not found when trying to select value.`));
        });
    }

    clearValue(selector) {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            for(const element of elements) {
                element.value = "";
            }
        }, selector);
    }

    innerHtml(selector) {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return Array.from(elements).map(e => e.innerHTML);
        }, selector);
    }

    setValue(selector, value) {
        return this.evaluate((q, v) => {
            const elements = WendigoUtils.queryAll(q);
            if(elements.length === 0) return Promise.reject();
            for(const element of elements) {
                element.value = v;
            }
            return elements.length;
        }, selector, value).catch(() => {
            return Promise.reject(new Error(`Element "${selector}" not found when trying to set value "${value}".`));
        });
    }

    options(selector) {
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
            return Promise.reject(new Error(`Element "${selector}" not found when trying to get options.`));
        });
    }

    selectedOptions(selector) {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryElement(q);
            return Array.from(elements.options).filter((option) => {
                return option.selected;
            }).map((option) => {
                return option.value || option.text;
            });
        }, selector).catch(() => {
            return Promise.reject(new Error(`Element "${selector}" not found when trying to get selected options.`));
        });
    }

    _addJsScripts() {
        const promises = injectionScripts.map((s) => {
            return this.page.addScriptTag({path: path.join(injectionScriptsPath, s)});
        });
        return Promise.all(promises);
    }
};
