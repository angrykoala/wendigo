"use strict";

const RequestFilter = require('../request_filter');
const RequestMocker = require('../request_mocker');
const BrowserModule = require('./browser_module');
const utils = require('../utils');

module.exports = class BrowserRequests extends BrowserModule {
    constructor(browser) {
        super(browser);
        this._requestMocker = new RequestMocker();
        this._requests = [];
        this._interceptorReady = false;
        this.clearRequests();
    }

    get all() {
        return this._requests;
    }

    get filter() {
        return new RequestFilter(Promise.resolve(this._requests));
    }

    mock(url, options) {
        return this._requestMocker.mockRequest(url, options);
    }

    removeMock(url, options) {
        this._requestMocker.removeMock(url, options);
    }

    clearRequests() {
        this._requests = [];
    }

    clearMocks() {
        this._requestMocker.clear();
    }

    _beforeOpen(options) {
        if (options.clearRequestMocks) this.clearMocks();
        this.clearRequests();
        if (this._interceptorReady) return Promise.resolve();
        return this._startRequestInterceptor();
    }

    _beforeClose() {
        this.clearMocks();
        this.clearRequests();
    }

    _respondWithMock(request, mock) {
        mock.onRequest();
        if (mock.auto && mock.immediate) {
            return request.respond(mock.response);
        } else if (mock.auto) {
            return utils.delay(mock.delay).then(() => {
                return request.respond(mock.response);
            });
        } else {
            mock.onTrigger(() => {
                return request.respond(mock.response);
            });
        }
    }

    _startRequestInterceptor() {
        this._interceptorReady = true;
        return this._browser.page.setRequestInterception(true).then(() => {
            return this._browser.page.on('request', request => {
                this._requests.push(request);
                const mock = this._requestMocker.getMockedResponse(request);
                if (mock) {
                    return this._respondWithMock(request, mock);
                } else {
                    return request.continue();
                }
            });
        });
    }
};
