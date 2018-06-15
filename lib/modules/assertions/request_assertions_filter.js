"use strict";

const ErrorFactory = require('../../errors/error_factory');
const utils = require('../../utils');

module.exports = class RequestAssertionsFilter extends Promise {
    constructor(executor, requestFilter) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });

        this._requestFilter = requestFilter;
    }


    //
    // then(onFulfilled, onRejected) {
    // // before
    //     const returnValue = super.then(onFulfilled, onRejected);
    //     // after
    //     return returnValue;
    // }

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

    postBody(expected, msg) {
        const bodyFilter = this._requestFilter.postBody(expected);
        if(!msg) {
            const expectedString = utils.stringify(expected);
            msg = `Expected request with body "${expectedString}" to exist.`;
        }
        return this._assertFilter(bodyFilter, msg);
    }

    responseBody(expected, msg) {
        const responseBodyFilter = this._requestFilter.responseBody(expected);
        if(!msg) {
            const expectedString = utils.stringify(expected);
            msg = `Expected request with response body "${expectedString}" to exist.`;
        }
        return this._assertFilter(responseBodyFilter, msg);
    }

    _assertFilter(filter, msg) {
        return new RequestAssertionsFilter((resolve, reject) => {
            return this.then(() => {
                return filter.requests.then((reqs) => {
                    if(reqs.length > 0) resolve();
                    else {
                        const err = ErrorFactory.generateAssertionError(msg);
                        reject(err);
                    }
                });
            }).catch((err) => {
                reject(err);
            });
        }, filter);
    }
};
