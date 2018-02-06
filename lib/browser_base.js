"use strict";

function pageLogError(msg) {
    console.error("Page Error", msg);
}

module.exports = class BrowserBase {
    constructor(page, settings) {
        this.page = page;
        if(settings.log) {
            this.page.on("onConsoleMessage", pageLogError);
            this.page.on('onError', pageLogError);
            this.page.on('onResourceError', pageLogError);
        }
    }

    query(selector) {
        return this.page.$(selector);
    }

    queryAll(selector) {
        return this.page.$$(selector);
    }

    queryXPath(xPath) {
        return this.page.$x(xPath);
    }

    class(selector) {
        return this.page.evaluate((q) => {
            const element = document.querySelector(q);
            if(!element) return [];
            else return Array.from(element.classList);
        }, selector);
    }

    value(selector) {
        return this.page.evaluate((q) => {
            const element = document.querySelector(q);
            if(!element) return null;
            else if(element.value === undefined) return null;
            else return element.value;
        }, selector);
    }
};
