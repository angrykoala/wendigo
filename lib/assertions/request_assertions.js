/* global WendigoUtils */
"use strict";

const assert = require('assert');

<<<<<<< HEAD
module.exports = class RequestAssertions {

    constructor(browser) {
        this.requestSet = browser.requests.all;
=======
class RequestAssertionsSet {
    constructor(requestAssertion) {
        this.requestAssertion = requestAssertion;
    }

    _getRequestSet() {
        return this.requestAssertion._browser.requests.all;
>>>>>>> 56a40fe... Add requests assertions
    }

    url(url, msg) {
        if(!msg) msg = `Filter by URL "${url}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.url(url).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().url(url).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    method(method, msg) {
        if(!msg) msg = `Filter by method "${method}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.method(method).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().method(method).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    resourceType(resourceType, msg) {
        if(!msg) msg = `Filter by resourceType "${resourceType}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.resourceType(resourceType).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().resourceType(resourceType).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    status(status, msg) {
        if(!msg) msg = `Filter by status "${status}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.status(status).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().status(status).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    fromCache(isFromCache = true, msg) {
        if(!msg) msg = `Filter by fromCache "${isFromCache}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.fromCache(isFromCache).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().fromCache(isFromCache).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    headers(headers, msg) {
        if(!msg) msg = `Filter by headers "${headers}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.headers(headers).length, 0, msg);
        return this;
=======
        assert.notStrictEqual(this._getRequestSet().headers(headers).length, 0, msg);
        return this.requestAssertion;
>>>>>>> 56a40fe... Add requests assertions
    }

    ok(isOk = true, msg) {
        if(!msg) msg = `Filter by ok "${isOk}" has no matches`;
<<<<<<< HEAD
        assert.notStrictEqual(this.requestSet.ok(isOk).length, 0, msg);
        return this;
=======
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
>>>>>>> 56a40fe... Add requests assertions
    }

    exists(number, msg) {
        if(!msg) msg = `Mismatch in expected number of requests`;
        if(!number) {
<<<<<<< HEAD
            assert.notStrictEqual(this.requestSet.length, 0, msg);
        } else {
            assert.strictEqual(this.requestSet.length, number, msg);
=======
            assert.notStrictEqual(this._browser.requests.all.length, 0, msg);
        } else {
            assert.strictEqual(this._browser.requests.all.length, number, msg);
>>>>>>> 56a40fe... Add requests assertions
        }
        return;
    }
};
