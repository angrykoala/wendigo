/* global GhoulUtils */
"use strict";
const utils = require('./utils');

module.exports = class BrowserBase {
    constructor(page, settings) {
        this.page = page;
        if(settings.log) {
            this.page.on("onConsoleMessage", function (msg) {// eslint-disable-line
                console.log(msg);// eslint-disable-line
            });
        }
    }

    query(selector) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            const element = document.querySelector(q);
            return GhoulUtils.serializeDom(element);
        }, selector).then((res) => {
            return utils.parseDom(res);
        });
    }

    queryAll(selector) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            const rawElements = document.querySelectorAll(q);
            return GhoulUtils.serializeNodeList(rawElements);
        }, selector).then((res) => {
            return res.map(utils.parseDom);
        });
    }

};
