"use strict";


module.exports = class BrowserBase {
    constructor(page) {
        this.page = page;
    }

    query(selector) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            return document.querySelector(q);
        }, selector);
    }

    queryAll(selector) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            return document.querySelectorAll(q);
        }, selector);
    }

};
