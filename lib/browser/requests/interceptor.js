"use strict";

const RequestSet = require('./request_set');

module.exports = class BrowserRequestsInterceptor {
    constructor(page) {
        this.clear();
        page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            this._requests._requests.push(interceptedRequest);
            interceptedRequest.continue();
        });
    }

    get all() {
        return this._requests._requests;
    }

    get filter() {
        return this._requests;
    }

    clear() {
        this._requests = new RequestSet();
    }
};

