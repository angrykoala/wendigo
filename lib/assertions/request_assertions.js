/* global WendigoUtils */
"use strict";

const assert = require('assert');

module.exports = class RequestAssertions {

    constructor(browser) {
        this.requestSet = browser.requests.all;
    }

    url(url, msg) {
        if(!msg) msg = `Filter by URL "${url}" has no matches`;
        assert.notStrictEqual(this.requestSet.url(url).length, 0, msg);
        return this;
    }

    method(method, msg) {
        if(!msg) msg = `Filter by method "${method}" has no matches`;
        assert.notStrictEqual(this.requestSet.method(method).length, 0, msg);
        return this;
    }

    resourceType(resourceType, msg) {
        if(!msg) msg = `Filter by resourceType "${resourceType}" has no matches`;
        assert.notStrictEqual(this.requestSet.resourceType(resourceType).length, 0, msg);
        return this;
    }

    status(status, msg) {
        if(!msg) msg = `Filter by status "${status}" has no matches`;
        assert.notStrictEqual(this.requestSet.status(status).length, 0, msg);
        return this;
    }

    fromCache(isFromCache = true, msg) {
        if(!msg) msg = `Filter by fromCache "${isFromCache}" has no matches`;
        assert.notStrictEqual(this.requestSet.fromCache(isFromCache).length, 0, msg);
        return this;
    }

    headers(headers, msg) {
        if(!msg) msg = `Filter by headers "${headers}" has no matches`;
        assert.notStrictEqual(this.requestSet.headers(headers).length, 0, msg);
        return this;
    }

    ok(isOk = true, msg) {
        if(!msg) msg = `Filter by ok "${isOk}" has no matches`;
        assert.notStrictEqual(this.requestSet.ok(isOk).length, 0, msg);
        return this;
    }
};
