"use strict";

const RequestSet = require('./request_set');

module.exports = class BrowserInterceptor {
    constructor(page) {
        this._requests = new RequestSet();
        page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            this._requests.push(interceptedRequest);
            interceptedRequest.continue();
        });
    }

    get all() {
        return this._requests;
    }

    get filter() {
        return this._requests;
    }

    clear() {
        this._requests = new RequestSet();
    }
};

