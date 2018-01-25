/* global WendigoUtils */
"use strict";
const utils = require('./utils');

function pageLog(msg) {
    console.log("Page Error",msg); // eslint-disable-line
}

module.exports = class BrowserBase {
    constructor(page, settings) {
        this.page = page;
        if(settings.log) {
            this.page.on("onConsoleMessage", pageLog);
            this.page.on('onError', pageLog);
            this.page.on('onResourceError', pageLog);
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

};
