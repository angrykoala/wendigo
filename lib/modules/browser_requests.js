"use strict";

const RequestFilter = require('../request_filter');
const RequestMocker = require('../request_mocker');
const BrowserModule = require('./browser_module');

module.exports = class BrowserRequests extends BrowserModule {
    constructor(browser) {
        super(browser);
        this._requestMocker = new RequestMocker();
        this._requests = new RequestFilter();
        this._interceptorReady = false;
        this.clearRequests();
    }

    get all() {
        return this._requests._requests;
    }

    get filter() {
        return this._requests;
    }

    mock(url, response, method) {
        this._requestMocker.mockRequest(url, response, method);
    }

    removeMock(url, method) {
        this._requestMocker.removeMock(url, method);
    }

    clearRequests() {
        this._requests._clear();
    }

    clearMocks() {
        this._requestMocker.clear();
    }

    _beforeOpen() {
        this.clearMocks();
        this.clearRequests();
        if(this._interceptorReady) return Promise.resolve();
        return this._startRequestInterceptor();
    }

    _startRequestInterceptor() {
        this._interceptorReady = true;
        return this._browser.page.setRequestInterception(true).then(() => {
            return this._browser.page.on('request', request => {
                this._requests._requests.push(request);
                const mockedResponse = this._requestMocker.getMockedResponse(request);
                if(mockedResponse) {
                    return request.respond(mockedResponse);
                } else{
                    return request.continue();
                }
            });
        });
    }
};
