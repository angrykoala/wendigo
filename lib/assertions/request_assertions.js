/* global WendigoUtils */
"use strict";

const assert = require('assert');

module.exports = class RequestAssertions {

    constructor(browser) {
        this._requestSet = browser.requests.filter;
    }

    url(url, msg) {
        if(!msg) msg = `Filter by URL "${url}" has no matches`;
        assert(this._requestSet.url(url), msg);
        return this;
    }

    method(method, msg) {
        if(!msg) msg = `Filter by method "${method}" has no matches`;
        assert(this._requestSet.method(method), msg);
        return this;
    }

    resourceType(resourceType, msg) {
        if(!msg) msg = `Filter by resourceType "${resourceType}" has no matches`;
        assert(this._requestSet.resourceType(resourceType), msg);
        return this;
    }

    status(status, msg) {
        if(!msg) msg = `Filter by status "${status}" has no matches`;
        assert(this._requestSet.status(status), msg);
        return this;
    }

    fromCache(isFromCache = true, msg) {
        if(!msg) msg = `Filter by fromCache "${isFromCache}" has no matches`;
        assert(this._requestSet.fromCache(isFromCache), msg);
        return this;
    }

    headers(headers, msg) {
        if(!msg) msg = `Filter by headers "${headers}" has no matches`;
        assert(this._requestSet.headers(headers), msg);
        return this;
    }

    ok(isOk = true, msg) {
        if(!msg) msg = `Filter by ok "${isOk}" has no matches`;
        assert(this._requestSet.ok(isOk), msg);
        return this;
    }

    exists(number, msg) {
        const requestLength = this._requestSet.length;
        if(!msg) msg = `Expected ${number} requests, ${requestLength} found`;
        if(number === undefined) {
            assert(this._requestSet, msg);
        } else {
            assert.strictEqual(requestLength, number, msg);
        }
        return;
    }
};
