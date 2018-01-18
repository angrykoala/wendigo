"use strict";

module.exports = class Browser {
    constructor(page) {
        this.page = page;
    }

    open(url) {
        return this.page.open(url);
    }

    getElement(query) {
        return this.page.evaluate(function(q){ // eslint-disable-line
            return document.querySelector(q);
        }, query);
    }

    html() {
        return this.page.property('content');
    }

};
