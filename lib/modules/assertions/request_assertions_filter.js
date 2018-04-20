"use strict";

const ErrorFactory = require('../../errors/error_factory');

module.exports = class RequestAssertionsFilter {
    constructor(requestFilter) {
        this._requestFilter = requestFilter;
    }

    url(expected, msg) {
        const urlFilter = this._requestFilter.url(expected);
        if(!msg) msg = `Expected request with url "${expected}" to exist.`;
        return this._assertFilter(urlFilter, msg);
    }

    method(expected, msg) {
        const methodFilter = this._requestFilter.method(expected);
        if(!msg) msg = `Expected request with method "${expected}" to exist.`;
        return this._assertFilter(methodFilter, msg);
    }

    status(expected, msg) {
        const statusFilter = this._requestFilter.status(expected);
        if(!msg) msg = `Expected request with status "${expected}" to exist.`;
        return this._assertFilter(statusFilter, msg);
    }

    responseHeaders(expected, msg) {
        const responseHeadersFilter = this._requestFilter.responseHeaders(expected);
        if(!msg) {
            const keys = Object.keys(expected);
            const expectedText = keys.map((k) => {
                return `${k}: ${expected[k]}`;
            }).join(", ");
            msg = `Expected response with headers "${expectedText}" to exist.`;
        }
        return this._assertFilter(responseHeadersFilter, msg);
    }

    ok(expected = true, msg) {
        const okFilter = this._requestFilter.ok(expected);
        if(!msg) msg = `Expected ${expected ? "" : "not"} ok request to exist.`;
        return this._assertFilter(okFilter, msg);
    }


    _assertFilter(filter, msg) {
        if(filter.requests.length > 0) return new RequestAssertionsFilter(filter);
        else throw ErrorFactory.generateAssertionError(msg);
    }

};
