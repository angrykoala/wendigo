"use strict";

const EventEmitter = require('events');
const URL = require('url').URL;

const RequestFilter = require('../modules/requests/request_filter');
const {FatalError, AssertionError, TimeoutError} = require('../errors');
const utils = require('../utils');


module.exports = class RequestMock {
    constructor(url, options) {
        this._setURL(url);
        this._response = {
            status: options.status,
            headers: options.headers,
            contentType: options.contentType,
            body: this._processBody(options.body)
        };
        this.delay = options.delay || 0;
        this.method = options.method;
        if (options.queryString || typeof options.queryString === "string") this.queryString = utils.parseQueryString(options.queryString);
        this._auto = options.auto !== false;
        this._requestsReceived = [];
        this._events = new EventEmitter();
        this._redirectTo = options.redirectTo ? new URL(options.redirectTo) : undefined;
    }

    get called() {
        return this.timesCalled > 0;
    }

    get timesCalled() {
        return this._requestsReceived.length;
    }

    get response() {
        return this._response;
    }

    get assert() {
        return {
            called: this._assertCalled.bind(this),
            postBody: this._assertPostBody.bind(this)
        };
    }

    get immediate() {
        return this.delay === 0;
    }

    get auto() {
        return this._auto;
    }

    trigger() {
        if (this.auto) throw new FatalError(`Cannot trigger auto request mock.`);
        this._events.emit("respond");
    }

    waitUntilCalled(timeout = 500) {
        if (this.called) return Promise.resolve();
        return new Promise((resolve, reject) => {
            let rejected = false;
            const tid = setTimeout(() => {
                rejected = true;
                reject(new TimeoutError(`Wait until mock of "${this.url}" is called`, timeout));
            }, timeout);
            this._events.once("on-request", () => {
                if (!rejected) {
                    clearTimeout(tid);
                    resolve();
                }
            });
        });
    }

    onRequest(request) {
        this._requestsReceived.push(request);

        if (this.auto && this.immediate) {
            return this._respondRequest(request);
        } else if (this.auto) {
            return utils.delay(this.delay).then(() => {
                return this._respondRequest(request);
            });
        } else {
            this._onTrigger(() => {
                return this._respondRequest(request);
            });
        }
    }

    _respondRequest(request) {
        setTimeout(() => {
            this._events.emit("on-request");
        }, 1);
        if (this._redirectTo) {
            const url = new URL(request.url());
            let qs = url.searchParams.toString();
            if (qs) qs = `?${qs}`;
            return request.continue({
                url: `${this._redirectTo.origin}${this._redirectTo.pathname}${qs || ""}`
            });
        } else return request.respond(this.response);
    }

    _assertCalled(times, msg) {
        if (typeof times === 'number') {
            if (times !== this.timesCalled) {
                if (!msg) msg = `Mock of ${this.url} not called ${times} times.`;
                throw new AssertionError(msg, this.timesCalled, times);
            }
        } else if (!this.called) {
            if (!msg) msg = `Mock of ${this.url} not called.`;
            throw new AssertionError(msg);
        }
    }

    _onTrigger(cb) {
        this._events.once("respond", cb);
    }

    _assertPostBody(expected, msg) {
        const filter = new RequestFilter(Promise.resolve(this._requestsReceived)).postBody(expected);
        return filter.requests.then((filteredRequests) => {
            if (filteredRequests.length === 0) {
                if (!msg) {
                    msg = `Expected mock to be called with body "${utils.stringify(expected)}".`;
                }
                return Promise.reject(new AssertionError(msg));
            }
        });
    }

    _processBody(rawBody) {
        if (typeof rawBody === "object") {
            return JSON.stringify(rawBody);
        } else return rawBody;
    }

    _setURL(url) {
        if (url instanceof RegExp) {
            this.url = url;
        } else {
            url = new URL(url);
            this.url = `${url.origin}${url.pathname}`;
            if (url.search) {
                this.queryString = utils.parseQueryString(url);
            }
        }
    }
};
