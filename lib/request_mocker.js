"use strict";

const RequestMethods = {
    ALL: "ALL"
};

const EventEmitter = require('events');

const ErrorFactory = require('./errors/error_factory');


class RequestMock {
    constructor(url, options) {
        this.url = url;
        this._response = {
            status: options.status,
            headers: options.headers,
            contentType: options.contentType,
            body: this._processBody(options.body)
        };
        this.delay = options.delay || 0;
        this._timesCalled = 0;
        this._auto = options.auto !== false;
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
        if(this.auto) throw ErrorFactory.generateFatalError(`Cannot trigger auto request mock.`)
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
}


module.exports = class RequestMocker {
    constructor() {
        this._mockedRequests = new Map();
    }

    getMockedResponse(request) {
        const url = request.url();
        const method = request.method();
        return this._getMock(url, method);
    }

    mockRequest(url, response, method = RequestMethods.ALL) {
        const mockData = this._mockedRequests.get(url) || {};
        const mock = new RequestMock(url, response);
        mockData[method] = mock;
        this._mockedRequests.set(url, mockData);
        return mock;
    }

    removeMock(url, method = RequestMethods.ALL) {
        const mockData = this._mockedRequests.get(url) || {};
        delete mockData[method];
    }

    clear() {
        this._mockedRequests.clear();
    }

    _getMock(url, method = RequestMethods.ALL) {
        const mockData = this._mockedRequests.get(url) || {};
        const mock = mockData[method] || mockData[RequestMethods.ALL];
        if(mock) {
            mock.increaseCalled();
            return mock;
        }
    }

};
