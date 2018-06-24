"use strict";

const EventEmitter = require('events');
const URL = require('url').URL;
const querystring = require('querystring');

const ErrorFactory = require('./errors/error_factory');
const utils = require('./utils');


function parseQueryString(qs) {
    if(typeof qs === 'string') {
        return querystring.parse(qs);
    } else if(qs instanceof URL) {
        qs = qs.searchParams.toString();
        return querystring.parse(qs);
    } else return qs;
}

class RequestMock {
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
        if(options.queryString || typeof options.queryString === "string") this.queryString = parseQueryString(options.queryString);
        this._auto = options.auto !== false;
        this._timesCalled = 0;
        this._events = new EventEmitter();
    }

    get called() {
        return this._timesCalled > 0;
    }

    get timesCalled() {
        return this._timesCalled;
    }

    get response() {
        return this._response;
    }

    get assert() {
        return {
            called: this._assertCalled.bind(this)
        };
    }

    get immediate() {
        return this.delay === 0;
    }

    get auto() {
        return this._auto;
    }

    onTrigger(cb) {
        this._events.once("respond", cb);
    }

    trigger() {
        if(this.auto) throw ErrorFactory.generateFatalError(`Cannot trigger auto request mock.`);
        this._events.emit("respond");
    }

    increaseCalled() {
        this._timesCalled++;
    }

    _assertCalled(times, msg) {
        if(typeof times === 'number') {
            if(times !== this._timesCalled) {
                if(!msg) msg = `Mock of ${this.url} not called ${times} times.`;
                throw ErrorFactory.generateAssertionError(msg, this._timesCalled, times);
            }
        } else if(!this.called) {
            if(!msg) msg = `Mock of ${this.url} not called.`;
            throw ErrorFactory.generateAssertionError(msg);
        }
    }

    _processBody(rawBody) {
        if(typeof rawBody === "object") {
            return JSON.stringify(rawBody);
        } else return rawBody;
    }

    _setURL(url) {
        if(url instanceof RegExp) {
            this.url = url;
        } else {
            url = new URL(url);
            this.url = `${url.origin}${url.pathname}`;
            if(url.search) {
                this.queryString = parseQueryString(url);
            }
        }
    }
}


module.exports = class RequestMocker {
    constructor() {
        this._mockedRequests = [];
    }

    getMockedResponse(request) {
        const url = new URL(request.url());
        const method = request.method();
        const mock = this._getMock(`${url.origin}${url.pathname}`, {
            method: method,
            queryString: url.search ? parseQueryString(url) : undefined
        });
        if(mock) { // TODO: move this to request ?
            mock.increaseCalled();
            return mock;
        }
    }

    mockRequest(url, options) {
        const mockOptions = Object.assign({}, options);
        this._removeExactMocks(url, options);
        const mock = new RequestMock(url, mockOptions);
        this._mockedRequests.push(mock);
        return mock;
    }

    removeMock(url, options) {
        this._mockedRequests = this._mockedRequests.filter((m) => {
            return !this._matchMock(m, url, options);
        });
    }

    clear() {
        this._mockedRequests = [];
    }

    _removeExactMocks(url, options) {
        const method = options.method;
        const queryString = options.queryString;
        this._mockedRequests = this._mockedRequests.filter((m) => {
            const same = m.url === url && method === m.method && queryString === m.queryString;
            return !same;
        });
    }

    _getMock(url, options) {
        let matchedMock = null;
        for(const m of this._mockedRequests) {
            if(this._matchMock(m, url, options) && this._hasHigherPriority(m, matchedMock)) {
                matchedMock = m;
            }
        }
        return matchedMock;
    }

    _matchMock(mock, url, options) {
        if(!utils.matchText(url, mock.url)) return false;
        if(mock.method && options.method !== mock.method) return false;
        if(mock.queryString && !utils.compareObjects(options.queryString, mock.queryString)) return false;
        return true;
    }

    // Priority is: Method > URL > QueryString
    _hasHigherPriority(m1, m2) {
        const existsPriority = this._checkElementPriority(m1, m2);
        if(existsPriority !== null) return existsPriority;
        const methodPriority = this._checkElementPriority(m1.method, m2.method);
        if(methodPriority !== null) return methodPriority;
        const urlPriority = this._checkElementPriority(!(m1.url instanceof RegExp), !(m2.url instanceof RegExp));
        if(urlPriority !== urlPriority) return urlPriority;
        return Boolean(this._checkElementPriority(m1.queryString, m2.queryString));

    }

    _checkElementPriority(e1, e2) {
        e1 = Boolean(e1);
        e2 = Boolean(e2);
        if(e1 && !e2) return true;
        if(!e1 && e2) return false;
        else return null;
    }
};
