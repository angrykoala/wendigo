/* global WendigoUtils */
"use strict";
const utils = require('./utils');

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
        return this.page.evaluate((q) => {
            const element = document.querySelector(q);
            return WendigoUtils.serializeDom(element);
        }, selector).then((res) => {
            return utils.parseDom(res);
        });
    }

    queryAll(selector) {
        return this.page.evaluate((q) => {
            const rawElements = document.querySelectorAll(q);
            return WendigoUtils.serializeNodeList(rawElements);
        }, selector).then((res) => {
            return res.map(utils.parseDom);
        });
    }

    queryXPath(xPath) {
        return this.page.evaluate((q) => {
            const xPathResult = WendigoUtils.xPathQuery(q);
            return WendigoUtils.serializeNodeList(xPathResult);
        }, xPath).then((res) => {
            return res.map(utils.parseDom);
        });
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
