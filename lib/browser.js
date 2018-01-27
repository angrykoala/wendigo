/* global WendigoUtils */
"use strict";

const path = require('path');
const BrowserAssertions = require('./browser_assertions');
const BrowserBase = require('./browser_base');
const utils = require('./utils');

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
        return this.queryAll(selector).then((elements) => {
            return Array.from(elements).map(e => e.textContent);
        });
    }

    click(selector) {
        return this.page.click(selector);
    }

    title() {
        return this.page.title();
    }

    html() {
        return this._originalHtml;
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

        return this.page.evaluate((q) => {
            const xPathResult = WendigoUtils.xPathQuery(q);
            const parents = WendigoUtils.getParentNodes(xPathResult);
            return WendigoUtils.serializeNodeList(parents);
        }, xPath).then((res) => {
            return res.map(utils.parseDom);
        });
    }

    findByTextContaining(text) {
        const xPath = `//text()[contains(.,'${text}')]`;
        return this.page.evaluate((q) => {
            const xPathResult = WendigoUtils.xPathQuery(q);
            const parents = WendigoUtils.getParentNodes(xPathResult);
            return WendigoUtils.serializeNodeList(parents);
        }, xPath).then((res) => {
            return res.map(utils.parseDom);
        });
    }
};
