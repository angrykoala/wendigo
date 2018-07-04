"use strict";

const URL = require('url').URL;
const utils = require('./utils');
const RequestMock = require('./models/request_mock');




module.exports = class RequestMocker {
    constructor() {
        this._mockedRequests = [];
    }

    getMockedResponse(request) {
        const url = new URL(request.url());
        const method = request.method();
        const mock = this._getMock(`${url.origin}${url.pathname}`, {
            method: method,
            queryString: url.search ? utils.parseQueryString(url) : undefined
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
