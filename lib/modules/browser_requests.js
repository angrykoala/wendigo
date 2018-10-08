"use strict";

const RequestFilter = require('../request_filter');
const RequestMocker = require('../request_mocker');

module.exports = class BrowserRequests {
    constructor(browser) {
        this._browser = browser;
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

    _startRequestInterceptor() {
        this._interceptorReady = true;
        return this._browser.page.setRequestInterception(true).then(() => {
            return this._browser.page.on('request', request => {
                this._requests.push(request);
                const mock = this._requestMocker.getMockedResponse(request);
                if (mock) {
                    return mock.onRequest(request);
                } else {
                    return request.continue();
                }
            });
        });
    }
};
