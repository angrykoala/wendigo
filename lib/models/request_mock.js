"use strict";

const EventEmitter = require('events');
const URL = require('url').URL;

const ErrorFactory = require('../errors/error_factory');
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
        if(options.queryString || typeof options.queryString === "string") this.queryString = utils.parseQueryString(options.queryString);
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
                this.queryString = utils.parseQueryString(url);
            }
        }
    }
};
