/* global WendigoUtils */
"use strict";

const path = require('path');
const BrowserAssertions = require('./browser_assertions');
const BrowserBase = require('./browser_base');

module.exports = class Browser extends BrowserBase {
    constructor(page, settings) {
        super(page, settings);
        this.assert = new BrowserAssertions(this);
    }

    get frame() {
        return this.page.mainFrame();
    }

    open(url) {
        return this.page.goto(url).then(() => {
            return this.page.content().then((content) => {
                this._originalHtml = content;
                return this.page.addScriptTag({path: path.join(__dirname, "..", "injection_scripts/wendigo_utils.js")});
            });
        });
    }

    close() {
        return this.page.close();
    }

    text(selector) {
        return this.page.evaluate((q) => {
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
                return elements[index].click();
            } else{
                return Promise.all(elements.map((e) => e.click()));
            }
        });
    }

    title() {
        return this.page.title();
    }

    html() {
        return this._originalHtml;
    }

    url() {
        let url = this.page.url();
        if(url === "about:blank") url = null;
        return Promise.resolve(url);
    }

    wait(ms = 250) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    waitFor(selector, timeout = 500) {
        return this.frame.waitForSelector(selector, {timeout: timeout});
    }

    findByText(text) {
        const xPath = `//text()[. = '${text}']`;
        return this.queryXPath(xPath);
    }

    findByTextContaining(text) {
        const xPath = `//text()[contains(.,'${text}')]`;
        return this.queryXPath(xPath);
    }

    type(selector, text) {
        return this.page.type(selector, text);
    }

    clearValue(selector) {
        return this.page.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            for(const element of elements) {
                element.value = "";
            }
        }, selector);
    }
};
