/* global GhoulUtils */
"use strict";

const BrowserAssertions = require('./browser_assertions');
const BrowserBase = require('./browser_base');
const utils = require('./utils');

module.exports = class Browser extends BrowserBase {
    constructor(page, settings) {
        super(page, settings);
        this.assert = new BrowserAssertions(this);
    }

    open(url) {
        return this.page.open(url).then(() => {
            return this.page.injectJs("injection_scripts/ghoul_utils.js");
        });
    }

    text(selector) {
        return this.queryAll(selector).then((elements) => {
            return Array.from(elements).map(e => e.textContent);
        });
    }

    click(selector) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            const elements = document.querySelectorAll(q); // eslint-disable-line
            for(var i=0; i<elements.length; i++){ // eslint-disable-line
                GhoulUtils.click(elements[i]);
            }
        }, selector);
    }

    title() {
        return this.page.property('title');
    }

    html() {
        return this.page.property('content');
    }

    wait(ms = 250) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    findByText(text) {
        const xPath = `//text()[. = '${text}']`;

        return this.page.evaluate(function(q){// eslint-disable-line
            const xPathResult = GhoulUtils.xPathQuery(q);
            const parents = GhoulUtils.getParentNodes(xPathResult);
            return GhoulUtils.serializeNodeList(parents);
        }, xPath).then((res) => {
            return res.map(utils.parseDom);
        });
    }

    findByTextContaining(text) {
        const xPath = `//text()[contains(.,'${text}')]`;
        return this.page.evaluate(function(q){// eslint-disable-line
            const xPathResult = GhoulUtils.xPathQuery(q);
            const parents = GhoulUtils.getParentNodes(xPathResult);
            return GhoulUtils.serializeNodeList(parents);
        }, xPath).then((res) => {
            return res.map(utils.parseDom);
        });
    }

    waitFor(selector, timeout = 500) {
        const timeResolution = 50;
        const timeoutTime = new Date().getTime() + timeout;
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const currentTime = new Date().getTime();
                if(currentTime + timeResolution >= timeoutTime) {
                    clearInterval(interval);
                    reject("Wait For Timeout");
                } else{
                    this.query(selector).then((element) => {
                        if(element) {
                            clearInterval(interval);
                            resolve();
                        }
                    });
                }
            }, timeResolution);
        });
    }
};
