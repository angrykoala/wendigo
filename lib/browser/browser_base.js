/* global WendigoUtils */
"use strict";

function pageLog(log) {
    console[log._type](log._text); // eslint-disable-line
}

module.exports = class BrowserBase {
    constructor(page, settings) {
        this.page = page;
        if(settings.log) {
            this.page.on("console", pageLog);
        }
    }

    query(selector) {
        if(typeof selector === 'string') {
            return this.page.$(selector);
        } else return Promise.resolve(selector);
    }

    queryAll(selector) {
        if(typeof selector === 'string') {
            return this.page.$$(selector);
        } else if(!Array.isArray(selector)) {
            return Promise.resolve([selector]);
        } else return Promise.resolve(selector);
    }

    queryXPath(xPath) {
        return this.page.$x(xPath);
    }

    class(selector) {
        return this.page.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) return [];
            else return Array.from(element.classList);
        }, selector);
    }

    value(selector) {
        return this.page.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) return null;
            else if(element.value === undefined) return null;
            else return element.value;
        }, selector);
    }

    attribute(selector, attributeName) {
        return this.page.evaluate((q, attributeName) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) return Promise.reject();
            return element.getAttribute(attributeName);
        }, selector, attributeName).catch(() => { // To avoid Error: Evaluation Failed
            return Promise.reject(new Error(`Element "${selector}" not found when trying to get attribute "${attributeName}".`));
        });
    }

    styles(selector, pseudoSelector) {
        return this.page.evaluate((selector, pseudoSelector) => {
            const element = WendigoUtils.queryElement(selector);
            if(!element) return Promise.reject();
            return WendigoUtils.getStyles(element, pseudoSelector);
        }, selector, pseudoSelector).catch(() => { // To avoid Error: Evaluation Failed
            return Promise.reject(new Error(`Element "${selector}" not found when trying to get styles.`));
        });
    }
};
