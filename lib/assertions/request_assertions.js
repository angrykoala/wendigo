/* global WendigoUtils */
"use strict";

const assert = require('assert');

class RequestAssertionsSet {
    constructor(requestAssertion) {
        this.requestAssertion = requestAssertion;
    }

    _getRequestSet() {
        return this.requestAssertion._browser.requests.all;
    }

    url(url, msg) {
        if(!msg) msg = `Filter by URL "${url}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().url(url).length, 0, msg);
        return this.requestAssertion;
    }

    method(method, msg) {
        if(!msg) msg = `Filter by method "${method}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().method(method).length, 0, msg);
        return this.requestAssertion;
    }

    resourceType(resourceType, msg) {
        if(!msg) msg = `Filter by resourceType "${resourceType}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().resourceType(resourceType).length, 0, msg);
        return this.requestAssertion;
    }

    status(status, msg) {
        if(!msg) msg = `Filter by status "${status}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().status(status).length, 0, msg);
        return this.requestAssertion;
    }

    fromCache(isFromCache = true, msg) {
        if(!msg) msg = `Filter by fromCache "${isFromCache}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().fromCache(isFromCache).length, 0, msg);
        return this.requestAssertion;
    }

    headers(headers, msg) {
        if(!msg) msg = `Filter by headers "${headers}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().headers(headers).length, 0, msg);
        return this.requestAssertion;
    }

    ok(isOk = true, msg) {
        if(!msg) msg = `Filter by ok "${isOk}" has no matches`;
        assert.notStrictEqual(this._getRequestSet().ok(isOk).length, 0, msg);
        return this.requestAssertion;
    }

}

module.exports = class RequestAssertions {

    constructor(browser) {
        this._browser = browser;
        this.requestAssertionSet = new RequestAssertionsSet(this);
    }

    get where() {
        return this.requestAssertionSet;
    }

    get and() {
        return this.requestAssertionSet;
    }

    exists(number, msg) {
        if(!msg) msg = `Mismatch in expected number of requests`;
        if(!number) {
            assert.notStrictEqual(this._browser.requests.all.length, 0, msg);
        } else {
            assert.strictEqual(this._browser.requests.all.length, number, msg);
        }
        return;
    }
};
