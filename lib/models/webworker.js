"use strict";

module.exports = class WebWoker {
    constructor(ww) {
        this.worker = ww;
    }

    get url() {
        return this.worker.url();
    }
};
